import type { Phase } from '../types';

const API_BASE = '/api';

function getSessionId(): string {
  let sid = localStorage.getItem('aipl_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('aipl_session_id', sid);
  }
  return sid;
}

async function post(path: string, body: Record<string, unknown>) {
  try {
    await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getSessionId(), ...body }),
    });
  } catch {
    // silently fail — analytics should never break the app
  }
}

export async function startSession() {
  await post('/session/start', { userAgent: navigator.userAgent });
}

export async function heartbeat(currentPhase: Phase) {
  await post('/session/heartbeat', { currentPhase });
}

export async function trackMessage(phase: Phase, role: 'user' | 'model', content?: string) {
  await post('/track/message', { phase, role, content });
}

export async function trackFeedback(phase: Phase, rating: 'positive' | 'negative', messagePreview: string) {
  await post('/track/feedback', { phase, rating, messagePreview });
}

export async function trackPhaseComplete(phase: Phase) {
  await post('/track/phase-complete', { phase });
}

export async function trackGuardrail(
  type: string,
  layer: 'input' | 'output',
  description: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  await post('/track/guardrail', { type, layer, description, severity });
}

export async function trackLatency(latencyMs: number, phase: Phase) {
  await post('/track/latency', { latencyMs, phase });
}

// ── Admin Fetchers ──

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/admin/users`);
  return res.json();
}

export async function fetchGuardrails() {
  const res = await fetch(`${API_BASE}/admin/guardrails`);
  return res.json();
}

export async function fetchActivity() {
  const res = await fetch(`${API_BASE}/admin/activity`);
  return res.json();
}

export async function fetchFeedback() {
  const res = await fetch(`${API_BASE}/admin/feedback`);
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
