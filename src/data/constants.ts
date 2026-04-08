import type { Phase } from '../types';

export const PHASES: Phase[] = [
  'Ideation',
  'Opportunity',
  'Concept/Prototype',
  'Testing & Analysis',
  'Roll-out',
  'Monitoring',
];

export const HEARTBEAT_INTERVAL_MS = 30_000;
export const API_TIMEOUT_MS = 120_000;
export const MAX_MESSAGES_CONTEXT = 10;

export const STORAGE_KEYS = {
  messages: 'aipl_messages',
  deliverables: 'aipl_deliverables',
  feedback: 'aipl_feedback',
  sessionId: 'aipl_session_id',
} as const;
