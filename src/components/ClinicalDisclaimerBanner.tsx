import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const ClinicalDisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setShowFullModal(true)}
        className="fixed bottom-4 right-4 z-40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md transition-all shadow-lg shadow-amber-950/20 print:hidden"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span>Clinical Disclaimer</span>
      </button>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs md:text-sm flex items-center justify-between shadow-md relative z-30 print:hidden">
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
          <div className="p-1 bg-amber-500/20 rounded-md border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <p className="leading-snug">
            <strong className="text-amber-300 font-semibold">Clinical Support Notice:</strong> MediExplain AI is an advanced clinical decision-support tool, not a replacement for licensed medical professionals. Every prediction must be evaluated by a qualified healthcare provider.
          </p>
          <button
            onClick={() => setShowFullModal(true)}
            className="hidden md:inline-flex text-cyan-300 hover:text-cyan-200 underline text-xs shrink-0 font-medium ml-2"
          >
            Learn More
          </button>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-400/80 hover:text-amber-200 p-1 rounded-md hover:bg-amber-500/10 transition-colors shrink-0 ml-2"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showFullModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setShowFullModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clinical & Regulatory Disclaimer</h3>
                <p className="text-xs text-amber-400/90 font-medium">HIPAA & Clinical Decision Support Protocol</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed mb-6">
              <p>
                <strong>1. Decision-Support Only:</strong> MediExplain AI algorithms, SHAP feature rankings, and LIME explanations are designed solely to assist medical practitioners, students, and patients by providing probabilistic computational insights.
              </p>
              <p>
                <strong>2. Physician Evaluation Required:</strong> Do not use this application to self-diagnose or prescribe medication. All diagnostic predictions and treatment pathways require review and formal approval by a licensed medical doctor.
              </p>
              <p>
                <strong>3. Emergency Medical Attention:</strong> If you or someone you are caring for is experiencing chest pain, acute shortness of breath, severe pain, or neurological deficits, call local emergency services immediately (e.g. 911).
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowFullModal(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20"
              >
                I Understand & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
