import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = process.env.PORT || 3000;
const PRIMARY_GEMINI_MODEL = 'gemini-4-hydrogen';
const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';
let primaryModelCooldownUntil = 0;

const SUPPORTED_INLINE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

app.use(express.json({ limit: '25mb' }));

// Lazy init Gemini client with User-Agent header and bounded network timeout
function getGenAI(timeoutMs = 25000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientOrQuotaError(err: any): boolean {
  const status = Number(err?.status || err?.code);
  if (status === 429 || status === 503 || status === 500 || status === 504) {
    return true;
  }
  const msg = String(err?.message || err || '');
  return (
    err?.name === 'AbortError' ||
    msg.includes('"code":503') ||
    msg.includes('"code":429') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('Deadline expired') ||
    msg.includes('timeout') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('fetch failed')
  );
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 1): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (!isTransientOrQuotaError(err) || attempt === maxRetries) {
        throw err;
      }
      const jitter = Math.floor(Math.random() * 200);
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt) + jitter));
    }
  }
  throw lastError;
}

async function generateContentWithFallback(requestParams: {
  contents: any;
  config: any;
}) {
  const now = Date.now();
  const usePrimary = now >= primaryModelCooldownUntil;

  if (usePrimary) {
    try {
      const primaryAi = getGenAI(15000);
      return await primaryAi.models.generateContent({
        model: PRIMARY_GEMINI_MODEL,
        contents: requestParams.contents,
        config: requestParams.config,
      });
    } catch (err: any) {
      if (!isTransientOrQuotaError(err)) {
        throw err;
      }
      const msg = String(err?.message || err || '');
      const isQuota = Number(err?.status) === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('"code":429');
      primaryModelCooldownUntil = Date.now() + (isQuota ? 15 * 60 * 1000 : 3 * 60 * 1000);
    }
  }

  const fallbackAi = getGenAI(28000);
  return await withRetry(
    () =>
      fallbackAi.models.generateContent({
        model: FALLBACK_GEMINI_MODEL,
        contents: requestParams.contents,
        config: requestParams.config,
      }),
    1
  );
}

function safeParseJson(rawText: string | undefined): any {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    throw new Error('AI model returned an empty response.');
  }
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

function getApiErrorStatusAndMessage(error: any, fallbackMessage: string) {
  const rawMessage = error?.message || String(error);
  let parsedMessage = rawMessage;
  let embeddedCode: number | undefined;
  let embeddedStatus: string | undefined;

  try {
    const jsonStart = rawMessage.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(rawMessage.slice(jsonStart));
      if (parsed?.error?.message) parsedMessage = parsed.error.message;
      if (parsed?.error?.code) embeddedCode = Number(parsed.error.code);
      if (parsed?.error?.status) embeddedStatus = String(parsed.error.status);
    }
  } catch {
    // Keep rawMessage when not embedded JSON
  }

  const statusCode = Number(error?.status || embeddedCode || 0);

  if (rawMessage.includes('GEMINI_API_KEY')) {
    return { status: 500, error: rawMessage };
  }
  if (statusCode === 400 && (rawMessage.includes('Unsupported') || rawMessage.includes('MIME'))) {
    return { status: 400, error: parsedMessage };
  }
  if (
    statusCode === 403 ||
    embeddedStatus === 'PERMISSION_DENIED' ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID')
  ) {
    return {
      status: 403,
      error: 'Gemini API key is invalid or lacks permission. Please verify GEMINI_API_KEY in Settings > Secrets.',
      details: parsedMessage,
    };
  }
  if (
    statusCode === 429 ||
    embeddedStatus === 'RESOURCE_EXHAUSTED' ||
    rawMessage.includes('RESOURCE_EXHAUSTED')
  ) {
    return {
      status: 429,
      error: 'AI service rate limit exceeded. Please wait briefly and try again.',
      details: parsedMessage,
    };
  }
  if (
    error?.name === 'AbortError' ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('ETIMEDOUT') ||
    statusCode === 504
  ) {
    return {
      status: 504,
      error: 'The AI model request timed out due to upstream latency. Please try again.',
      details: parsedMessage,
    };
  }
  if (
    statusCode === 503 ||
    embeddedStatus === 'UNAVAILABLE' ||
    rawMessage.includes('UNAVAILABLE') ||
    rawMessage.includes('high demand')
  ) {
    return {
      status: 503,
      error: 'The AI model is temporarily experiencing high demand. Please retry in a few seconds.',
      details: parsedMessage,
    };
  }
  return {
    status: 500,
    error: fallbackMessage,
    details: parsedMessage,
  };
}

