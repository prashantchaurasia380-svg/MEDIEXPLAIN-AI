import React from 'react';
import { BrainCircuit, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (tab: string) => {
    onNavigate?.(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 text-slate-400 text-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base">MediExplain AI</span>
              <p className="text-[11px] text-slate-500">Transparent Clinical Decision Support System</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] text-slate-400">
            <button type="button" onClick={() => handleNav('xai')} className="hover:text-cyan-300 transition-colors">SHAP & LIME Protocol</button>
            <button type="button" onClick={() => handleNav('admin')} className="hover:text-cyan-300 transition-colors">HIPAA & GDPR Compliance</button>
            <button type="button" onClick={() => handleNav('doctor')} className="hover:text-cyan-300 transition-colors">Doctor Verification</button>
            <button type="button" onClick={() => handleNav('diagnosis')} className="hover:text-cyan-300 transition-colors">Start Diagnosis</button>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-1.5 text-[11px] leading-relaxed text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Official Clinical & Legal Disclaimer</span>
          </div>
          <p>
            MediExplain AI is designed as a clinical decision-support and educational tool for healthcare professionals and patients. Algorithmic disease predictions, SHAP feature rankings, and LIME explanations do not constitute formal medical diagnosis or replace the clinical judgment of a licensed healthcare provider. If you are experiencing a medical emergency, seek immediate emergency medical care.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
          <span>© 2026 MediExplain AI Inc. All rights reserved.</span>
          <span>Powered by Gemini 4 Hydrogen & Explainable AI Engine</span>
        </div>
      </div>
    </footer>
  );
};
