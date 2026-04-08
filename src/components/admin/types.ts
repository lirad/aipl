export type AdminTab = 'overview' | 'guardrails' | 'users' | 'monitoring';

export interface DashboardData {
  kpis: {
    totalUsers: number;
    activeSessions: number;
    totalMessages: number;
    totalCompletions: number;
    guardrailsTriggered: number;
    guardrailsInput: number;
    guardrailsOutput: number;
    feedbackPositive: number;
    feedbackNegative: number;
  };
  phaseCompletions: Record<string, number>;
  phaseMessages: Record<string, number>;
  latency: { avg: number; max: number; samples: number };
  dau: { date: string; count: number }[];
}

export interface UserData {
  sessionId: string;
  currentPhase: string;
  messageCount: number;
  startedAt: number;
  lastActive: number;
}

export interface GuardrailLog {
  sessionId: string;
  type: string;
  layer: string;
  description: string;
  severity: string;
  timestamp: number;
}

export interface ActivityLog {
  sessionId: string;
  phase: string;
  role?: string;
  content?: string;
  timestamp: number;
}

export interface FeedbackLog {
  sessionId: string;
  phase: string;
  rating: 'positive' | 'negative';
  messagePreview: string;
  timestamp: number;
}

export interface FeedbackData {
  total: number;
  positive: number;
  negative: number;
  byPhase: Record<string, { positive: number; negative: number }>;
  logs: FeedbackLog[];
}

export const PHASE_COLORS: Record<string, string> = {
  'Ideation': 'bg-amber-500',
  'Opportunity': 'bg-blue-500',
  'Concept/Prototype': 'bg-purple-500',
  'Testing & Analysis': 'bg-green-500',
  'Roll-out': 'bg-orange-500',
  'Monitoring': 'bg-red-500',
};

export const PHASE_LABELS: Record<string, string> = {
  'Ideation': 'Ideation',
  'Opportunity': 'Opportunity',
  'Concept/Prototype': 'Concept & Proto',
  'Testing & Analysis': 'Test & Analysis',
  'Roll-out': 'Roll-out',
  'Monitoring': 'Monitoring',
};

export const GUARDRAIL_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'pii_detected': { label: 'PII Detectado', icon: 'eye', color: 'text-red-500' },
  'prompt_injection': { label: 'Prompt Injection', icon: 'shield', color: 'text-red-600' },
  'hallucination': { label: 'Alucinacao', icon: 'brain', color: 'text-orange-500' },
  'toxic_content': { label: 'Conteudo Toxico', icon: 'alert', color: 'text-red-500' },
  'format_violation': { label: 'Formato Invalido', icon: 'file', color: 'text-yellow-500' },
  'off_topic': { label: 'Fora do Topico', icon: 'compass', color: 'text-blue-500' },
};

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s atras`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m atras`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atras`;
  return `${Math.floor(diff / 86400000)}d atras`;
}