function inferMimeFromFilename(fileName?: string): string {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.txt')) return 'text/plain';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

function dataUrlToGeminiPart(fileDataUrl: string, fileName?: string) {
  const base64Match = fileDataUrl.match(/^data:([^;]*)(?:;charset=[^;,]*)?;base64,(.+)$/i);
  if (base64Match) {
    let mimeType = base64Match[1].trim().toLowerCase();
    const base64Data = base64Match[2];

    if (!mimeType || mimeType === 'application/octet-stream') {
      mimeType = inferMimeFromFilename(fileName);
    }

    if (mimeType === 'image/svg+xml' || mimeType.startsWith('text/')) {
      const decodedText = Buffer.from(base64Data, 'base64').toString('utf8');
      return {
        part: {
          text: `Uploaded illustrative/text file (${fileName || 'file'}, ${mimeType}):\n${decodedText.slice(0, 30000)}`,
        },
        mimeType,
      };
    }

    if (!SUPPORTED_INLINE_MIME_TYPES.has(mimeType)) {
      const err: any = new Error(
        `Unsupported file format (${mimeType}) for ${fileName || 'upload'}. Please upload PNG, JPEG, WEBP, HEIC, or PDF.`
      );
      err.status = 400;
      throw err;
    }

    return {
      part: { inlineData: { mimeType, data: base64Data } },
      mimeType,
    };
  }

  // Handle non-base64 data URLs (e.g. data:image/svg+xml;utf8,<svg...>)
  const nonBase64Match = fileDataUrl.match(/^data:([^;,]+)(?:;[^,]*)?,([\s\S]+)$/);
  if (nonBase64Match) {
    const mimeType = nonBase64Match[1].trim().toLowerCase();
    const rawPayload = nonBase64Match[2];
    let decodedText = rawPayload;
    try {
      decodedText = decodeURIComponent(rawPayload);
    } catch {
      decodedText = rawPayload;
    }
    return {
      part: {
        text: `Uploaded illustrative/text file (${fileName || 'file'}, ${mimeType}):\n${decodedText.slice(0, 30000)}`,
      },
      mimeType,
    };
  }

  // Fallback for raw base64 without data: prefix
  const inferredMime = inferMimeFromFilename(fileName);
  const safeMime = SUPPORTED_INLINE_MIME_TYPES.has(inferredMime) ? inferredMime : 'image/png';
  return {
    part: { inlineData: { mimeType: safeMime, data: fileDataUrl } },
    mimeType: safeMime,
  };
}

const CLINICAL_MRI_SYSTEM_PROMPT = `You are MediExplain.AI, an AI-assisted medical imaging and clinical decision-support system designed to support doctors and radiologists.

Your primary responsibility is to analyze uploaded brain MRI images (and any accompanying clinical vitals/labs/scans) carefully and provide accurate, evidence-based, transparent explanations.

1. Image Examination
- Examine the actual uploaded image(s) before generating any findings.
- Identify the available MRI sequences (T1, T2, FLAIR, DWI, ADC, SWI/GRE) ONLY when they can be reliably identified from the image itself.
- If the image is unclear, incomplete, low-resolution, a single screenshot, synthetic/diagrammatic, or missing important sequences, explicitly mention this limitation.
- Never assume that all MRI sequences are available.

2. Clinical Finding Detection
Evaluate the visible evidence for:
- Acute ischemic infarction
- Chronic small-vessel ischemic changes
- White-matter abnormalities
- Cerebral atrophy
- Ventricular enlargement
- Cerebral microbleeds
- Hemorrhage
- Other visible abnormalities
Do NOT report a condition unless the supplied image (or clinical data) provides sufficient supporting evidence.

3. Acute Stroke Detection
- Do NOT diagnose acute ischemic stroke based only on nonspecific white-matter hyperintensity.
- Look for DWI hyperintensity AND corresponding ADC hypointensity in the same anatomical region before suggesting restricted diffusion.
- Identify the affected vascular territory ONLY when supported by the actual imaging.
- Do NOT claim left MCA infarction without identifiable supporting evidence.
- If DWI or ADC images are unavailable, state that acute infarction cannot be reliably confirmed from the supplied images.

4. Explainable AI (XAI)
- SHAP: Show the contribution of available model features ONLY when actual quantitative tabular/clinical features are supplied and evaluated.
- LIME: Explain the local prediction using a valid interpretable surrogate ONLY when applicable.
- Decision Tree: Display the actual decision path used only when clear clinical cutoffs apply.
- Image explanation (ROI): Highlight only actual visible image regions influencing the assessment.
- NEVER fabricate SHAP values, LIME explanations, decision paths, or highlighted regions.
- If an explanation method is unavailable or cannot be computed validly (e.g., from an incomplete screenshot alone), set its availability flag to false, leave fabricated arrays empty, and explicitly state why it is unavailable.

5. Prediction and Confidence
- Provide a prediction only when sufficient evidence is present.
- Distinguish model confidence from actual clinical disease probability.
- NEVER automatically equate a high model confidence score with the same clinical chance of disease.
- If evidence is insufficient, return "Inconclusive – Additional Imaging Required" (and set isInconclusive: true).
- Do not force every patient into a disease category.

6. Severity Classification
Use strictly:
- Low: No significant abnormality identified in the supplied image/data.
- Moderate: Abnormal findings requiring clinical review.
- High: Significant abnormality requiring prompt medical assessment.
- Critical: Potential emergency findings requiring immediate clinical assessment.
Severity must be based on actual findings, never simply the prediction score.

7. Medical Safety
- Never invent radiological findings.
- Never provide a definitive diagnosis from an incomplete MRI screenshot.
- Do not hide uncertainty or exaggerate severity.
- Do not approve treatment automatically.
- Recommend radiologist and neurologist review when appropriate.
- If acute stroke or brain hemorrhage is suspected, recommend immediate emergency medical assessment and set emergencyAlert: true.
- Accuracy is more important than producing a confident prediction.`;

const CLINICAL_MRI_REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    imageQualityAndSequences: {
      type: Type.STRING,
      description: '1. Image Quality and Available Sequences (note resolution, completeness, missing sequences)',
    },
    identifiedSequences: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Only reliably identified MRI sequences e.g. T1, T2, FLAIR, DWI, ADC, SWI/GRE, or empty if unidentifiable',
    },
    observedMriFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2. Observed MRI Findings grounded strictly in visible evidence',
    },
    suspectedClinicalCondition: {
      type: Type.STRING,
      description: '3. Suspected Clinical Condition or "Inconclusive – Additional Imaging Required"',
    },
    supportingImagingEvidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4. Supporting Imaging Evidence directly observed',
    },
    missingOrUncertainEvidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '5. Missing or Uncertain Evidence (e.g. missing DWI/ADC sequences, low resolution)',
    },
    aiPredictionAndConfidence: {
      type: Type.STRING,
      description: '6. AI Prediction and Model Confidence (explicitly distinguishing model confidence vs clinical probability)',
    },
    clinicalLikelihoodNote: {
      type: Type.STRING,
      description: 'Explicit statement distinguishing model confidence score from actual clinical disease probability',
    },
    shapExplanationText: {
      type: Type.STRING,
      description: '7. SHAP Explanation (or explicit statement if unavailable / cannot be computed validly)',
    },
    shapAvailable: { type: Type.BOOLEAN },
    limeExplanationText: {
      type: Type.STRING,
      description: '8. LIME Explanation (or explicit statement if unavailable / cannot be computed validly)',
    },
    limeAvailable: { type: Type.BOOLEAN },
    decisionTreeExplanationText: {
      type: Type.STRING,
      description: '9. Decision Tree Explanation (or explicit statement if unavailable / cannot be computed validly)',
    },
    decisionTreeAvailable: { type: Type.BOOLEAN },
    roiAnalysis: {
      type: Type.STRING,
      description: '10. Region of Interest (ROI) Analysis (or explicit statement if no localized region can be reliably isolated)',
    },
    roiAvailable: { type: Type.BOOLEAN },
    severityAssessment: {
      type: Type.STRING,
      description: '11. Severity Assessment rationale based on actual findings',
    },
    severityLevel: {
      type: Type.STRING,
      description: 'Low, Moderate, High, or Critical',
    },
    recommendedClinicalFollowUp: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '12. Recommended Clinical Follow-up (radiologist/neurologist review, additional sequences, or emergency evaluation)',
    },
    emergencyAlert: {
      type: Type.BOOLEAN,
      description: 'True only if acute stroke or brain hemorrhage is genuinely suspected from visible evidence',
    },
  },
};

