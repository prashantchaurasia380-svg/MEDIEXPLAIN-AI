import React, { useState } from 'react';
import {
  Stethoscope,
  Upload,
  FileText,
  Activity,
  User,
  Heart,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Paperclip,
  Eye,
  Scan,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { PatientVitals, UploadedMedicalDoc } from '../types';
import { requestReportAnalysis } from '../services/api';
import { INITIAL_PATIENT_VITALS } from '../mock/medicalData';

// High-resolution SVG data URIs for sample illustrative scans
const SAMPLE_CHEST_XRAY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23090d16"/><path d="M120 80 Q 200 40 280 80 Q 320 200 280 320 Q 200 360 120 320 Q 80 200 120 80 Z" fill="%231a2333" stroke="%23334155" stroke-width="2"/><ellipse cx="150" cy="180" rx="45" ry="85" fill="%230f172a" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="4 2"/><ellipse cx="250" cy="180" rx="45" ry="85" fill="%230f172a" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="4 2"/><ellipse cx="255" cy="220" rx="25" ry="30" fill="%23ef4444" opacity="0.35"/><rect x="220" y="180" width="70" height="70" fill="none" stroke="%23f43f5e" stroke-width="2" stroke-dasharray="3 3"/><text x="225" y="175" fill="%23f43f5e" font-size="11" font-family="sans-serif" font-weight="bold">ROI: R. Lower Opacity</text><path d="M200 70 L200 330" stroke="%23475569" stroke-width="3" stroke-dasharray="6 4"/><path d="M130 110 Q200 130 270 110 M120 150 Q200 170 280 150 M120 190 Q200 210 280 190 M130 230 Q200 250 270 230" stroke="%23334155" stroke-width="2" fill="none"/><text x="115" y="375" fill="%2394a3b8" font-size="11" font-family="sans-serif" font-weight="bold">SAMPLE CHEST RADIOGRAPH (ILLUSTRATIVE)</text></svg>`;

const SAMPLE_BRAIN_MRI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23030712"/><circle cx="200" cy="200" r="150" fill="%23111827" stroke="%23374151" stroke-width="3"/><path d="M 200 60 C 120 60, 80 120, 80 200 C 80 280, 120 340, 200 340 C 280 340, 320 280, 320 200 C 320 120, 280 60, 200 60 Z" fill="%231e293b"/><path d="M 200 60 L 200 340" stroke="%23475569" stroke-width="2"/><circle cx="155" cy="175" r="24" fill="%23a855f7" opacity="0.35"/><rect x="120" y="140" width="70" height="70" fill="none" stroke="%23c084fc" stroke-width="2" stroke-dasharray="4 2"/><text x="108" y="132" fill="%23c084fc" font-size="10" font-family="sans-serif" font-weight="bold">Focal Signal Focus (Single Slice)</text><text x="82" y="375" fill="%2394a3b8" font-size="11" font-family="sans-serif" font-weight="bold">BRAIN AXIAL MRI (SINGLE-SLICE DEMO • NO ADC)</text></svg>`;

const SAMPLE_RETINAL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23180805"/><circle cx="200" cy="200" r="160" fill="%237c2d12" stroke="%239a3412" stroke-width="4"/><circle cx="130" cy="200" r="25" fill="%23fde047" opacity="0.8"/><circle cx="240" cy="200" r="15" fill="%23451a03"/><path d="M130 200 Q180 140 280 120 M130 200 Q190 260 290 280 M130 200 Q200 190 310 200" stroke="%23dc2626" stroke-width="3" fill="none"/><circle cx="210" cy="170" r="4" fill="%23facc15"/><circle cx="225" cy="180" r="3" fill="%23facc15"/><circle cx="230" cy="165" r="5" fill="%23ef4444"/><rect x="195" y="150" width="50" height="45" fill="none" stroke="%23facc15" stroke-width="2" stroke-dasharray="3 2"/><text x="180" y="142" fill="%23facc15" font-size="10" font-family="sans-serif" font-weight="bold">ROI: Microaneurysms</text><text x="95" y="380" fill="%23fdba74" font-size="11" font-family="sans-serif" font-weight="bold">SAMPLE RETINAL FUNDUS (ILLUSTRATIVE)</text></svg>`;

interface PatientDiagnosisFormProps {
  onSubmitDiagnosis: (vitals: PatientVitals, uploadedDocs: UploadedMedicalDoc[]) => void;
  isLoading: boolean;
  initialVitals?: PatientVitals;
  initialDocs?: UploadedMedicalDoc[];
}

const NEUTRAL_PATIENT_VITALS: PatientVitals = {
  patientName: '',
  age: 40,
  gender: 'male',
  weightKg: 72,
  heightCm: 172,
  bmi: 24.3,
  systolicBp: 118,
  diastolicBp: 76,
  heartRateBpm: 72,
  bloodSugarMgDl: 92,
  hba1cPercent: 5.3,
  cholesterolMgDl: 175,
  symptoms: [],
  medicalHistory: [],
  familyHistory: [],
  smoking: 'never',
  alcohol: 'none',
  exerciseLevel: 'moderate',
};

export const PatientDiagnosisForm: React.FC<PatientDiagnosisFormProps> = ({
  onSubmitDiagnosis,
  isLoading,
  initialVitals,
  initialDocs,
}) => {
  const [vitals, setVitals] = useState<PatientVitals>(initialVitals || INITIAL_PATIENT_VITALS);
  const [symptomInput, setSymptomInput] = useState('');
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [familyHistoryInput, setFamilyHistoryInput] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedMedicalDoc[]>(initialDocs || []);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [docAnalysisMessage, setDocAnalysisMessage] = useState<string | null>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<'image' | 'document'>('image');

  // Auto calculate BMI
  const handleHeightWeightChange = (height: number, weight: number) => {
    const safeHeight = Number.isFinite(height) && height >= 0 ? height : 0;
    const safeWeight = Number.isFinite(weight) && weight >= 0 ? weight : 0;
    let bmiVal = vitals.bmi;
    if (safeHeight > 0 && safeWeight > 0) {
      const heightInMeters = safeHeight / 100;
      bmiVal = Number((safeWeight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    setVitals((prev) => ({ ...prev, heightCm: safeHeight, weightKg: safeWeight, bmi: bmiVal }));
  };

  // Add symptom tag
  const handleAddSymptom = (symptom: string) => {
    if (symptom && !vitals.symptoms.includes(symptom)) {
      setVitals((prev) => ({ ...prev, symptoms: [...prev.symptoms, symptom] }));
    }
    setSymptomInput('');
  };

  const handleRemoveSymptom = (symptom: string) => {
    setVitals((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((s) => s !== symptom),
    }));
  };

  // Attach 1-Click Sample Illustrative Scan
  const handleAttachSampleScan = (scanType: 'xray' | 'mri' | 'retinal') => {
    setIsParsingDoc(true);
    setDocAnalysisMessage(`Loading illustrative sample scan...`);

    setTimeout(() => {
      let newDoc: UploadedMedicalDoc;

      if (scanType === 'xray') {
        newDoc = {
          id: `doc-${Date.now()}`,
          fileName: 'Sample_Chest_XRay_Illustration.svg',
          fileType: 'xray',
          isImageBased: true,
          fileUrl: SAMPLE_CHEST_XRAY_SVG,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parsedSummary:
            'Illustrative chest radiograph schematic highlighting a focal opacity in the right lower lung zone. Upload an actual diagnostic DICOM/PNG/JPEG scan for live Gemini Vision analysis.',
          aiScanNotes: 'Illustrative demo diagram (not a patient diagnostic radiograph).',
          radiologyFindings: {
            regionOfInterest: 'Right Lower Lung Zone (Schematic)',
            impression: 'Illustrative opacity shown for demo; clinical correlation and real imaging required.',
            recommendation: 'Upload an actual patient chest X-ray image for real clinical assessment.',
            keyObservedFeatures: ['Right lower zone schematic opacity'],
          },
        };
      } else if (scanType === 'mri') {
        newDoc = {
          id: `doc-${Date.now()}`,
          fileName: 'Sample_Brain_Axial_MRI_SingleSlice.svg',
          fileType: 'mri',
          isImageBased: true,
          fileUrl: SAMPLE_BRAIN_MRI_SVG,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parsedSummary:
            'Single-slice illustrative brain MRI schematic without paired DWI/ADC, T1, T2, or FLAIR sequences. Acute infarction cannot be confirmed from an incomplete single-slice image.',
          aiScanNotes: 'Incomplete single-slice illustration: DWI and ADC sequences are unavailable.',
          radiologyFindings: {
            regionOfInterest: 'Focal Signal Area in Single Axial Schematic (Unconfirmed Territory)',
            impression: 'Inconclusive – Additional Imaging Required (missing DWI, ADC, FLAIR, T1, T2 sequences).',
            recommendation:
              'Obtain complete multi-sequence brain MRI (including DWI, ADC, FLAIR, T1, T2, SWI) and radiologist/neurologist review.',
            keyObservedFeatures: [
              'Single illustrative axial slice only',
              'DWI and ADC sequences unavailable — acute restricted diffusion cannot be confirmed',
            ],
          },
          clinicalMriReport: {
            imageQualityAndSequences:
              'Illustrative single-slice schematic. Standard diagnostic MRI sequences (T1, T2, FLAIR, DWI, ADC, SWI/GRE) are not present.',
            identifiedSequences: [],
            observedMriFindings: [
              'Single schematic focal signal highlight in one cerebral hemisphere; insufficient anatomical detail for sequence or tissue characterization.',
            ],
            suspectedClinicalCondition: 'Inconclusive – Additional Imaging Required',
            supportingImagingEvidence: [
              'Only a single illustrative schematic frame was supplied without volumetric or multi-sequence MRI data.',
            ],
            missingOrUncertainEvidence: [
              'DWI and paired ADC sequences are unavailable, so acute ischemic infarction cannot be confirmed.',
              'T1, T2, FLAIR, and SWI/GRE sequences are missing, preventing assessment of chronic small-vessel disease, hemorrhage, or microbleeds.',
            ],
            aiPredictionAndConfidence:
              'Inconclusive – Additional Imaging Required. No clinical disease probability is assigned from an incomplete schematic image.',
            clinicalLikelihoodNote:
              'Evidence is insufficient to assign a reliable clinical disease probability.',
            shapExplanationText:
              'SHAP explanation is unavailable because no validated multi-sequence radiomic or quantitative imaging features are present.',
            shapAvailable: false,
            limeExplanationText:
              'LIME local surrogate explanation is unavailable for an incomplete single-slice illustration.',
            limeAvailable: false,
            decisionTreeExplanationText:
              'Decision Tree traversal is unavailable because required sequence criteria (DWI hyperintensity + ADC hypointensity) cannot be evaluated.',
            decisionTreeAvailable: false,
            roiAnalysis:
              'Schematic focal highlight shown; definitive vascular territory localization cannot be verified without full multi-planar imaging.',
            roiAvailable: false,
            severityAssessment:
              'Moderate (Review Needed): Incomplete demo scan cannot rule out or confirm acute pathology; upload a real diagnostic MRI or seek clinical evaluation if acute symptoms exist.',
            severityLevel: 'Moderate',
            recommendedClinicalFollowUp: [
              'Upload an actual diagnostic brain MRI (ideally including DWI, ADC, FLAIR, T1, T2, SWI) for live AI-assisted imaging analysis.',
              'If a patient has acute neurological deficits, seek immediate emergency medical assessment and formal radiologist/neurologist review.',
            ],
            emergencyAlert: false,
          },
        };
      } else {
        newDoc = {
          id: `doc-${Date.now()}`,
          fileName: 'Sample_Retinal_Fundus_Illustration.svg',
          fileType: 'retinal',
          isImageBased: true,
          fileUrl: SAMPLE_RETINAL_SVG,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parsedSummary:
            'Illustrative retinal fundus schematic showing macular vascular markings. Upload a real fundus photograph for clinical evaluation.',
          aiScanNotes: 'Illustrative demo diagram (not a clinical fundus photograph).',
          radiologyFindings: {
            regionOfInterest: 'Macular Arcade Region (Schematic)',
            impression: 'Illustrative retinal schematic attached; real fundus imaging required for diagnosis.',
            recommendation: 'Confirm with formal dilated fundus exam and Optical Coherence Tomography (OCT).',
            keyObservedFeatures: ['Schematic macular vascular markers'],
          },
        };
      }

      setUploadedDocs((prev) => [...prev, newDoc]);
      setDocAnalysisMessage(`Attached ${newDoc.fileName} (illustrative sample).`);
      setIsParsingDoc(false);
    }, 250);
  };

  // Handle Single or Multiple File Uploads (e.g., DWI + ADC MRI slices) and AI Analysis
  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setIsParsingDoc(true);

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        setDocAnalysisMessage(`${file.name} exceeds 20 MB limit. Please upload a smaller image or PDF.`);
        continue;
      }

      setDocAnalysisMessage(`Examining ${file.name} with MediExplain.AI Vision Engine...`);

      const nameLower = file.name.toLowerCase();
      const isImage =
        file.type.startsWith('image/') ||
        nameLower.includes('xray') ||
        nameLower.includes('x-ray') ||
        nameLower.includes('mri') ||
        nameLower.includes('brain') ||
        nameLower.includes('ct') ||
        nameLower.includes('scan');

      let fileCategory: UploadedMedicalDoc['fileType'] = 'blood_report';
      if (nameLower.includes('mri') || nameLower.includes('brain') || nameLower.includes('flair') || nameLower.includes('dwi') || nameLower.includes('adc')) {
        fileCategory = 'mri';
      } else if (nameLower.includes('xray') || nameLower.includes('x-ray') || nameLower.includes('chest')) {
        fileCategory = 'xray';
      } else if (nameLower.includes('ct')) fileCategory = 'ct_scan';
      else if (nameLower.includes('retin') || nameLower.includes('eye')) fileCategory = 'retinal';
      else if (nameLower.includes('skin') || nameLower.includes('derm')) fileCategory = 'dermoscopy';
      else if (nameLower.endsWith('.pdf')) fileCategory = 'pdf_report';
      else if (isImage) fileCategory = 'mri';

      try {
        const base64 = await readFileAsDataUrl(file);
        const analysis = await requestReportAnalysis(base64, file.name, fileCategory);

        const newDoc: UploadedMedicalDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: file.name,
          fileType: fileCategory,
          isImageBased: isImage,
          fileUrl: isImage ? base64 : undefined,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parsedSummary: analysis.parsedSummary || 'Image/document examined by MediExplain.AI.',
          extractedVitals: analysis.extractedVitals,
          aiScanNotes: analysis.aiScanNotes,
          radiologyFindings: analysis.radiologyFindings,
          clinicalMriReport: analysis.clinicalMriReport,
        };

        setUploadedDocs((prev) => [...prev, newDoc]);

        if (analysis.extractedVitals) {
          const ev = analysis.extractedVitals;
          setVitals((prev) => ({
            ...prev,
            bloodSugarMgDl: typeof ev.bloodSugarMgDl === 'number' && ev.bloodSugarMgDl > 0 ? ev.bloodSugarMgDl : prev.bloodSugarMgDl,
            hba1cPercent: typeof ev.hba1cPercent === 'number' && ev.hba1cPercent > 0 ? ev.hba1cPercent : prev.hba1cPercent,
            cholesterolMgDl: typeof ev.cholesterolMgDl === 'number' && ev.cholesterolMgDl > 0 ? ev.cholesterolMgDl : prev.cholesterolMgDl,
            systolicBp: typeof ev.systolicBp === 'number' && ev.systolicBp > 0 ? ev.systolicBp : prev.systolicBp,
            diastolicBp: typeof ev.diastolicBp === 'number' && ev.diastolicBp > 0 ? ev.diastolicBp : prev.diastolicBp,
            heartRateBpm: typeof ev.heartRateBpm === 'number' && ev.heartRateBpm > 0 ? ev.heartRateBpm : prev.heartRateBpm,
          }));
        }

        setDocAnalysisMessage(`Examined ${file.name} successfully — evidence-based summary ready.`);
      } catch (err: any) {
        setDocAnalysisMessage(
          `Image pre-scan unavailable (${err?.message || 'server error'}); ${file.name} attached without fabricated findings.`
        );
        try {
          const base64 = await readFileAsDataUrl(file);
          const fallbackDoc: UploadedMedicalDoc = {
            id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            fileName: file.name,
            fileType: fileCategory,
            isImageBased: isImage,
            fileUrl: isImage ? base64 : undefined,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            parsedSummary: isImage
              ? 'Image attached without automated pre-scan findings.'
              : 'Document attached without automated extraction.',
          };
          setUploadedDocs((prev) => [...prev, fallbackDoc]);
        } catch {
          // File could not be read
        }
      }
    }

    setIsParsingDoc(false);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isParsingDoc || isLoading) return;
    onSubmitDiagnosis(vitals, uploadedDocs);
  };

  const handleResetForm = () => {
    setVitals(NEUTRAL_PATIENT_VITALS);
    setUploadedDocs([]);
    setSymptomInput('');
    setMedicalHistoryInput('');
    setFamilyHistoryInput('');
    setDocAnalysisMessage(null);
  };

  const presetDiabetic = () => {
    setVitals((prev) => ({
      ...INITIAL_PATIENT_VITALS,
      patientName: prev.patientName?.trim() || INITIAL_PATIENT_VITALS.patientName,
      bloodSugarMgDl: 178,
      hba1cPercent: 8.1,
      symptoms: ['Excessive thirst', 'Frequent urination', 'Fatigue'],
    }));
  };

  const presetHypertension = () => {
    setVitals((prev) => ({
      ...INITIAL_PATIENT_VITALS,
      patientName: prev.patientName?.trim() || INITIAL_PATIENT_VITALS.patientName,
      systolicBp: 162,
      diastolicBp: 98,
      cholesterolMgDl: 255,
      ldlMgDl: 168,
      symptoms: ['Morning headache', 'Occasional chest tightness', 'Dizziness'],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Evaluation & Multimodal AI Diagnostics</span>
          </div>
          <h1 className="text-2xl font-black text-white">Patient Diagnostics & Medical Input</h1>
          <p className="text-slate-400 text-xs mt-1">
            Enter patient vital signs, laboratory biomarkers, or upload medical images & scan reports for instant XAI prediction.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={presetDiabetic}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold transition-all"
          >
            Diabetic Profile
          </button>
          <button
            type="button"
            onClick={presetHypertension}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 text-xs font-semibold transition-all"
          >
            Cardiac / BP Profile
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New / Clear Patient</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Section 1: Demographics & Biometrics */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Patient Demographics & Biometrics</h2>
              <p className="text-xs text-slate-400">Basic physical parameters for body surface and metabolic scaling.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Patient Name</label>
              <input
                type="text"
                placeholder="e.g. Robert Miller"
                value={vitals.patientName || ''}
                onChange={(e) => setVitals({ ...vitals, patientName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age (Years)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={vitals.age}
                onChange={(e) => setVitals({ ...vitals, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
              <select
                value={vitals.gender}
                onChange={(e) => setVitals({ ...vitals, gender: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                min="20"
                max="300"
                value={vitals.weightKg}
                onChange={(e) => handleHeightWeightChange(vitals.heightCm, Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
              <input
                type="number"
                min="80"
                max="250"
                value={vitals.heightCm}
                onChange={(e) => handleHeightWeightChange(Number(e.target.value), vitals.weightKg)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">Calculated Body Mass Index (BMI):</span>
              <span className="text-xl font-black text-cyan-400">{vitals.bmi} kg/m²</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                vitals.bmi >= 30
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : vitals.bmi >= 25
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {vitals.bmi >= 30 ? 'Obese' : vitals.bmi >= 25 ? 'Overweight' : 'Normal Weight'}
            </span>
          </div>
        </div>

        {/* Section 2: Clinical Vitals & Lab Biomarkers */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Clinical Vitals & Blood Chemistry</h2>
              <p className="text-xs text-slate-400">Blood pressure, glycemic index, and lipid panel metrics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.systolicBp}
                onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal: &lt; 120 mmHg</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.diastolicBp}
                onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal: &lt; 80 mmHg</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Resting Heart Rate (BPM)</label>
              <input
                type="number"
                value={vitals.heartRateBpm}
                onChange={(e) => setVitals({ ...vitals, heartRateBpm: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal: 60 - 100 BPM</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fasting Blood Sugar (mg/dL)</label>
              <input
                type="number"
                value={vitals.bloodSugarMgDl}
                onChange={(e) => setVitals({ ...vitals, bloodSugarMgDl: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Diabetic Threshold: &gt;= 126 mg/dL</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">HbA1c Level (%)</label>
              <input
                type="number"
                step="0.1"
                value={vitals.hba1cPercent ?? ''}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    hba1cPercent: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 6.8"
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal: &lt; 5.7%, Diabetic: &gt;= 6.5%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                value={vitals.cholesterolMgDl}
                onChange={(e) => setVitals({ ...vitals, cholesterolMgDl: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Desirable: &lt; 200 mg/dL</p>
            </div>
          </div>
        </div>

        {/* Section 3: Symptoms & Medical History */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. Symptoms & Clinical Observations</h2>
              <p className="text-xs text-slate-400">Select active symptoms and medical history triggers.</p>
            </div>
          </div>

          {/* Symptom Tags */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Active Symptoms</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Frequent thirst', 'Fatigue', 'Chest discomfort', 'Shortness of breath', 'Morning headache', 'Dizziness', 'Blurred vision', 'Numbness in hands/feet'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() =>
                    vitals.symptoms.includes(sym) ? handleRemoveSymptom(sym) : handleAddSymptom(sym)
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    vitals.symptoms.includes(sym)
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {vitals.symptoms.includes(sym) ? '✓ ' : '+ '}
                  {sym}
                </button>
              ))}
            </div>

            {/* Custom Symptom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type additional custom symptom and press Add..."
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSymptom(symptomInput);
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSymptom(symptomInput)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>

            {/* Selected Symptoms list */}
            {vitals.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {vitals.symptoms.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950 text-cyan-200 border border-cyan-800 text-xs font-semibold"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(s)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Medical & Family History Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Medical History</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Atrial Fibrillation..."
                  value={medicalHistoryInput}
                  onChange={(e) => setMedicalHistoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = medicalHistoryInput.trim();
                      if (val && !vitals.medicalHistory.includes(val)) {
                        setVitals((prev) => ({ ...prev, medicalHistory: [...prev.medicalHistory, val] }));
                      }
                      setMedicalHistoryInput('');
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = medicalHistoryInput.trim();
                    if (val && !vitals.medicalHistory.includes(val)) {
                      setVitals((prev) => ({ ...prev, medicalHistory: [...prev.medicalHistory, val] }));
                    }
                    setMedicalHistoryInput('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              {vitals.medicalHistory.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {vitals.medicalHistory.map((mh) => (
                    <span
                      key={mh}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-700 text-[11px]"
                    >
                      <span>{mh}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setVitals((prev) => ({
                            ...prev,
                            medicalHistory: prev.medicalHistory.filter((item) => item !== mh),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Family History</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Stroke (Mother), Diabetes..."
                  value={familyHistoryInput}
                  onChange={(e) => setFamilyHistoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = familyHistoryInput.trim();
                      if (val && !vitals.familyHistory.includes(val)) {
                        setVitals((prev) => ({ ...prev, familyHistory: [...prev.familyHistory, val] }));
                      }
                      setFamilyHistoryInput('');
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = familyHistoryInput.trim();
                    if (val && !vitals.familyHistory.includes(val)) {
                      setVitals((prev) => ({ ...prev, familyHistory: [...prev.familyHistory, val] }));
                    }
                    setFamilyHistoryInput('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              {vitals.familyHistory.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {vitals.familyHistory.map((fh) => (
                    <span
                      key={fh}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-700 text-[11px]"
                    >
                      <span>{fh}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setVitals((prev) => ({
                            ...prev,
                            familyHistory: prev.familyHistory.filter((item) => item !== fh),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Smoking Status</label>
              <select
                value={vitals.smoking}
                onChange={(e) => setVitals({ ...vitals, smoking: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alcohol Intake</label>
              <select
                value={vitals.alcohol}
                onChange={(e) => setVitals({ ...vitals, alcohol: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="none">None / Rare</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Physical Exercise Level</label>
              <select
                value={vitals.exerciseLevel}
                onChange={(e) => setVitals({ ...vitals, exerciseLevel: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="sedentary">Sedentary (&lt; 30 mins/wk)</option>
                <option value="moderate">Moderate (90-150 mins/wk)</option>
                <option value="active">Active (&gt; 150 mins/wk)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Document & Medical Image Uploader (PROMINENTLY HIGHLIGHTED OPTION) */}
        <div className="space-y-6">
          {/* Mode Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveUploadTab('image')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
                activeUploadTab === 'image'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>✨ HIGHLIGHTED OPTION: Multimodal Image & Radiology Scan Report</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveUploadTab('document')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                activeUploadTab === 'document'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Standard Lab Document / PDF Report</span>
            </button>
          </div>

          {/* TAB 1: HIGHLIGHTED MULTIMODAL MEDICAL IMAGE & SCAN REPORT CONTAINER */}
          {activeUploadTab === 'image' && (
            <div className="bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border-2 border-purple-500/60 p-6 rounded-3xl space-y-6 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
              {/* Top Highlight Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/40 shadow-inner">
                    <Scan className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white tracking-tight">
                        Multimodal AI Medical Imaging & Scan Diagnostic Report
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                        ✨ Featured Vision AI
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/80 mt-0.5">
                      Upload Chest X-Rays, Brain MRIs, CT Scans, Retinal Fundus photos, or Dermoscopy images for spatial ROI lesion attribution and image-based risk reports.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1-Click Sample Radiological Scans */}
              <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-purple-500/20">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Illustrative Sample Scans (Or Upload Real MRI / DICOM Export Below):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Illustrative Schematic Previews</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAttachSampleScan('xray')}
                    className="p-3 bg-slate-900 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400 rounded-xl flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Scan className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Chest X-Ray (Sample)</div>
                      <div className="text-[10px] text-cyan-300/80">Illustrative Lung Opacity</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAttachSampleScan('mri')}
                    className="p-3 bg-slate-900 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400 rounded-xl flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Brain MRI (Sample)</div>
                      <div className="text-[10px] text-purple-300/80">Single-Slice (No DWI/ADC)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAttachSampleScan('retinal')}
                    className="p-3 bg-slate-900 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400 rounded-xl flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Retinal Fundus (Sample)</div>
                      <div className="text-[10px] text-amber-300/80">Illustrative Fundus View</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Custom Image Area */}
              <div className="relative border-2 border-dashed border-purple-500/40 hover:border-cyan-400 rounded-2xl p-6 text-center bg-slate-950/80 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/heic,image/heif,image/svg+xml"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3.5 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 text-cyan-300 rounded-full border border-purple-500/30 shadow-lg">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    Click or Drag & Drop Patient Medical Scan Image(s)
                  </div>
                  <p className="text-xs text-purple-200/70 max-w-md">
                    Upload PNG / JPEG / WEBP scan images (select multiple sequences such as DWI + ADC together). MediExplain.AI examines the actual images to produce an evidence-based XAI report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDARD DOCUMENT / PDF REPORT UPLOADER */}
          {activeUploadTab === 'document' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Standard Laboratory PDF & Document Parser</h2>
                  <p className="text-xs text-slate-400">Extract lipid panels, blood chemistry, and clinical notes from PDFs.</p>
                </div>
              </div>

              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    Click or drag & drop laboratory report PDF
                  </div>
                  <p className="text-xs text-slate-500">Supports PDF, PNG, JPG up to 25MB</p>
                </div>
              </div>
            </div>
          )}

          {/* File Processing & Completion Status Banner */}
          {isParsingDoc ? (
            <div className="p-4 bg-purple-950/80 border border-purple-500/40 rounded-2xl flex items-center gap-3 text-purple-200 text-xs shadow-lg animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-cyan-400" />
              <span className="font-semibold">{docAnalysisMessage}</span>
            </div>
          ) : docAnalysisMessage ? (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-lg ${
                docAnalysisMessage.toLowerCase().includes('unavailable') ||
                docAnalysisMessage.toLowerCase().includes('exceeds')
                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {docAnalysisMessage.toLowerCase().includes('unavailable') ||
                docAnalysisMessage.toLowerCase().includes('exceeds') ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span className="font-semibold">{docAnalysisMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setDocAnalysisMessage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Attached Documents & Image Scan Previews */}
          {uploadedDocs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Attached & Analyzed Medical Scans / Documents ({uploadedDocs.length}):</span>
              </h3>

              <div className="space-y-4">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      doc.isImageBased
                        ? 'bg-slate-950 border-purple-500/50 shadow-xl shadow-purple-950/20'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail / Icon */}
                        {doc.fileUrl ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-500/40 bg-black shrink-0">
                            <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-purple-500/10 pointer-events-none"></div>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-slate-900 text-cyan-400 rounded-xl border border-slate-800 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{doc.fileName}</span>
                            <span className="text-[10px] text-slate-400">({doc.uploadedAt})</span>
                            {doc.isImageBased && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[10px]">
                                ✨ Image & Radiology Scan
                              </span>
                            )}
                          </div>

                          {doc.parsedSummary && (
                            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                              {doc.parsedSummary}
                            </p>
                          )}

                          {doc.radiologyFindings && (
                            <div className="pt-2 text-xs space-y-1.5">
                              <div className="flex items-center gap-2 text-purple-300 font-semibold">
                                <span>Region of Interest:</span>
                                <span className="text-white font-mono bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                                  {doc.radiologyFindings.regionOfInterest || 'Anatomical Field'}
                                </span>
                                {doc.radiologyFindings.abnormalityScore !== undefined && (
                                  <span className="text-rose-400 font-bold font-mono">
                                    (Abnormality Score: {doc.radiologyFindings.abnormalityScore}%)
                                  </span>
                                )}
                              </div>

                              {doc.radiologyFindings.keyObservedFeatures && doc.radiologyFindings.keyObservedFeatures.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {doc.radiologyFindings.keyObservedFeatures.map((feat, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                                      • {feat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {doc.radiologyFindings || doc.extractedVitals || doc.clinicalMriReport ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                            AI Examined
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                            Attached
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                          title="Remove attached document"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isLoading || isParsingDoc}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-base shadow-xl shadow-cyan-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Computing Explainable AI & Image Report...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                <span>Generate Multimodal XAI Risk Prediction & Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
