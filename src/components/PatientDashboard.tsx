import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  Download,
  BotMessageSquare,
  CheckCircle2,
  Heart,
  Bell,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { DiagnosisRecord, MedicationReminder, Appointment } from '../types';
import { SAMPLE_MEDICATION_REMINDERS, SAMPLE_APPOINTMENTS } from '../mock/medicalData';

interface PatientDashboardProps {
  latestRecord: DiagnosisRecord;
  onOpenReportModal: () => void;
  onOpenChat: () => void;
  onStartNewDiagnosis: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  latestRecord,
  onOpenReportModal,
  onOpenChat,
  onStartNewDiagnosis,
}) => {
  const [meds, setMeds] = useState<MedicationReminder[]>(SAMPLE_MEDICATION_REMINDERS);
  const [appointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);

  const toggleMedActive = (id: string) => {
    setMeds(meds.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  const nextSteps = latestRecord.primaryPrediction.recommendedNextSteps || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Personalized Health Portal • {latestRecord.patientName}</span>
          </div>
          <h1 className="text-2xl font-black text-white">Patient Dashboard & Health Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            Track medication schedules, view AI diagnostic summaries, and access doctor-signed reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartNewDiagnosis}
            className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>New Health Check</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Diagnosis & Doctor Sign-off */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Latest AI Health Summary</span>
              </div>
              <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                {latestRecord.date}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{latestRecord.primaryPrediction.diseaseName}</h3>
                  <span className="text-xs text-amber-400 font-bold font-mono">
                    {latestRecord.primaryPrediction.isInconclusive
                      ? `Inconclusive (Model Confidence: ${latestRecord.primaryPrediction.confidenceScore}%)`
                      : `${latestRecord.primaryPrediction.probabilityPercent}% Clinical Probability • ${latestRecord.primaryPrediction.confidenceScore}% Model Confidence`}
                  </span>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Doctor Review Badge */}
              {latestRecord.doctorApprovalStatus === 'approved' && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl space-y-1 text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reviewed & Verified by {latestRecord.reviewedByDoctorName || 'Attending Physician'}</span>
                  </div>
                  {latestRecord.doctorNotes && (
                    <p className="text-[11px] text-emerald-200/90 pl-6">{latestRecord.doctorNotes}</p>
                  )}
                  {latestRecord.prescribedMedications && latestRecord.prescribedMedications.length > 0 && (
                    <p className="text-[11px] text-cyan-300 pl-6 font-medium">
                      Prescribed: {latestRecord.prescribedMedications.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Plain English XAI Summary */}
              <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                {latestRecord.primaryPrediction.xaiExplanation?.shapSummary || 'AI diagnostic summary available.'}
              </p>
            </div>

            {/* Next Steps for Patient */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Lifestyle & Medical Actions</h4>
              <div className="space-y-2">
                {nextSteps.length === 0 ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No automated lifestyle actions generated — consult a licensed physician or radiologist for review.
                  </div>
                ) : (
                  nextSteps.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Chat Assistant Shortcut */}
          <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-500/30 p-6 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BotMessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Have Questions About Your Report?</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ask MediExplain Assistant to explain your results in simple terms or suggest diet changes.
              </p>
            </div>
            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 shadow-md shadow-cyan-500/20"
            >
              Open AI Chat
            </button>
          </div>
        </div>

        {/* Right Column: Medication Reminders & Appointments */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medication Reminders */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Medication Schedule & Reminders</span>
              </div>
              <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                Daily Tracker
              </span>
            </div>

            <div className="space-y-3">
              {meds.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    m.isActive
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.name} ({m.dosage})</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.frequency}</p>
                      <div className="flex gap-1 pt-1.5">
                        {m.timeOfDay.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMedActive(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        m.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Upcoming Appointments</span>
              </div>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{apt.doctorName}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      {apt.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{apt.specialty} • {apt.facility}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-cyan-300 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.date} at {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