function normalizeClinicalMriReport(raw: any, fallbackSeverity: 'Low' | 'Moderate' | 'High' | 'Critical') {
  if (!raw || typeof raw !== 'object') return undefined;
  const sev = ['Low', 'Moderate', 'High', 'Critical'].includes(raw.severityLevel)
    ? raw.severityLevel
    : fallbackSeverity;
  return {
    imageQualityAndSequences:
      raw.imageQualityAndSequences ||
      'Image quality and MRI sequences could not be fully verified from the supplied file.',
    identifiedSequences: Array.isArray(raw.identifiedSequences) ? raw.identifiedSequences : [],
    observedMriFindings: Array.isArray(raw.observedMriFindings) ? raw.observedMriFindings : [],
    suspectedClinicalCondition:
      raw.suspectedClinicalCondition || 'Inconclusive – Additional Imaging Required',
    supportingImagingEvidence: Array.isArray(raw.supportingImagingEvidence)
      ? raw.supportingImagingEvidence
      : [],
    missingOrUncertainEvidence: Array.isArray(raw.missingOrUncertainEvidence)
      ? raw.missingOrUncertainEvidence
      : ['Complete multi-sequence MRI study (T1, T2, FLAIR, DWI, ADC, SWI) not confirmed.'],
    aiPredictionAndConfidence:
      raw.aiPredictionAndConfidence ||
      'Inconclusive – Additional Imaging Required. Model confidence does not equate to clinical disease probability.',
    clinicalLikelihoodNote:
      raw.clinicalLikelihoodNote ||
      'Model confidence reflects alignment with visible features and is distinct from clinical disease probability.',
    shapExplanationText:
      raw.shapExplanationText ||
      'SHAP feature attributions are unavailable without validated quantitative clinical/radiomic features.',
    shapAvailable: Boolean(raw.shapAvailable),
    limeExplanationText:
      raw.limeExplanationText ||
      'LIME local surrogate explanation is unavailable for incomplete image-only inputs.',
    limeAvailable: Boolean(raw.limeAvailable),
    decisionTreeExplanationText:
      raw.decisionTreeExplanationText ||
      'Decision Tree traversal path is unavailable without confirmed multi-sequence or quantitative criteria.',
    decisionTreeAvailable: Boolean(raw.decisionTreeAvailable),
    roiAnalysis:
      raw.roiAnalysis ||
      'No specific Region of Interest can be reliably isolated from the supplied image.',
    roiAvailable: Boolean(raw.roiAvailable),
    severityAssessment:
      raw.severityAssessment || 'Severity cannot be definitively graded without complete clinical and imaging correlation.',
    severityLevel: sev as 'Low' | 'Moderate' | 'High' | 'Critical',
    recommendedClinicalFollowUp: Array.isArray(raw.recommendedClinicalFollowUp)
      ? raw.recommendedClinicalFollowUp
      : ['Recommend licensed radiologist and neurologist review alongside complete multi-sequence MRI.'],
    emergencyAlert: Boolean(raw.emergencyAlert),
  };
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'MediExplain AI Server', timestamp: new Date().toISOString() });
});

