export type Phase =
  | 'Ideation'
  | 'Opportunity'
  | 'Concept/Prototype'
  | 'Testing & Analysis'
  | 'Roll-out'
  | 'Monitoring';

export interface Deliverable {
  id: string;
  label: string;
  description: string;
  suggestion: string;
  expertTip?: string;
  content?: string;
  status: 'pending' | 'completed';
}

export interface PhaseInfo {
  id: Phase;
  label: string;
  deliverables: Deliverable[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  phase: Phase;
}

export interface PhaseTool {
  name: string;
  category: string;
  purpose: string;
  url: string;
}

export interface PhaseLiterature {
  tools: PhaseTool[];
}

export interface AppState {
  currentPhase: Phase;
  messages: Record<Phase, Message[]>;
  deliverables: Record<Phase, Deliverable[]>;
}
