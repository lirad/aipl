import type { Phase } from '../types';
import { STORAGE_KEYS } from '../data/constants';

// In cloud mode, VITE_API_URL points to the backend.
// In local mode (no VITE_API_URL), analytics are silent no-ops.
const API_URL = import.meta.env.VITE_API_URL || '';
const API_AVAILABLE = Boolean(API_URL);

function getSessionId(): string {
  let sid = localStorage.getItem(STORAGE_KEYS.sessionId);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.sessionId, sid);
  }
  return sid;
}

/**
 * Fire-and-forget POST to the analytics API.
 * In local mode (no VITE_API_URL), all tracking calls are silent no-ops.
 */
async function post(path: string, body: Record<string, unknown>) {
  if (!API_AVAILABLE) return;
  try {
    await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getSessionId(), ...body }),
    });
  } catch {
    // Intentionally silent — analytics must never break the app
  }
}

export function startSession() {
  post('/api/session/start', { userAgent: navigator.userAgent });
}

export function heartbeat(currentPhase: Phase) {
  post('/api/session/heartbeat', { currentPhase });
}

export function trackMessage(phase: Phase, role: 'user' | 'model', content?: string) {
  post('/api/track/message', { phase, role, content });
}

export function trackFeedback(phase: Phase, rating: 'positive' | 'negative', messagePreview: string) {
  post('/api/track/feedback', { phase, rating, messagePreview });
}

export function trackPhaseComplete(phase: Phase) {
  post('/api/track/phase-complete', { phase });
}

export function trackGuardrail(
  type: string,
  layer: 'input' | 'output',
  description: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  post('/api/track/guardrail', { type, layer, description, severity });
}

export function trackLatency(latencyMs: number, phase: Phase) {
  post('/api/track/latency', { latencyMs, phase });
}

// Admin fetchers — return null in local mode, throw on errors in cloud mode
async function adminFetch(path: string) {
  if (!API_AVAILABLE) return null;
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Admin fetch failed: ${res.status} ${path}`);
  return res.json();
}

export function fetchDashboard() { return adminFetch('/api/admin/dashboard'); }
export function fetchUsers() { return adminFetch('/api/admin/users'); }
export function fetchGuardrails() { return adminFetch('/api/admin/guardrails'); }
export function fetchActivity() { return adminFetch('/api/admin/activity'); }
export function fetchFeedback() { return adminFetch('/api/admin/feedback'); }
export function fetchHealth() { return adminFetch('/api/health'); }