// AI Disease Diagnosis & XAI Generation Route
app.post('/api/diagnosis', async (req: Request, res: Response) => {
  try {
    const { vitals, uploadedDocsSummary, attachedImages } = req.body;
    if (!vitals) {
      return res.status(400).json({ error: 'Missing patient vitals data.' });
    }

    const imageList = Array.isArray(attachedImages)
      ? attachedImages.filter((img: any) => typeof img?.dataUrl === 'string' && img.dataUrl.length > 0)
      : [];
    const hasImages = imageList.length > 0;

    const userPrompt = `Analyze the following patient profile${hasImages ? ' and the ACTUAL attached medical image(s)' : ''} and produce a transparent, strictly evidence-based Explainable AI (XAI) clinical assessment:

Patient Demographics & Vitals:
- Patient Name: ${vitals.patientName || 'Anonymous Patient'}
- Age: ${vitals.age} years old
- Gender: ${vitals.gender}
- Weight: ${vitals.weightKg} kg, Height: ${vitals.heightCm} cm (BMI: ${vitals.bmi})
- Blood Pressure: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg
- Heart Rate: ${vitals.heartRateBpm} bpm
- Blood Sugar: ${vitals.bloodSugarMgDl} mg/dL (HbA1c: ${vitals.hba1cPercent || 'N/A'}%)
- Total Cholesterol: ${vitals.cholesterolMgDl} mg/dL (HDL: ${vitals.hdlMgDl || 'N/A'}, LDL: ${vitals.ldlMgDl || 'N/A'}, Triglycerides: ${vitals.triglyceridesMgDl || 'N/A'})
- Symptoms: ${vitals.symptoms?.join(', ') || 'None reported'}
- Medical History: ${vitals.medicalHistory?.join(', ') || 'None'}
- Family History: ${vitals.familyHistory?.join(', ') || 'None'}
- Lifestyle: Smoking (${vitals.smoking}), Alcohol (${vitals.alcohol}), Exercise (${vitals.exerciseLevel})
${uploadedDocsSummary ? `\nAttached Documents & Prior Notes:\n${uploadedDocsSummary}` : ''}

Instructions:
${
  hasImages
    ? `- Examine the actual attached image(s) directly before generating findings.
- Populate clinicalMriReport with all 12 clinical assessment sections accurately.
- If MRI sequences (especially DWI and ADC) are missing, unclear, or the image is incomplete, explicitly state this in missingOrUncertainEvidence and do NOT claim acute stroke or left MCA infarction without direct supporting evidence.
- If imaging evidence is insufficient, return "Inconclusive – Additional Imaging Required" and set isInconclusive: true.`
    : `- Evaluate the quantitative clinical vitals and biomarkers transparently.
- Include featureImportances, decisionTreePath, riskFactorRanking, and baselineComparison grounded ONLY in the provided clinical values.`
}
- Distinguish model confidenceScore from clinical probabilityPercent / probabilitySummary (never equate confidence with disease probability).
- Never fabricate XAI explanations, values, or ROI findings that are unavailable.`;

    const contentParts: any[] = [];
    for (const img of imageList) {
      const { part } = dataUrlToGeminiPart(img.dataUrl, img.fileName);
      contentParts.push(part);
    }
    contentParts.push({ text: userPrompt });

    const response = await generateContentWithFallback({
      contents: hasImages ? { parts: contentParts } : userPrompt,
      config: {
        systemInstruction: CLINICAL_MRI_SYSTEM_PROMPT,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              diseaseName: {
                type: Type.STRING,
                description: 'Primary suspected condition or "Inconclusive – Additional Imaging Required"',
              },
              isInconclusive: {
                type: Type.BOOLEAN,
                description: 'True when available evidence is insufficient for a reliable condition prediction',
              },
              probabilityPercent: {
                type: Type.NUMBER,
                description: 'Estimated clinical risk likelihood percentage (0-100), distinct from model confidence; 0 if inconclusive',
              },
              probabilitySummary: {
                type: Type.STRING,
                description: 'Plain-language distinction between clinical disease probability and model confidence score',
              },
              severityLevel: { type: Type.STRING, description: 'Low, Moderate, High, or Critical' },
              confidenceScore: {
                type: Type.NUMBER,
                description: 'Model confidence score (0-100) reflecting clarity of evidence, distinct from disease probability',
              },
              riskCategory: {
                type: Type.STRING,
                description: 'Elevated Risk, High Priority, Borderline, Low Risk, or Inconclusive',
              },
              recommendedNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Evidence-based clinical follow-up steps for radiologist/physician review',
              },
              xaiExplanation: {
                type: Type.OBJECT,
                properties: {
                  overallRiskScore: { type: Type.NUMBER },
                  confidenceScore: { type: Type.NUMBER },
                  shapSummary: { type: Type.STRING },
                  limeTextExplanation: { type: Type.STRING },
                  featureImportances: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        feature: { type: Type.STRING },
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        shapValue: { type: Type.NUMBER },
                        percentageImpact: { type: Type.NUMBER },
                        category: { type: Type.STRING },
                        direction: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                    },
                  },
                  decisionTreePath: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        condition: { type: Type.STRING },
                        passed: { type: Type.BOOLEAN },
                        actualValue: { type: Type.STRING },
                        threshold: { type: Type.STRING },
                      },
                    },
                  },
                  riskFactorRanking: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        factor: { type: Type.STRING },
                        impactLevel: { type: Type.STRING },
                        contribution: { type: Type.STRING },
                      },
                    },
                  },
                  baselineComparison: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        metric: { type: Type.STRING },
                        patientVal: { type: Type.NUMBER },
                        normalMin: { type: Type.NUMBER },
                        normalMax: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
              ...(hasImages ? { clinicalMriReport: CLINICAL_MRI_REPORT_SCHEMA } : {}),
            },
          },
        },
      });

    const parsedJson = safeParseJson(response.text);
    const isInconclusive = Boolean(parsedJson.isInconclusive);
    const rawProb = Number(parsedJson.probabilityPercent);
    const prob = Number.isFinite(rawProb) ? Math.min(100, Math.max(0, rawProb)) : 0;
    const rawConf = Number(parsedJson.confidenceScore);
    const conf = Number.isFinite(rawConf) ? Math.min(100, Math.max(0, rawConf)) : 0;
    const xai = parsedJson.xaiExplanation || {};

    const normalizedSeverity: 'Low' | 'Moderate' | 'High' | 'Critical' = [
      'Low',
      'Moderate',
      'High',
      'Critical',
    ].includes(parsedJson.severityLevel)
      ? parsedJson.severityLevel
      : 'Moderate';

    const validCategories = ['Elevated Risk', 'High Priority', 'Borderline', 'Low Risk', 'Inconclusive'];
    const normalizedCategory = validCategories.includes(parsedJson.riskCategory)
      ? parsedJson.riskCategory
      : isInconclusive
        ? 'Inconclusive'
        : prob >= 70
          ? 'High Priority'
          : prob >= 45
            ? 'Elevated Risk'
            : 'Low Risk';

    const clinicalMriReport = hasImages
      ? normalizeClinicalMriReport(parsedJson.clinicalMriReport, normalizedSeverity)
      : undefined;

    const normalizedResult = {
      diseaseName:
        parsedJson.diseaseName ||
        (isInconclusive ? 'Inconclusive – Additional Imaging Required' : 'Clinical Assessment'),
      isInconclusive,
      probabilityPercent: prob,
      probabilitySummary:
        parsedJson.probabilitySummary ||
        `Clinical probability estimate (${prob}%) is distinct from model confidence (${conf}%).`,
      severityLevel: normalizedSeverity,
      confidenceScore: conf,
      riskCategory: normalizedCategory,
      recommendedNextSteps: Array.isArray(parsedJson.recommendedNextSteps)
        ? parsedJson.recommendedNextSteps
        : [],
      xaiExplanation: {
        overallRiskScore: Number.isFinite(Number(xai.overallRiskScore))
          ? Math.min(100, Math.max(0, Number(xai.overallRiskScore)))
          : prob,
        confidenceScore: Number.isFinite(Number(xai.confidenceScore))
          ? Math.min(100, Math.max(0, Number(xai.confidenceScore)))
          : conf,
        shapSummary:
          xai.shapSummary ||
          'SHAP attribution summary was not available or could not be computed validly for all inputs.',
        limeTextExplanation:
          xai.limeTextExplanation ||
          'LIME local surrogate explanation was not available for this assessment.',
        featureImportances: Array.isArray(xai.featureImportances) ? xai.featureImportances : [],
        decisionTreePath: Array.isArray(xai.decisionTreePath) ? xai.decisionTreePath : [],
        riskFactorRanking: Array.isArray(xai.riskFactorRanking) ? xai.riskFactorRanking : [],
        baselineComparison: Array.isArray(xai.baselineComparison) ? xai.baselineComparison : [],
      },
      ...(clinicalMriReport ? { clinicalMriReport } : {}),
    };

    return res.json({ success: true, result: normalizedResult });
  } catch (error: any) {
    console.error('Error in /api/diagnosis:', error);
    const errPayload = getApiErrorStatusAndMessage(error, 'Failed to execute AI diagnosis prediction.');
    return res.status(errPayload.status).json(errPayload);
  }
});

