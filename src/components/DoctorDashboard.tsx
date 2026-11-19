import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  FileEdit,
  Download,
  Sparkles,
  ShieldCheck,
  Plus,
  BrainCircuit,
} from 'lucide-react';
import { DiagnosisRecord, User } from '../types';

interface DoctorDashboardProps {
  doctorUser: User;
  records: DiagnosisRecord[];
  onUpdateRecord: (updatedRecord: DiagnosisRecord) => void;
  onSelectRecord: (record: DiagnosisRecord) => void;
  onOpenReportModal: (record: DiagnosisRecord) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorUser,
  records,
  onUpdateRecord,
  onSelectRecord,
  onOpenReportModal,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const [clinicalNotes, setClinicalNotes] = useState(selectedRecord?.doctorNotes || '');
  const [newMedication, setNewMedication] = useState('');
  const [medsList, setMedsList] = useState<string[]>(selectedRecord?.prescribedMedications || []);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (selectedRecord) {
      setClinicalNotes(selectedRecord.doctorNotes || '');
      setMedsList(selectedRecord.prescribedMedications || []);
    }
  }, [selectedRecord?.id]);

  if (!selectedRecord) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400 text-sm">
        No patient records in queue yet.
      </div>
    );
  }

  const handleSelectPatient = (rec: DiagnosisRecord) => {
    setSelectedRecordId(rec.id);
    setClinicalNotes(rec.doctorNotes || '');
    setMedsList(rec.prescribedMedications || []);
  };

  const handleApprovePrediction = () => {
    const updatedRec: DiagnosisRecord = {
      ...selectedRecord,
      doctorApprovalStatus: 'approved',
      doctorNotes: clinicalNotes,
      prescribedMedications: medsList,
      reviewedByDoctorName: doctorUser.name,
    };
    onUpdateRecord(updatedRec);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleAddMedication = () => {
    const trimmed = newMedication.trim();
    if (trimmed && !medsList.includes(trimmed)) {
      setMedsList([...medsList, trimmed]);
      setNewMedication('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{doctorUser.name}</h1>
              {doctorUser.isVerified && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NPI Verified Physician</span>
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              {doctorUser.title} • {doctorUser.hospitalName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <div className="text-xs text-slate-400">Patients Pending Review</div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {records.filter((r) => r.doctorApprovalStatus === 'pending').length}
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <div className="text-xs text-slate-400">Approved Reports</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {records.filter((r) => r.doctorApprovalStatus === 'approved').length}
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>AI Clinical Recommendation approved & saved to patient's medical record!</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">HIPAA Encrypted Audit ID: #LOG-801</span>
        </div>
      )}

      {/* Main Grid: Left Patient Queue, Right Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Patient Queue */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Clinical Patient Queue</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
              {records.length} Patients
            </span>
          </div>

          <div className="space-y-3">
            {records.map((rec) => {
              const isSelected = rec.id === selectedRecord.id;
              const isApproved = rec.doctorApprovalStatus === 'approved';
              return (
                <div
                  key={rec.id}
                  onClick={() => handleSelectPatient(rec)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-bold text-white text-xs">{rec.patientName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    Predicted: <strong className="text-cyan-300">{rec.primaryPrediction.diseaseName}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span>Risk Score: <strong className="text-amber-400 font-mono">{rec.primaryPrediction.probabilityPercent}%</strong></span>
                    <span>Date: {rec.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Patient Clinical Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Patient Overview Header */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Patient File</span>
                <h2 className="text-xl font-bold text-white">{selectedRecord.patientName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fasting Glucose: <span className="text-cyan-300 font-mono font-bold">{selectedRecord.vitals.bloodSugarMgDl} mg/dL</span> | Systolic BP: <span className="text-rose-400 font-mono font-bold">{selectedRecord.vitals.systolicBp} mmHg</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectRecord(selectedRecord)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <span>Inspect XAI Engine</span>
                </button>

                <button
                  onClick={() => onOpenReportModal(selectedRecord)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Print / Export PDF</span>
                </button>
              </div>
            </div>

            {/* AI Recommendation Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Primary Prediction: {selectedRecord.primaryPrediction.diseaseName}
                </span>
                <span className="font-mono font-bold text-amber-400">{selectedRecord.primaryPrediction.probabilityPercent}% Probability</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "{selectedRecord.primaryPrediction.xaiExplanation.shapSummary}"
              </p>
            </div>
          </div>

          {/* Clinical Notes & Approval Editor */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
              <FileEdit className="w-5 h-5 text-cyan-400" />
              <span>Attending Physician Clinical Notes & Treatment Plan</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Doctor's Observations & Directives</label>
              <textarea
                rows={4}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter attending doctor notes, diagnostic corroboration, and patient follow-up instructions..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Prescribed Medications */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">Prescribed Medications & Dosages</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg BD after meals"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMedication();
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {medsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {medsList.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-semibold flex items-center gap-2"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => setMedsList(medsList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Sign Off CTA */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleApprovePrediction}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Sign Off AI Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
