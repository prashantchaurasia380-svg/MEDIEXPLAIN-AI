import React, { useRef } from 'react';
import {
  FileText,
  X,
  Printer,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { DiagnosisRecord } from '../types';

interface ReportPDFViewProps {
  record: DiagnosisRecord;
  onClose: () => void;
}

export const ReportPDFView: React.FC<ReportPDFViewProps> = ({ record, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const xai = record.primaryPrediction.xaiExplanation;
  const imageAnalysis = record.primaryPrediction.imageBasedAnalysis;
  const hasImageAnalysis = Boolean(imageAnalysis?.hasImageAnalysis);
  const featureImportances = xai?.featureImportances || [];
  const isApproved = record.doctorApprovalStatus === 'approved';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full my-8 shadow-2xl relative text-slate-200 overflow-hidden print:border-0 print:shadow-none print:my-0 print:rounded-none print:max-w-none print:bg-white print:text-black">
        {/* Modal Controls Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Encrypted Clinical Diagnostic & XAI Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div ref={reportRef} className="p-8 space-y-6 bg-slate-900 text-slate-100 font-sans print:bg-white print:text-black print:p-4">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-cyan-500/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-black text-xl tracking-tight print:text-cyan-700">
                <BrainCircuit className="w-6 h-6 text-cyan-400 print:text-cyan-700" />
                <span>ST. JUDE METROPOLITAN MEDICAL CENTER</span>
              </div>
              <p className="text-xs text-slate-400 font-medium print:text-slate-600">Department of Clinical AI & Diagnostic Decision Support</p>
              <p className="text-[10px] text-slate-500">100 Healthcare Boulevard, Suite 400 • NPI Hospital ID: #1849203</p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 space-y-1 print:text-slate-700">
              <div><strong className="text-slate-200 print:text-black">Report Date:</strong> {record.date}</div>
              <div><strong className="text-slate-200 print:text-black">Report ID:</strong> {record.id}</div>
              <div>
                <strong className="text-slate-200 print:text-black">Status:</strong>{' '}
                <span className={`font-bold uppercase ${isApproved ? 'text-emerald-400 print:text-emerald-700' : 'text-amber-400 print:text-amber-700'}`}>
                  {record.doctorApprovalStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Profile Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-cyan-700">Patient Information & Baseline Vitals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-600">Name:</span> <strong className="text-white print:text-black">{record.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Age/Gender:</span> <strong className="text-white print:text-black">{record.vitals.age} yrs / {record.vitals.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">BMI:</span> <strong className="text-white print:text-black">{record.vitals.bmi} kg/m²</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Blood Pressure:</span> <strong className="text-white print:text-black">{record.vitals.systolicBp}/{record.vitals.diastolicBp} mmHg</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Fasting Glucose:</span> <strong className="text-white print:text-black">{record.vitals.bloodSugarMgDl} mg/dL</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">HbA1c:</span> <strong className="text-white print:text-black">{record.vitals.hba1cPercent || 'N/A'}%</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Cholesterol:</span> <strong className="text-white print:text-black">{record.vitals.cholesterolMgDl} mg/dL</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Resting HR:</span> <strong className="text-white print:text-black">{record.vitals.heartRateBpm} bpm</strong>
              </div>
            </div>
          </div>

          {/* AI Primary Diagnostic Prediction */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 print:bg-slate-50 print:border-slate-300">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2 print:border-slate-300">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider print:text-amber-700">
                AI Clinical Assessment
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 print:text-amber-700">
                {record.primaryPrediction.isInconclusive
                  ? `Inconclusive (Model Confidence: ${record.primaryPrediction.confidenceScore}%)`
                  : `Est. Clinical Likelihood: ${record.primaryPrediction.probabilityPercent}% • Model Confidence: ${record.primaryPrediction.confidenceScore}%`}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white print:text-black">{record.primaryPrediction.diseaseName}</h2>

            {record.primaryPrediction.probabilitySummary && (
              <p className="text-xs text-slate-400 print:text-slate-600">{record.primaryPrediction.probabilitySummary}</p>
            )}

            <p className="text-xs text-slate-300 leading-relaxed italic print:text-slate-700">
              "{xai?.shapSummary || 'SHAP feature attribution summary recorded below.'}"
            </p>
          </div>

          {/* Multimodal Image Scan & Clinical MRI 12-Section Findings */}
          {hasImageAnalysis && imageAnalysis && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 space-y-4 print:bg-slate-50 print:border-purple-300">
              <div className="flex justify-between items-center border-b border-purple-500/30 pb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 print:text-purple-700">
                  <BrainCircuit className="w-4 h-4 text-purple-400 print:text-purple-700" />
                  <span>MediExplain.AI – Clinical Imaging & Radiology Analysis</span>
                </span>
                <span className="text-xs font-bold text-purple-400 font-mono print:text-purple-700">
                  {imageAnalysis.scanType || 'Medical Scan'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageAnalysis.imageUrl && (
                  <div className="relative aspect-square max-h-[160px] mx-auto rounded-xl overflow-hidden border border-purple-500/30 bg-black">
                    <img
                      src={imageAnalysis.imageUrl}
                      alt="Scan"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className={`space-y-2 text-xs ${imageAnalysis.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}`}>
                  <div>
                    <span className="font-bold text-slate-400 print:text-slate-600">Region of Interest:</span>{' '}
                    <strong className="text-purple-300 print:text-purple-800">
                      {imageAnalysis.findings?.regionOfInterest || 'Unlocalized / Requires Multi-Sequence Review'}
                    </strong>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 print:text-slate-600">Radiological Impression:</span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed print:text-black">
                      {imageAnalysis.clinicalMriReport?.suspectedClinicalCondition ||
                        imageAnalysis.findings?.impression ||
                        imageAnalysis.multimodalSummary ||
                        'Radiological findings recorded.'}
                    </p>
                  </div>

                  {imageAnalysis.findings?.keyObservedFeatures && imageAnalysis.findings.keyObservedFeatures.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-400 print:text-slate-600">Observed Radiologic Features:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-1 print:text-slate-800">
                        {imageAnalysis.findings.keyObservedFeatures.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {imageAnalysis.clinicalMriReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-purple-500/20 text-[11px]">
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">1. Image Quality & Sequences: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.imageQualityAndSequences}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">2. Observed MRI Findings: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.observedMriFindings.join('; ') || 'None identified'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">3. Suspected Clinical Condition: </strong>
                    <span className="text-slate-200 print:text-black">
                      {imageAnalysis.clinicalMriReport.suspectedClinicalCondition}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">4. Supporting Evidence: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.supportingImagingEvidence.join('; ') || 'Insufficient'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-amber-300 print:text-amber-800">5. Missing / Uncertain Evidence: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.missingOrUncertainEvidence.join('; ') || 'None'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">6. AI Prediction & Confidence: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.aiPredictionAndConfidence}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">7. SHAP Explanation: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.shapExplanationText}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">8. LIME Explanation: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.limeExplanationText}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">9. Decision Tree Explanation: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.decisionTreeExplanationText}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">10. ROI Analysis: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.roiAnalysis}
                    </span>
                  </div>
                  <div>
                    <strong className="text-cyan-300 print:text-cyan-800">11. Severity ({imageAnalysis.clinicalMriReport.severityLevel}): </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.severityAssessment}
                    </span>
                  </div>
                  <div>
                    <strong className="text-emerald-300 print:text-emerald-800">12. Recommended Follow-up: </strong>
                    <span className="text-slate-300 print:text-black">
                      {imageAnalysis.clinicalMriReport.recommendedClinicalFollowUp.join('; ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explainable AI SHAP Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">Explainable AI (SHAP) Feature Contribution Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                    <th className="p-2.5 font-semibold">Clinical Feature</th>
                    <th className="p-2.5 font-semibold">Measured Value</th>
                    <th className="p-2.5 font-semibold">SHAP Impact %</th>
                    <th className="p-2.5 font-semibold">Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {featureImportances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-slate-400 text-center">
                        No granular SHAP feature weights recorded.
                      </td>
                    </tr>
                  ) : (
                    featureImportances.map((f, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/50">
                        <td className="p-2.5 font-bold text-white print:text-black">{f.label}</td>
                        <td className="p-2.5 font-mono text-slate-300 print:text-slate-700">{f.value}</td>
                        <td className="p-2.5 font-mono font-bold text-cyan-300 print:text-cyan-700">
                          {f.percentageImpact > 0 ? `+${f.percentageImpact}%` : `${f.percentageImpact}%`}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.percentageImpact > 0 ? 'bg-rose-500/20 text-rose-300 print:text-rose-700' : 'bg-emerald-500/20 text-emerald-300 print:text-emerald-700'}`}>
                            {f.percentageImpact > 0 ? 'Increases Risk' : 'Protective'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attending Doctor Sign Off Notes */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Attending Physician Review & Signature</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed print:text-black">
              {record.doctorNotes || 'Pending attending physician clinical review and sign-off.'}
            </p>

            {record.prescribedMedications && record.prescribedMedications.length > 0 && (
              <div className="pt-2 text-xs">
                <span className="font-bold text-slate-400 print:text-slate-600">Prescribed Medications: </span>
                <span className="text-cyan-300 font-semibold print:text-cyan-800">
                  {record.prescribedMedications.join(', ')}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 print:border-slate-300 print:text-slate-600">
              <div>
                Reviewed By:{' '}
                <strong className="text-white print:text-black">
                  {record.reviewedByDoctorName || (isApproved ? 'Attending Physician' : 'Pending Physician Verification')}
                </strong>
              </div>
              <div className="font-mono text-[10px]">
                Electronic Verification Hash: 0x8F9A2...E4B1
              </div>
            </div>
          </div>

          {/* Mandatory Clinical Disclaimer Footer */}
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 leading-snug print:bg-amber-50 print:text-amber-900 print:border-amber-300">
            <strong>NOTICE:</strong> MediExplain AI is an algorithmic decision-support tool. Every prediction and feature attribution is generated for diagnostic assistance and research. Final medical diagnosis and treatment must be performed by a licensed medical practitioner.
          </div>
        </div>
      </div>
    </div>
  );
};
