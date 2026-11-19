import { PatientVitals, DiseasePrediction } from '../types';

export interface AttachedImagePayload {
  fileName: string;
  fileType: string;
  dataUrl: string;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 55000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out while waiting for the MediExplain AI server. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function requestAIDiagnosis(
  vitals: PatientVitals,
  uploadedDocsSummary?: string,
  attachedImages?: AttachedImagePayload[]
): Promise<DiseasePrediction> {
  const response = await fetchWithTimeout('/api/diagnosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vitals, uploadedDocsSummary, attachedImages }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch AI diagnosis from server.');
  }

  const data = await response.json();
  return data.result;
}

export async function requestReportAnalysis(
  fileDataUrl: string,
  fileName: string,
  fileType: string
) {
  const response = await fetchWithTimeout('/api/upload-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileDataUrl, fileName, fileType }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to analyze uploaded report.');
  }

  const data = await response.json();
  return data.analysis;
}

export async function requestAIChatReply(
  messages: { sender: 'user' | 'bot'; text: string }[],
  userRole: string,
  patientContext?: any
): Promise<string> {
  const response = await fetchWithTimeout('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userRole, patientContext }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to communicate with MediExplain AI Chat.');
  }

  const data = await response.json();
  return data.reply;
}
