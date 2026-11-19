import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  BarChart3,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  ListOrdered,
  Download,
  Stethoscope,
  Activity,
  Scan,
  Eye,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react';
import { DiseasePrediction, PatientVitals, UploadedMedicalDoc } from '../types';

interface XAIBreakdownViewProps {
  prediction: DiseasePrediction;
  patientVitals?: PatientVitals;
  uploadedDocs?: UploadedMedicalDoc[];
  onOpenReportModal: () => void;
  onOpenChatWithContext: (text: string) => void;
  onApproveByDoctor?: () => void;
  isDoctorView?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'modified';
  noticeMessage?: string | null;
}

export const XAIBreakdownView: React.FC<XAIBreakdownViewProps> = ({
  prediction,
  patientVitals: _patientVitals,
  uploadedDocs = [],
  onOpenReportModal,
  onOpenChatWithContext,
  onApproveByDoctor,
  isDoctorView = false,
  approvalStatus = 'pending',
  noticeMessage,
}) => {
  const hasImage = Boolean(prediction.imageBasedAnalysis?.hasImageAnalysis);
  const [selectedXaiTab, setSelectedXaiTab] = useState<'shap' | 'lime' | 'decisionTree' | 'ranking' | 'imageAnalysis'>(
    hasImage ? 'imageAnalysis' : 'shap'
  );
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  useEffect(() => {
    setSelectedXaiTab(prediction.imageBasedAnalysis?.hasImageAnalysis ? 'imageAnalysis' : 'shap');
    setSelectedDocIndex(0);
  }, [prediction]);

  const imageDocs = uploadedDocs.filter((d) => d.isImageBased && Boolean(d.fileUrl));
  const activePreviewDoc = imageDocs[selectedDocIndex];

  const xai = prediction.xaiExplanation;
  const imageAnalysis = prediction.imageBasedAnalysis;
  const featureImportances = xai?.featureImportances || [];
  const decisionTreePath = xai?.decisionTreePath || [];
  const riskFactorRanking = xai?.riskFactorRanking || [];
  const baselineComparison = xai?.baselineComparison || [];
  const recommendedNextSteps = prediction.recommendedNextSteps || [];

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {noticeMessage && (
        <div className="p-4 bg-amber-950/70 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Top Banner: Primary Disease Prediction Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Explainable AI Prediction</span>
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getSeverityBadge(prediction.severityLevel)}`}>
                {prediction.severityLevel} Severity
              </span>
              {approvalStatus === 'approved' && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Physician Approved</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {prediction.diseaseName}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Model output generated with transparent SHAP value feature attributions, LIME surrogate logic, and Decision Tree path tracing.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Generate PDF Report</span>
              </button>

              <button
                onClick={() => onOpenChatWithContext(`Can you explain the SHAP breakdown and risk factors for my prediction of ${prediction.diseaseName}?`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ask AI Assistant to Explain</span>
              </button>

              {isDoctorView && onApproveByDoctor && (
                <button
                  onClick={onApproveByDoctor}
                  disabled={approvalStatus === 'approved'}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                    approvalStatus === 'approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approvalStatus === 'approved' ? 'Verified & Approved' : 'Approve AI Recommendation'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Score Cards */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4 text-center">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {prediction.isInconclusive ? 'Clinical Assessment Status' : 'Estimated Clinical Likelihood'}
              </div>
              {prediction.isInconclusive ? (
                <div className="text-lg font-black text-amber-300 leading-snug py-1">
                  Inconclusive – Additional Imaging Required
                </div>
              ) : (
                <>
                  <div className="text-4xl font-black text-amber-400 font-mono">{prediction.probabilityPercent}%</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, prediction.probabilityPercent))}%` }}
                    ></div>
                  </div>
                </>
              )}
              {prediction.probabilitySummary && (
                <p className="text-[11px] text-slate-400 mt-2 leading-snug">{prediction.probabilitySummary}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Model Confidence (Evidence Clarity):</span>
              <span className="font-bold text-cyan-400 font-mono">{prediction.confidenceScore}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Risk Category:</span>
              <span className="font-bold text-white">{prediction.riskCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* XAI Navigation Selector */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 text-xs font-semibold">
        {hasImage && (
          <button
            onClick={() => setSelectedXaiTab('imageAnalysis')}
            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold ${
              selectedXaiTab === 'imageAnalysis'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50'
                : 'bg-purple-950/40 text-purple-200 border border-purple-500/30 hover:bg-purple-900/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>Image Scan & Radiology XAI Report</span>
          </button>
        )}

        <button
          onClick={() => setSelectedXaiTab('shap')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            selectedXaiTab === 'shap'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>SHAP Feature Importance</span>
        </button>

        <button
          onClick={() => setSelectedXaiTab('lime')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            selectedXaiTab === 'lime'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>LIME Local Explanation</span>
        </button>

        <button
          onClick={() => setSelectedXaiTab('decisionTree')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            selectedXaiTab === 'decisionTree'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Decision Tree Path</span>
        </button>

        <button
          onClick={() => setSelectedXaiTab('ranking')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            selectedXaiTab === 'ranking'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Risk Factor Ranking</span>
        </button>
      </div>

      {/* Tab 0: Image Scan & Clinical MRI 12-Section XAI Report */}
      {selectedXaiTab === 'imageAnalysis' && hasImage && imageAnalysis && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/30 border-2 border-purple-500/50 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          {imageAnalysis.clinicalMriReport?.emergencyAlert && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-rose-100 text-xs flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-black uppercase tracking-wider text-rose-300">
                  Urgent Clinical Attention Recommended
                </div>
                <p className="mt-0.5 leading-relaxed">
                  Imaging findings raise concern for potential acute stroke or intracranial hemorrhage. Immediate emergency medical assessment and formal radiologist/neurologist review are required.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Scan className="w-4 h-4 animate-pulse" />
                <span>MediExplain.AI – Clinical Imaging & Explainable AI Analysis</span>
              </div>
              <h2 className="text-xl font-black text-white">{imageAnalysis.scanType || 'Medical Imaging'} Assessment</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenChatWithContext(
                  `Explain the imaging findings, missing sequences, and confidence vs disease probability for: ${
                    imageAnalysis.clinicalMriReport?.suspectedClinicalCondition ||
                    imageAnalysis.findings?.impression ||
                    'Uploaded medical scan'
                  }`
                )
              }
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Chat About This Scan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scan Image Viewer */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Eye className="w-4 h-4" />
                  <span>Uploaded Scan & Region of Interest (ROI)</span>
                </span>
                {(activePreviewDoc?.fileName || imageAnalysis.fileName) && (
                  <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {activePreviewDoc?.fileName || imageAnalysis.fileName}
                  </span>
                )}
              </div>

              {(activePreviewDoc?.fileUrl || imageAnalysis.imageUrl) ? (
                <div className="space-y-3">
                  <div className="relative aspect-square max-h-[340px] mx-auto rounded-2xl overflow-hidden border border-purple-500/40 bg-black shadow-inner flex items-center justify-center">
                    <img
                      src={activePreviewDoc?.fileUrl || imageAnalysis.imageUrl}
                      alt={activePreviewDoc?.fileName || 'Medical Scan'}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-xl border border-purple-500/40 text-[11px] text-purple-200 font-mono font-bold">
                      ROI:{' '}
                      {activePreviewDoc?.radiologyFindings?.regionOfInterest ||
                        imageAnalysis.findings?.regionOfInterest ||
                        'Unlocalized / Requires Multi-Sequence Review'}
                    </div>
                  </div>
                  {imageDocs.length > 1 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {imageDocs.map((doc, idx) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                            idx === selectedDocIndex
                              ? 'border-cyan-400 bg-cyan-950/60 text-white'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <img src={doc.fileUrl} alt={doc.fileName} className="w-8 h-8 rounded object-cover bg-black" />
                          <span className="max-w-[110px] truncate">{doc.fileName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs">
                  <ImageIcon className="w-8 h-8 mb-2 text-purple-400/60" />
                  <span>Scan examined by MediExplain.AI</span>
                </div>
              )}

              {imageAnalysis.findings?.abnormalityScore !== undefined && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Model Feature Clarity / Abnormality Signal:</span>
                    <span className="text-amber-400 font-mono font-bold">{imageAnalysis.findings.abnormalityScore}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, imageAnalysis.findings.abnormalityScore))}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Impression & Key Evidence */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Radiological Impression</span>
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {imageAnalysis.clinicalMriReport?.suspectedClinicalCondition ||
                    imageAnalysis.findings?.impression ||
                    imageAnalysis.multimodalSummary ||
                    'Imaging findings evaluated.'}
                </p>
              </div>

              {imageAnalysis.findings?.keyObservedFeatures && imageAnalysis.findings.keyObservedFeatures.length > 0 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    Observed Imaging Features:
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {imageAnalysis.findings.keyObservedFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {imageAnalysis.findings?.recommendation && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-400">
                    Radiologist / Neurologist Follow-Up Recommendation:
                  </span>
                  <p className="leading-relaxed">{imageAnalysis.findings.recommendation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Structured 12-Section Clinical MRI & XAI Output */}
          {imageAnalysis.clinicalMriReport && (
            <div className="pt-4 border-t border-purple-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Structured 12-Section Clinical MRI & XAI Report
                </h3>
                {imageAnalysis.clinicalMriReport.identifiedSequences.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {imageAnalysis.clinicalMriReport.identifiedSequences.map((seq, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold"
                      >
                        Sequence: {seq}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-bold">
                    MRI Sequences: Unconfirmed / Incomplete
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">1. Image Quality & Available Sequences</div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.imageQualityAndSequences}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">2. Observed MRI Findings</div>
                  {imageAnalysis.clinicalMriReport.observedMriFindings.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {imageAnalysis.clinicalMriReport.observedMriFindings.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">No definitive pathological abnormality identified in the supplied image.</p>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">3. Suspected Clinical Condition</div>
                  <p className="text-white font-semibold">{imageAnalysis.clinicalMriReport.suspectedClinicalCondition}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">4. Supporting Imaging Evidence</div>
                  {imageAnalysis.clinicalMriReport.supportingImagingEvidence.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {imageAnalysis.clinicalMriReport.supportingImagingEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">Insufficient localized supporting evidence in the supplied view.</p>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-1.5">
                  <div className="font-bold text-amber-300">5. Missing or Uncertain Evidence</div>
                  {imageAnalysis.clinicalMriReport.missingOrUncertainEvidence.length > 0 ? (
                    <ul className="list-disc list-inside text-amber-200/90 space-y-1">
                      {imageAnalysis.clinicalMriReport.missingOrUncertainEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">None noted.</p>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">6. AI Prediction & Model Confidence</div>
                  <p className="text-slate-200 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.aiPredictionAndConfidence}
                  </p>
                  {imageAnalysis.clinicalMriReport.clinicalLikelihoodNote && (
                    <p className="text-[11px] text-slate-400 italic">
                      {imageAnalysis.clinicalMriReport.clinicalLikelihoodNote}
                    </p>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">7. SHAP Explanation</span>
                    <span className="text-[10px] text-slate-400">
                      {imageAnalysis.clinicalMriReport.shapAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.shapExplanationText}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">8. LIME Explanation</span>
                    <span className="text-[10px] text-slate-400">
                      {imageAnalysis.clinicalMriReport.limeAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.limeExplanationText}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">9. Decision Tree Explanation</span>
                    <span className="text-[10px] text-slate-400">
                      {imageAnalysis.clinicalMriReport.decisionTreeAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.decisionTreeExplanationText}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">10. Region of Interest (ROI) Analysis</span>
                    <span className="text-[10px] text-slate-400">
                      {imageAnalysis.clinicalMriReport.roiAvailable ? 'Localized' : 'Unconfirmed'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.roiAnalysis}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">11. Severity Assessment</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(imageAnalysis.clinicalMriReport.severityLevel)}`}>
                      {imageAnalysis.clinicalMriReport.severityLevel}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {imageAnalysis.clinicalMriReport.severityAssessment}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-1.5">
                  <div className="font-bold text-emerald-300">12. Recommended Clinical Follow-up</div>
                  <ul className="list-disc list-inside text-slate-200 space-y-1">
                    {imageAnalysis.clinicalMriReport.recommendedClinicalFollowUp.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: SHAP Feature Importance */}
      {selectedXaiTab === 'shap' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>SHAP (SHapley Additive exPlanations) Waterfall Attribution</span>
              </h2>
              <p className="text-xs text-slate-400">
                Quantifies the exact percentage contribution of each patient parameter toward increasing (Red) or decreasing (Green) predicted risk.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Increases Risk
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Protective / Lowers Risk
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed italic">
            "{xai?.shapSummary || 'SHAP feature attribution breakdown computed for patient profile.'}"
          </p>

          {/* Feature Importances Waterfall Bar Chart */}
          <div className="space-y-4 pt-2">
            {featureImportances.length === 0 ? (
              <div className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                {imageAnalysis?.clinicalMriReport?.shapExplanationText ||
                  'No granular SHAP feature weights are available for this prediction.'}
              </div>
            ) : (
              featureImportances.map((item, idx) => {
                const isPositive = item.percentageImpact > 0;
                const absVal = Math.abs(item.percentageImpact);
                return (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.label}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {item.value}
                        </span>
                      </div>
                      <span className={`font-bold font-mono text-xs ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPositive ? `+${item.percentageImpact}%` : `${item.percentageImpact}%`}
                      </span>
                    </div>

                    {/* Visual Impact Bar */}
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPositive ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, absVal * 2.2)}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-400">{item.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: LIME Local Explanation */}
      {selectedXaiTab === 'lime' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <span>LIME (Local Interpretable Model-agnostic Explanations)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Generates a localized surrogate decision model around this specific patient's demographic neighbourhood.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-300 text-xs font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Clinical Local Rationale Summary</span>
              </span>
              {imageAnalysis?.clinicalMriReport && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {imageAnalysis.clinicalMriReport.limeAvailable ? 'Available' : 'Unavailable'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {imageAnalysis?.clinicalMriReport && !imageAnalysis.clinicalMriReport.limeAvailable
                ? imageAnalysis.clinicalMriReport.limeExplanationText
                : xai?.limeTextExplanation ||
                  imageAnalysis?.clinicalMriReport?.limeExplanationText ||
                  'Local surrogate explanation unavailable for this assessment.'}
            </p>
          </div>

          {/* Normal Baseline Range Comparison */}
          {baselineComparison.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Lab Parameters vs Normal Baselines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {baselineComparison.map((base, idx) => {
                  const isOutOfRange = base.patientVal > base.normalMax || base.patientVal < base.normalMin;
                  return (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">{base.metric}</span>
                        <span className={`font-mono font-bold ${isOutOfRange ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {base.patientVal} {base.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Normal Range: {base.normalMin} - {base.normalMax} {base.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Decision Tree Path */}
      {selectedXaiTab === 'decisionTree' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-purple-400" />
              <span>Model Decision Tree Node Traversal Path</span>
            </h2>
            <p className="text-xs text-slate-400">
              Trace the exact logical cutoffs and branching conditions evaluated by the decision forest.
            </p>
          </div>

          <div className="space-y-4">
            {decisionTreePath.length === 0 ? (
              <div className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                {imageAnalysis?.clinicalMriReport?.decisionTreeExplanationText ||
                  'Decision tree traversal path is unavailable for this record.'}
              </div>
            ) : (
              decisionTreePath.map((node, idx) => (
                <div
                  key={node.id || idx}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl font-mono font-bold text-xs shrink-0 border border-purple-500/30">
                      Node #{idx + 1}
                    </div>
                    <div className="space-y-1 text-xs flex-1">
                      <div className="font-bold text-white text-sm">{node.condition}</div>
                      <div className="text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                        <span>
                          Patient Value: <strong className="text-cyan-300">{node.actualValue}</strong>
                        </span>
                        <span>
                          Cutoff Threshold: <strong className="text-slate-200">{node.threshold}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  {node.passed ? (
                    <div className="shrink-0 w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Condition Met</span>
                    </div>
                  ) : (
                    <div className="shrink-0 w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Not Met</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Risk Factor Ranking */}
      {selectedXaiTab === 'ranking' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-amber-400" />
              <span>Risk Factor Priority Ranking</span>
            </h2>
            <p className="text-xs text-slate-400">
              Factors sorted from most alarming clinical indicators down to protective health habits.
            </p>
          </div>

          <div className="space-y-3">
            {riskFactorRanking.length === 0 ? (
              <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                No risk factor priority rankings available for this record.
              </div>
            ) : (
              riskFactorRanking.map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{factor.factor}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        factor.impactLevel === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : factor.impactLevel === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : factor.impactLevel === 'Protective'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}
                    >
                      {factor.impactLevel}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{factor.contribution}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recommended Next Steps */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <span>Recommended Clinical Next Steps</span>
        </h3>
        {(() => {
          const steps =
            recommendedNextSteps.length > 0
              ? recommendedNextSteps
              : imageAnalysis?.clinicalMriReport?.recommendedClinicalFollowUp || [];
          if (steps.length === 0) {
            return (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400">
                Consult a licensed physician or radiologist for formal clinical correlation and follow-up.
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-200">
                  <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