// AI Medical File Parser (OCR & Multimodal MRI / Radiology Scan Analysis)
app.post('/api/upload-report', async (req: Request, res: Response) => {
  try {
    const { fileDataUrl, fileName, fileType } = req.body;
    if (!fileDataUrl) {
      return res.status(400).json({ error: 'Missing file data URL.' });
    }

    const { part, mimeType } = dataUrlToGeminiPart(fileDataUrl, fileName);

    const userPrompt = `Examine this actual uploaded medical file (${fileName}, declared category: ${fileType}, MIME: ${mimeType}).

If this is a brain MRI or medical imaging scan:
1. Examine the actual image carefully before generating any findings.
2. Identify available MRI sequences (T1, T2, FLAIR, DWI, ADC, SWI/GRE) ONLY when reliably identifiable; note image quality, completeness, and missing sequences.
3. Evaluate visible evidence for acute ischemic infarction, chronic small-vessel ischemic changes, white-matter abnormalities, cerebral atrophy, ventricular enlargement, microbleeds, hemorrhage, or other visible abnormalities — do NOT invent findings.
4. For acute stroke: require BOTH DWI hyperintensity AND corresponding ADC hypointensity in the same anatomical region; never claim left MCA infarction without identifiable evidence; state clearly if DWI/ADC are unavailable.
5. Distinguish model confidence from actual clinical disease probability. Return "Inconclusive – Additional Imaging Required" if evidence is insufficient.
6. Populate clinicalMriReport across all 12 required sections honestly, marking shapAvailable/limeAvailable/decisionTreeAvailable/roiAvailable as false if they cannot be validly computed from this file alone.

If this is a lab report/PDF, extract only clearly present numeric biomarkers into extractedVitals (omit missing metrics rather than guessing 0).`;

    const response = await generateContentWithFallback({
      contents: {
        parts: [part, { text: userPrompt }],
      },
      config: {
        systemInstruction: CLINICAL_MRI_SYSTEM_PROMPT,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              parsedSummary: {
                type: Type.STRING,
                description: 'Evidence-based clinical narrative summary of the uploaded document or scan',
              },
              aiScanNotes: {
                type: Type.STRING,
                description: 'Image quality, sequence availability, and safety limitation notes',
              },
              extractedVitals: {
                type: Type.OBJECT,
                properties: {
                  bloodSugarMgDl: { type: Type.NUMBER },
                  hba1cPercent: { type: Type.NUMBER },
                  cholesterolMgDl: { type: Type.NUMBER },
                  systolicBp: { type: Type.NUMBER },
                  diastolicBp: { type: Type.NUMBER },
                  heartRateBpm: { type: Type.NUMBER },
                },
              },
              radiologyFindings: {
                type: Type.OBJECT,
                properties: {
                  regionOfInterest: {
                    type: Type.STRING,
                    description: 'Identified ROI only when reliably localized, otherwise "Unlocalized / Insufficient Evidence"',
                  },
                  abnormalityScore: {
                    type: Type.NUMBER,
                    description: 'Model abnormality confidence (0-100) reflecting image clarity, NOT clinical disease probability',
                  },
                  impression: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  keyObservedFeatures: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
              clinicalMriReport: CLINICAL_MRI_REPORT_SCHEMA,
            },
          },
        },
      });

    const parsedJson = safeParseJson(response.text);
    const normalizedReport = normalizeClinicalMriReport(parsedJson.clinicalMriReport, 'Moderate');

    return res.json({
      success: true,
      analysis: {
        ...parsedJson,
        ...(normalizedReport ? { clinicalMriReport: normalizedReport } : {}),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/upload-report:', error);
    const errPayload = getApiErrorStatusAndMessage(error, 'Failed to analyze uploaded document.');
    return res.status(errPayload.status).json(errPayload);
  }
});

// AI Medical Assistant Chat Route
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userRole, patientContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const validMessages = messages.filter((m: any) => typeof m?.text === 'string' && m.text.trim().length > 0);
    const firstUserIndex = validMessages.findIndex((m: any) => m.sender === 'user');
    if (firstUserIndex === -1) {
      return res.status(400).json({ error: 'At least one user message is required.' });
    }

    const roleName =
      userRole === 'doctor'
        ? 'a licensed Physician / Radiologist'
        : userRole === 'student'
          ? 'a Medical Student / Resident'
          : 'a Patient';

    const systemInstruction = `You are MediExplain.AI Assistant, a transparent, evidence-based clinical decision-support medical AI interacting with ${roleName}.

Guidelines:
1. Explain diagnostic predictions, MRI findings, Explainable AI (XAI) metrics (SHAP, LIME, Decision Tree, ROI), vital signs, and limitations clearly and empathetically.
2. Never invent radiological findings, confirm acute stroke without DWI hyperintensity + corresponding ADC hypointensity, or equate model confidence directly with clinical disease probability.
3. Explicitly note uncertainty, missing MRI sequences, or unavailable XAI explanations when present.
4. Always include a short clinical disclaimer ("Note: MediExplain AI is a decision-support tool. Please consult a licensed physician or radiologist.").
5. If acute stroke or brain hemorrhage is suspected, immediately advise emergency medical evaluation.

Patient Context: ${patientContext ? JSON.stringify(patientContext) : 'Standard medical assistant query.'}`;

    const formattedContents = validMessages.slice(firstUserIndex).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await generateContentWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    return res.json({ success: true, reply: response.text || 'Unable to generate response.' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errPayload = getApiErrorStatusAndMessage(error, 'Failed to generate chat response.');
    return res.status(errPayload.status).json(errPayload);
  }
});

// Setup Vite server middleware in dev, or static server in prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(currentDir, 'index.html'))
      ? currentDir
      : path.resolve(currentDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`MediExplain AI Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
