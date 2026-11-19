import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Activity, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { VITAL_TIMELINE_DATA } from '../mock/medicalData';
import { DiseasePrediction, PatientVitals } from '../types';

interface VisualAnalyticsProps {
  prediction?: DiseasePrediction;
  vitals?: PatientVitals;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ prediction, vitals }) => {
  // Feature Importance Data for SHAP Bar Chart (derived from active prediction)
  const shapBarData =
    prediction?.xaiExplanation?.featureImportances && prediction.xaiExplanation.featureImportances.length > 0
      ? prediction.xaiExplanation.featureImportances.map((f) => ({
          feature: f.label,
          impact: f.percentageImpact,
          category: f.category,
        }))
      : [];

  // Radar chart comparing active patient vitals (normalized 0-100) vs healthy benchmark
  const radarData = vitals
    ? [
        { metric: 'Blood Sugar', patient: Math.min(100, Math.round((vitals.bloodSugarMgDl / 200) * 100)), benchmark: 45 },
        { metric: 'Blood Pressure', patient: Math.min(100, Math.round((vitals.systolicBp / 180) * 100)), benchmark: 60 },
        { metric: 'Cholesterol', patient: Math.min(100, Math.round((vitals.cholesterolMgDl / 300) * 100)), benchmark: 55 },
        { metric: 'BMI Ratio', patient: Math.min(100, Math.round((vitals.bmi / 40) * 100)), benchmark: 55 },
        {
          metric: 'Physical Activity',
          patient: vitals.exerciseLevel === 'active' ? 85 : vitals.exerciseLevel === 'moderate' ? 55 : 25,
          benchmark: 75,
        },
        { metric: 'HbA1c', patient: Math.min(100, Math.round(((vitals.hba1cPercent || 5.7) / 10) * 100)), benchmark: 52 },
      ]
    : [
        { metric: 'Blood Sugar', patient: 85, benchmark: 45 },
        { metric: 'Blood Pressure', patient: 75, benchmark: 40 },
        { metric: 'Cholesterol', patient: 70, benchmark: 45 },
        { metric: 'BMI Ratio', patient: 65, benchmark: 35 },
        { metric: 'Physical Activity', patient: 25, benchmark: 75 },
        { metric: 'HbA1c', patient: 80, benchmark: 30 },
      ];

  // Disease Risk Pie distribution
  const primaryProb = prediction?.probabilityPercent ?? 0;
  const remainingBaseline = Math.max(5, 100 - primaryProb);
  const pieData = prediction?.isInconclusive
    ? [
        { name: 'Inconclusive / Unverified Signal', value: 100, color: '#f59e0b' },
      ]
    : [
        { name: prediction?.diseaseName || 'Primary Assessment', value: Math.max(1, primaryProb), color: '#f59e0b' },
        { name: 'Cardiovascular Stress', value: Math.round(remainingBaseline * 0.45), color: '#ef4444' },
        { name: 'Metabolic / Hepatic', value: Math.round(remainingBaseline * 0.25), color: '#3b82f6' },
        { name: 'Healthy Reserve', value: Math.max(5, Math.round(remainingBaseline * 0.3)), color: '#10b981' },
      ];

  // Adjust latest month of longitudinal trend to reflect active patient's current vitals
  const timelineData = vitals
    ? VITAL_TIMELINE_DATA.map((pt, idx) =>
        idx === VITAL_TIMELINE_DATA.length - 1
          ? {
              ...pt,
              systolic: vitals.systolicBp,
              diastolic: vitals.diastolicBp,
              sugar: vitals.bloodSugarMgDl,
              hba1c: vitals.hba1cPercent || pt.hba1c,
            }
          : pt
      )
    : VITAL_TIMELINE_DATA;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Interactive Data Studio {vitals?.patientName ? `• ${vitals.patientName}` : ''}</span>
          </div>
          <h1 className="text-2xl font-black text-white">Visual Analytics & Patient Trends</h1>
          <p className="text-slate-400 text-xs mt-1">
            Recharts-driven visualization of clinical timelines, SHAP value weight distribution, and biometric radar maps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: 6-Month Vital Trends Timeline */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>6-Month Longitudinal Vital Trends</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              Systolic BP vs Blood Sugar
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="systolic" name="Systolic BP (mmHg)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sugar" name="Glucose (mg/dL)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SHAP Value Feature Importance Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>SHAP Feature Weight Percentage (%)</span>
            </div>
            <span className="text-[10px] text-teal-300 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
              Model XAI Breakdown
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {shapBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No quantitative SHAP feature weights are available for this record (e.g., incomplete imaging-only assessment).
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <BarChart data={shapBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} width={115} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="impact" name="SHAP Contribution %" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Health Parameter Radar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Biometric Parameter Radar Comparison</span>
            </div>
            <span className="text-[10px] text-purple-300 bg-purple-950 px-2.5 py-1 rounded-full border border-purple-800">
              Patient vs Healthy Baseline
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#475569" fontSize={10} />
                <Radar name="Patient Value" dataKey="patient" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                <Radar name="Healthy Target" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Disease Risk Proportion Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <span>Predicted Disease Risk Share (%)</span>
            </div>
            <span className="text-[10px] text-amber-300 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
              Multi-Condition Profile
            </span>
          </div>

          <div className="h-64 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
