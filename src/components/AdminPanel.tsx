import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Activity,
  Cpu,
  Lock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_AUDIT_LOGS, SAMPLE_MODEL_TELEMETRY, SAMPLE_USERS } from '../mock/medicalData';
import { AuditLog, ModelTelemetry } from '../types';

export const AdminPanel: React.FC = () => {
  const [auditLogs] = useState<AuditLog[]>(SAMPLE_AUDIT_LOGS);
  const [telemetry] = useState<ModelTelemetry[]>(SAMPLE_MODEL_TELEMETRY);
  const [anonymizeData, setAnonymizeData] = useState(true);
  const [e2eEncrypt, setE2eEncrypt] = useState(true);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'audit' | 'verification' | 'security'>('telemetry');

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Hospital IT & Compliance Portal</span>
          </div>
          <h1 className="text-2xl font-black text-white">System Administration & Model Telemetry</h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor SHAP calibration scores, HIPAA audit logs, doctor license verification, and encryption settings.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950 px-3.5 py-1.5 rounded-2xl border border-emerald-800 text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>HIPAA & GDPR Compliant</span>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'telemetry'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Model Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>HIPAA Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'verification'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Doctor License Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Consent</span>
        </button>
      </div>

      {/* Tab 1: AI Model Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {telemetry.map((mod, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{mod.modelName}</h3>
                    <span className="text-[10px] text-purple-400 font-mono">{mod.version}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Online
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy Score:</span>
                    <strong className="text-white font-mono">{mod.accuracyPercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mean Latency:</span>
                    <strong className="text-cyan-300 font-mono">{mod.latencyMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SHAP Calibration:</span>
                    <strong className="text-amber-400 font-mono">{mod.shapCalibrationScore}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Inferences:</span>
                    <strong className="text-slate-200 font-mono">{mod.totalInferences.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Immutable HIPAA System Audit Log</h2>
            <span className="text-[10px] text-slate-400 font-mono">SHA256 Encrypted Stream</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300">{log.action}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{log.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.details}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>User: <strong className="text-slate-400">{log.user} ({log.role})</strong></span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Verification */}
      {activeTab === 'verification' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Licensed Physician Credential Registry</h2>
          <div className="space-y-3">
            {SAMPLE_USERS.filter((u) => u.role === 'doctor').map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{doc.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-slate-400 text-[11px]">{doc.title} • {doc.specialty}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  NPI Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Data Privacy & Security Controls</h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">PHI Data Anonymization Protocol</h4>
                <p className="text-slate-400 text-[11px]">Strips direct patient identifiers prior to AI model inference.</p>
              </div>
              <button
                onClick={() => setAnonymizeData(!anonymizeData)}
                className={`w-12 h-6 rounded-full transition-colors relative ${anonymizeData ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${anonymizeData ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">End-to-End Report Encryption (AES-256)</h4>
                <p className="text-slate-400 text-[11px]">Encrypts generated PDF reports with client-side keys.</p>
              </div>
              <button
                onClick={() => setE2eEncrypt(!e2eEncrypt)}
                className={`w-12 h-6 rounded-full transition-colors relative ${e2eEncrypt ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${e2eEncrypt ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
