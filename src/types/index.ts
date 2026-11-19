export type UserRole = 'doctor' | 'patient' | 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  hospitalName?: string;
  specialty?: string;
  isVerified?: boolean;
}

export interface PatientVitals {
  patientName?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRateBpm: number;
  bloodSugarMgDl: number;
  hba1cPercent?: number;
  cholesterolMgDl: number;
  hdlMgDl?: number;
  ldlMgDl?: number;
  triglyceridesMgDl?: number;
  symptoms: string[];
  medicalHistory: string[];
  familyHistory: string[];
  smoking: 'never' | 'former' | 'current';
  alcohol: 'none' | 'moderate' | 'heavy';
  exerciseLevel: 'sedentary' | 'moderate' | 'active';
}

export interface FeatureImportance {
  feature: string;
  label: string;
  value: string;
  shapValue: number; // e.g. +0.35 or -0.10
  percentageImpact: number; // e.g. +35% or -10%
  category: 'clinical_vital' | 'lab_report' | 'lifestyle' | 'demographics' | 'genetics';
  direction: 'increase_risk' | 'decrease_risk';
  description: string;
}

export interface DecisionTreeNode {
  id: string;
  condition: string;
  passed: boolean;
  actualValue: string;
  threshold: string;
  nextTrueNodeId?: string;
  nextFalseNodeId?: string;
}

export interface XAIExplanation {
  overallRiskScore: number; // 0 - 100
  confidenceScore: number; // e.g. 92.5%
  shapSummary: string;
  limeTextExplanation: string;
  featureImportances: FeatureImportance[];
  decisionTreePath: DecisionTreeNode[];
  riskFactorRanking: {
    factor: string;
    impactLevel: 'Critical' | 'High' | 'Moderate' | 'Protective';
    contribution: string;
  }[];
  baselineComparison: {
    metric: string;
    patientVal: number;
    normalMin: number;
    normalMax: number;
    unit: string;
  }[];
}

export interface RadiologyFindings {
  regionOfInterest?: string;
  abnormalityScore?: number; // 0-100
  keyObservedFeatures?: string[];
  impression?: string;
  recommendation?: string;
}

export interface ClinicalMRIReport {
  imageQualityAndSequences: string;
  identifiedSequences: string[];
  observedMriFindings: string[];
  suspectedClinicalCondition: string;
  supportingImagingEvidence: string[];
  missingOrUncertainEvidence: string[];
  aiPredictionAndConfidence: string;
  clinicalLikelihoodNote?: string;
  shapExplanationText: string;
  shapAvailable: boolean;
  limeExplanationText: string;
  limeAvailable: boolean;
  decisionTreeExplanationText: string;
  decisionTreeAvailable: boolean;
  roiAnalysis: string;
  roiAvailable: boolean;
  severityAssessment: string;
  severityLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  recommendedClinicalFollowUp: string[];
  emergencyAlert?: boolean;
}

export interface ImageBasedAnalysis {
  hasImageAnalysis: boolean;
  scanType?: string;
  fileName?: string;
  imageUrl?: string;
  findings: RadiologyFindings;
  clinicalMriReport?: ClinicalMRIReport;
  analyzedImages?: {
    fileName: string;
    imageCategory: string;
    fileUrl?: string;
    regionOfInterest: string;
    confidence: number;
    findings: string[];
    shapContribution: number;
    impression: string;
  }[];
  multimodalSummary?: string;
}

export interface DiseasePrediction {
  diseaseName: string; // e.g., 'Diabetes Type 2' or 'Inconclusive – Additional Imaging Required'
  probabilityPercent: number; // e.g., 78 (0 when inconclusive)
  probabilitySummary?: string; // Distinguishes clinical probability vs model confidence
  isInconclusive?: boolean;
  severityLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidenceScore: number; // Model confidence score (distinct from disease probability)
  riskCategory: 'Elevated Risk' | 'High Priority' | 'Borderline' | 'Low Risk' | 'Inconclusive';
  recommendedNextSteps: string[];
  xaiExplanation: XAIExplanation;
  imageBasedAnalysis?: ImageBasedAnalysis;
}

export interface UploadedMedicalDoc {
  id: string;
  fileName: string;
  fileType: 'blood_report' | 'xray' | 'mri' | 'ct_scan' | 'retinal' | 'dermoscopy' | 'pdf_report';
  uploadedAt: string;
  parsedSummary?: string;
  extractedVitals?: Partial<PatientVitals>;
  aiScanNotes?: string;
  fileUrl?: string;
  isImageBased?: boolean;
  radiologyFindings?: RadiologyFindings;
  clinicalMriReport?: ClinicalMRIReport;
}

export interface DiagnosisRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  vitals: PatientVitals;
  primaryPrediction: DiseasePrediction;
  secondaryPredictions: DiseasePrediction[];
  uploadedDocs: UploadedMedicalDoc[];
  doctorApprovalStatus: 'pending' | 'approved' | 'modified';
  doctorNotes?: string;
  prescribedMedications?: string[];
  reviewedByDoctorName?: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  isActive: boolean;
  notes?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  facility: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  type: 'Follow-up' | 'Consultation' | 'Lab Test Review';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  hipaaCompliant: boolean;
  ipAddress: string;
}

export interface ModelTelemetry {
  modelName: string;
  version: string;
  accuracyPercent: number;
  latencyMs: number;
  lastTrained: string;
  shapCalibrationScore: number;
  totalInferences: number;
}
