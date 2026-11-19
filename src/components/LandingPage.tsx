import React from 'react';
import {
  BrainCircuit,
  Activity,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  Layers,
  Sparkles,
  FileText,
  Users,
  CheckCircle2,
  Microscope,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onStartDiagnosis: () => void;
  onExploreXAI: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDiagnosis,
  onExploreXAI,
}) => {
  return (
    <div className="min-h-screen text-slate-100 space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Next-Generation Clinical Decision Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              MediExplain <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              Transparent Artificial Intelligence for Better Healthcare Decisions. Predict diseases with state-of-the-art AI while receiving exact, human-readable explanations for every clinical prediction.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartDiagnosis}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Stethoscope className="w-5 h-5" />
                <span>Start Diagnosis</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreXAI}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-base transition-all"
              >
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <span>Learn About Explainable AI</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">95.2%</div>
                <div className="text-xs text-slate-400 font-medium">Model Calibration</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400">SHAP & LIME</div>
                <div className="text-xs text-slate-400 font-medium">Visual Explanations</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">10+ Diseases</div>
                <div className="text-xs text-slate-400 font-medium">Predictive Coverage</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Graphic */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
              {/* Animated ECG Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live ECG & XAI Engine</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              {/* ECG Line Animation Canvas */}
              <div className="h-20 w-full bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                <svg className="w-full h-full text-cyan-400 opacity-90" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <path
                    d="M0,50 L80,50 L100,20 L120,80 L140,10 L160,90 L180,50 L260,50 L280,20 L300,80 L320,10 L340,90 L360,50 L500,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="animate-ecg"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950"></div>
              </div>

              {/* Sample Prediction Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Predicted Disease Risk</span>
                  <span className="font-bold text-amber-400">78% Risk (Type 2 Diabetes)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-[78%] rounded-full"></div>
                </div>

                <div className="pt-2 text-[11px] space-y-1.5 text-slate-400">
                  <div className="flex justify-between">
                    <span>Fasting Glucose (168 mg/dL)</span>
                    <span className="text-rose-400 font-bold">+38% SHAP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HbA1c Level (7.8%)</span>
                    <span className="text-rose-400 font-bold">+22% SHAP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical Exercise</span>
                    <span className="text-emerald-400 font-bold">-10% Protective</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Audited for Doctor Workflow & HIPAA Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Explainable AI Matters in Healthcare */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Explainable AI (XAI) is Essential</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Traditional "black-box" AI models output risk predictions without explanation. MediExplain AI unravels the mathematical reasoning behind every single decision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-all">
            <div className="p-3 w-fit bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">SHAP Value Attribution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates exact feature impact percentage (e.g. Fasting Sugar +38%, BMI +15%) showing exactly which parameters increased or decreased risk.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all">
            <div className="p-3 w-fit bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">LIME Local Surrogate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates complex non-linear machine learning logic into plain language clinical summaries specific to individual patient demographics.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-purple-500/40 transition-all">
            <div className="p-3 w-fit bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Decision Tree Paths</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step branching trees showing clinical thresholds (e.g., Blood Sugar &gt; 125 mg/dL AND BMI &gt; 28) evaluated by the model.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="p-3 w-fit bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Doctor Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allows attending physicians to inspect AI logic, add clinical observations, approve recommendations, and sign reports.
            </p>
          </div>
        </div>
      </section>

      {/* Target User Ecosystem */}
      <section className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Designed for the Healthcare Ecosystem</h2>
            <p className="text-slate-400 text-sm">Empowering every stakeholder with transparent medical intelligence.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/50">
            <Users className="w-4 h-4" />
            <span>Multi-Role Support</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Doctors & Clinicians</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Verify AI risk rationale before prescribing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Compare past vs present lab trends</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Add clinical notes and official sign-offs</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Patients</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Understand health risk factors clearly</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Track medication reminders and dosage</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Export encrypted clinical PDF reports</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                <Microscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Students & Researchers</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Study SHAP & LIME mathematical weights</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Inspect Decision Tree clinical cutoffs</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Monitor model calibration and drift</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-teal-950/80 border border-cyan-500/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white">Ready to Experience Transparent AI Healthcare?</h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Input patient parameters or upload a medical test report to generate an instant prediction with complete Explainable AI rationale.
        </p>
        <button
          onClick={onStartDiagnosis}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
        >
          <Zap className="w-5 h-5" />
          <span>Launch Patient Diagnostic Engine</span>
        </button>
      </section>
    </div>
  );
};
