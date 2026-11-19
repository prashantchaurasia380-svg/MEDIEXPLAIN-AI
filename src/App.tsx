import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ClinicalDisclaimerBanner } from './components/ClinicalDisclaimerBanner';
import { LandingPage } from './components/LandingPage';
import { PatientDiagnosisForm } from './components/PatientDiagnosisForm';
import { XAIBreakdownView } from './components/XAIBreakdownView';
import { VisualAnalytics } from './components/VisualAnalytics';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { AIChatAssistant } from './components/AIChatAssistant';
import { AdminPanel } from './components/AdminPanel';
import { ReportPDFView } from './components/ReportPDFView';
import { AuthModal } from './components/AuthModal';

import {
  DiseasePrediction,
  PatientVitals,
  UploadedMedicalDoc,
  User,
  UserRole,
  DiagnosisRecord,
  ImageBasedAnalysis,
} from './types';
import {
  SAMPLE_USERS,
  INITIAL_PATIENT_VITALS,
  SAMPLE_DIAGNOSIS_RECORDS,
} from './mock/medicalData';
import { requestAIDiagnosis, AttachedImagePayload } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User>(SAMPLE_USERS[0]);
  const [records, setRecords] = useState<DiagnosisRecord[]>(SAMPLE_DIAGNOSIS_RECORDS);
  const [activeRecord, setActiveRecord] = useState<DiagnosisRecord>(SAMPLE_DIAGNOSIS_RECORDS[0]);
  const [activePrediction, setActivePrediction] = useState<DiseasePrediction>(
    SAMPLE_DIAGNOSIS_RECORDS[0].primaryPrediction
  );
  const [patientVitals, setPatientVitals] = useState<PatientVitals>(INITIAL_PATIENT_VITALS);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedMedicalDoc[]>([]);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [diagnosisNotice, setDiagnosisNotice] = useState<string | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);

  // Quick Role Switcher
  const handleSelectRole = (role: UserRole) => {
    const matchingUser = SAMPLE_USERS.find((u) => u.role === role) || {
      id: `user-${role}`,
      name: `Demo ${role.toUpperCase()}`,
      email: `${role}@mediexplain.org`,
      role,
      isVerified: true,
    };
    setCurrentUser(matchingUser);

    if (role === 'doctor') setActiveTab('doctor');
    else if (role === 'patient') setActiveTab('patient');
    else if (role === 'admin') setActiveTab('admin');
    else if (role === 'student' && ['doctor', 'patient', 'admin'].includes(activeTab)) {
      setActiveTab('xai');
    }
  };

  // Run AI Diagnosis prediction
  const handleRunDiagnosis = async (vitals: PatientVitals, docs: UploadedMedicalDoc[]) => {
    setIsLoadingDiagnosis(true);
    setDiagnosisError(null);
    setDiagnosisNotice(null);
    setPatientVitals(vitals);
    setUploadedDocs(docs);

    const primaryImageDoc = docs.find((d) => d.isImageBased || Boolean(d.radiologyFindings) || Boolean(d.fileUrl));
    const scanTypeLabels: Record<string, string> = {
      xray: 'Chest X-Ray Radiograph',
      mri: 'Brain MRI',
      ct_scan: 'CT Scan',
      retinal: 'Retinal Fundus Scan',
      dermoscopy: 'Dermoscopy Scan',
    };

    const attachedImages: AttachedImagePayload[] = docs
      .filter((d) => Boolean(d.fileUrl))
      .map((d) => ({
        fileName: d.fileName,
        fileType: d.fileType,
        dataUrl: d.fileUrl as string,
      }));

    const formattedPatientName = vitals.patientName?.trim()
      ? `${vitals.patientName.trim()} (Age ${vitals.age}, ${
          vitals.gender === 'male' ? 'Male' : vitals.gender === 'female' ? 'Female' : 'Other'
        })`
      : `${currentUser.name} (Age ${vitals.age})`;

    try {
      const summaryText = docs
        .map((d) => {
          const rad = d.radiologyFindings
            ? ` [ROI: ${d.radiologyFindings.regionOfInterest || 'N/A'}, Impression: ${d.radiologyFindings.impression || 'N/A'}, Abnormality: ${d.radiologyFindings.abnormalityScore ?? 'N/A'}%]`
            : '';
          return `${d.fileName} (${d.fileType}): ${d.parsedSummary || ''}${d.aiScanNotes ? ` | ${d.aiScanNotes}` : ''}${rad}`;
        })
        .join('; ');

      const aiPrediction: any = await requestAIDiagnosis(vitals, summaryText, attachedImages);
      const mriReport = aiPrediction.clinicalMriReport || primaryImageDoc?.clinicalMriReport;

      const attachedImageAnalysis: ImageBasedAnalysis | undefined = primaryImageDoc
        ? {
            hasImageAnalysis: true,
            scanType: scanTypeLabels[primaryImageDoc.fileType] || 'Medical Imaging',
            fileName: primaryImageDoc.fileName,
            imageUrl: primaryImageDoc.fileUrl,
            findings: primaryImageDoc.radiologyFindings || {
              regionOfInterest: mriReport?.roiAvailable ? mriReport.roiAnalysis : 'Unlocalized / Requires Review',
              impression: mriReport?.suspectedClinicalCondition || aiPrediction.diseaseName,
              recommendation: mriReport?.recommendedClinicalFollowUp?.[0],
              keyObservedFeatures: mriReport?.observedMriFindings || [],
            },
            clinicalMriReport: mriReport,
            multimodalSummary: primaryImageDoc.parsedSummary,
          }
        : undefined;

      const { clinicalMriReport: _ignored, ...cleanPrediction } = aiPrediction;
      const mergedPrediction: DiseasePrediction = attachedImageAnalysis
        ? { ...cleanPrediction, imageBasedAnalysis: attachedImageAnalysis }
        : cleanPrediction;

      const newRecord: DiagnosisRecord = {
        id: `diag-${Date.now()}`,
        patientId: currentUser.role === 'patient' ? currentUser.id : `pat-${Date.now()}`,
        patientName: formattedPatientName,
        date: new Date().toISOString().split('T')[0],
        vitals,
        primaryPrediction: mergedPrediction,
        secondaryPredictions: [],
        uploadedDocs: docs,
        doctorApprovalStatus: 'pending',
      };

      setActivePrediction(mergedPrediction);
      setActiveRecord(newRecord);
      setRecords((prev) => [newRecord, ...prev]);
      if (mergedPrediction.isInconclusive) {
        setDiagnosisNotice(
          'Inconclusive – Additional Imaging Required: Available clinical or imaging evidence is insufficient for a definitive prediction.'
        );
      }
      setActiveTab('xai');
    } catch (err: any) {
      setDiagnosisError(
        err?.message || 'Unable to run clinical AI analysis. Please verify server connectivity and GEMINI_API_KEY configuration.'
      );
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const handleUpdateRecord = (updatedRecord: DiagnosisRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
    if (activeRecord.id === updatedRecord.id) {
      setActiveRecord(updatedRecord);
      setActivePrediction(updatedRecord.primaryPrediction);
      setPatientVitals(updatedRecord.vitals);
      setUploadedDocs(updatedRecord.uploadedDocs);
    }
  };

  const handleApproveActiveRecord = () => {
    const updated: DiagnosisRecord = {
      ...activeRecord,
      doctorApprovalStatus: 'approved',
      reviewedByDoctorName: currentUser.name,
    };
    handleUpdateRecord(updated);
  };

  const handleOpenChatWithContext = (msg: string) => {
    setChatInitialMessage(msg);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Prominent Clinical Disclaimer */}
      <ClinicalDisclaimerBanner />

      {/* Main Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage
            onStartDiagnosis={() => setActiveTab('diagnosis')}
            onExploreXAI={() => setActiveTab('xai')}
          />
        )}

        {activeTab === 'diagnosis' && (
          <div className="space-y-4">
            {diagnosisError && (
              <div className="max-w-5xl mx-auto p-4 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-start gap-3 shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Clinical AI Analysis Error</div>
                  <p className="mt-0.5">{diagnosisError}</p>
                </div>
              </div>
            )}
            <PatientDiagnosisForm
              onSubmitDiagnosis={handleRunDiagnosis}
              isLoading={isLoadingDiagnosis}
              initialVitals={patientVitals}
              initialDocs={uploadedDocs}
            />
          </div>
        )}

        {activeTab === 'xai' && (
          <XAIBreakdownView
            prediction={activePrediction}
            patientVitals={patientVitals}
            uploadedDocs={activeRecord.uploadedDocs}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenChatWithContext={handleOpenChatWithContext}
            isDoctorView={currentUser.role === 'doctor'}
            approvalStatus={activeRecord.doctorApprovalStatus}
            noticeMessage={diagnosisNotice}
            onApproveByDoctor={handleApproveActiveRecord}
          />
        )}

        {activeTab === 'analytics' && (
          <VisualAnalytics prediction={activePrediction} vitals={patientVitals} />
        )}

        {activeTab === 'doctor' && (
          <DoctorDashboard
            doctorUser={currentUser}
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onSelectRecord={(rec) => {
              setActiveRecord(rec);
              setActivePrediction(rec.primaryPrediction);
              setPatientVitals(rec.vitals);
              setUploadedDocs(rec.uploadedDocs);
              setDiagnosisNotice(null);
              setActiveTab('xai');
            }}
            onOpenReportModal={(rec) => {
              setActiveRecord(rec);
              setActivePrediction(rec.primaryPrediction);
              setShowReportModal(true);
            }}
          />
        )}

        {activeTab === 'patient' && (
          <PatientDashboard
            latestRecord={activeRecord}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenChat={() => setActiveTab('chat')}
            onStartNewDiagnosis={() => setActiveTab('diagnosis')}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatAssistant
            userRole={currentUser.role}
            initialMessage={chatInitialMessage}
            onConsumeInitialMessage={() => setChatInitialMessage(undefined)}
            patientContext={{
              prediction: activePrediction.diseaseName,
              probability: activePrediction.probabilityPercent,
              modelConfidence: activePrediction.confidenceScore,
              isInconclusive: activePrediction.isInconclusive,
              vitals: patientVitals,
              attachedDocsCount: uploadedDocs.length,
              clinicalMriReport: activePrediction.imageBasedAnalysis?.clinicalMriReport,
            }}
          />
        )}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSelectUser={(u) => {
            setCurrentUser(u);
            if (u.role === 'doctor') setActiveTab('doctor');
            else if (u.role === 'patient') setActiveTab('patient');
            else if (u.role === 'admin') setActiveTab('admin');
            else if (['doctor', 'patient', 'admin'].includes(activeTab)) setActiveTab('xai');
            setShowAuthModal(false);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Printable Report Modal */}
      {showReportModal && (
        <ReportPDFView
          record={activeRecord}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
