# AIPL Educational Repository Transformation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the monolithic AIPL app into a modular, secure, educational repository with dual deploy modes (local/cloud) and comprehensive documentation.

**Architecture:** Extract App.tsx (1128 lines) and AdminDashboard.tsx (893 lines) into focused components, hooks, and services. Separate AIPL framework content (phases, tools, prompts) into a `data/` layer. Add auto-detection for local vs cloud mode. Create educational README, CLAUDE.md, AGENTS.md, CONTRIBUTING.md.

**Tech Stack:** React 19, TypeScript (strict), Vite 6, Tailwind CSS 4, Google Gemini API, Express, Redis (ioredis), zod (new)

---

## Task 1: Foundation — TypeScript Types & Data Layer

Extract type definitions and AIPL content from the monolithic `types.ts` into focused modules.

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/phases.ts`
- Create: `src/data/tools.ts`
- Create: `src/data/prompts.ts`
- Create: `src/data/constants.ts`
- Delete: `src/types.ts` (after migration)

- [ ] **Step 1: Create `src/types/index.ts`**

Extract only the type/interface definitions (no data):

```typescript
// src/types/index.ts

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
```

- [ ] **Step 2: Create `src/data/constants.ts`**

```typescript
// src/data/constants.ts

import type { Phase } from '../types';

/** All phases in order — single source of truth */
export const PHASES: Phase[] = [
  'Ideation',
  'Opportunity',
  'Concept/Prototype',
  'Testing & Analysis',
  'Roll-out',
  'Monitoring',
];

// ── Timing Constants ──
export const HEARTBEAT_INTERVAL_MS = 30_000;
export const API_TIMEOUT_MS = 120_000;
export const MAX_MESSAGES_CONTEXT = 10;

// ── Storage Keys ──
export const STORAGE_KEYS = {
  messages: 'aipl_messages',
  deliverables: 'aipl_deliverables',
  feedback: 'aipl_feedback',
  sessionId: 'aipl_session_id',
} as const;
```

- [ ] **Step 3: Create `src/data/phases.ts`**

Move the entire `PHASE_DETAILS` array from `src/types.ts` into this file. This is the AIPL framework content — the educational heart of the app.

```typescript
// src/data/phases.ts

import type { PhaseInfo } from '../types';

/**
 * AIPL Framework Content
 *
 * Each phase has 2-4 deliverables that guide the student through
 * the AI product development lifecycle. The content here defines
 * what students learn — modify this to change the curriculum.
 */
export const PHASE_DETAILS: PhaseInfo[] = [
  // ... (copy the entire PHASE_DETAILS array from src/types.ts lines 25-end)
  // Keep ALL existing content exactly as-is
];
```

Copy the full PHASE_DETAILS array from the current `src/types.ts` (starting at line 25) into this file verbatim.

- [ ] **Step 4: Create `src/data/tools.ts`**

Extract the `PHASE_TOOLS` data (if it exists in types.ts) into its own file. If tools are embedded in PHASE_DETAILS, keep them there and skip this file.

- [ ] **Step 5: Create `src/data/prompts.ts`**

Extract system prompt templates and phase-related text content from App.tsx:

```typescript
// src/data/prompts.ts

import type { Phase, Deliverable } from '../types';
import { PHASES } from './constants';

/** Welcome text shown when entering each phase */
export const PHASE_INTROS: Record<Phase, { emoji: string; objective: string }> = {
  'Ideation': { emoji: '💡', objective: 'Vamos mapear a oportunidade, definir quem usa e classificar o nível de IA do produto.' },
  'Opportunity': { emoji: '🔍', objective: 'Hora de validar se a oportunidade é real — os 4 SIMs, concorrência e estratégia de dados.' },
  'Concept/Prototype': { emoji: '🛠️', objective: 'Vamos projetar o contexto do modelo, a experiência do agente e estimar custos.' },
  'Testing & Analysis': { emoji: '🧪', objective: 'Métricas em 4 camadas, plano de evals e mitigação de riscos.' },
  'Roll-out': { emoji: '🚀', objective: 'Rollout faseado (Canary → Beta → GA) e onboarding transparente.' },
  'Monitoring': { emoji: '📊', objective: 'Observabilidade e ciclo de melhoria contínua.' },
};

/** Onboarding card content for each phase */
export const PHASE_ONBOARDING: Record<Phase, { title: string; subtitle: string; cta: string }> = {
  'Ideation': {
    title: "Qual problema sua IA resolve?",
    subtitle: "Vamos mapear a dor, os dados, a viabilidade e o valor. Depois definimos quem usa e o nível de IA.",
    cta: "Começar Ideação"
  },
  'Opportunity': {
    title: "A oportunidade é real?",
    subtitle: "4 perguntas SIM/NÃO para validar. Depois: concorrência e estratégia de dados.",
    cta: "Validar Oportunidade"
  },
  'Concept/Prototype': {
    title: "Como a IA funciona por dentro?",
    subtitle: "Context Engineering (prompt + RAG + tools), experiência do agente, guardrails e custo por request.",
    cta: "Projetar o Conceito"
  },
  'Testing & Analysis': {
    title: "Está funcionando bem?",
    subtitle: "Métricas em 4 camadas, plano de evals e mapeamento de riscos.",
    cta: "Definir Métricas e Evals"
  },
  'Roll-out': {
    title: "Como lançar com segurança?",
    subtitle: "Canary → Beta → GA. Nunca lance para 100% de uma vez.",
    cta: "Planejar Rollout"
  },
  'Monitoring': {
    title: "Como manter evoluindo?",
    subtitle: "Observabilidade, alertas e o ciclo de feedback → melhoria → medição.",
    cta: "Configurar Monitoramento"
  },
};

/** Auto-start prompts when student clicks the phase CTA button */
export const PHASE_START_PROMPTS: Record<Phase, string> = {
  'Ideation': "Quero começar a ideação. Me guie pelo Canvas de Oportunidade, Persona com nível de autonomia e Espectro da IA.",
  'Opportunity': "Quero validar a oportunidade. Me guie pela Validação Rápida (4 SIMs), Mapa Competitivo e Dados & Privacidade.",
  'Concept/Prototype': "Quero projetar o conceito. Me guie pelo Context Engineering, Experiência do Agente e Modelo & Custo.",
  'Testing & Analysis': "Quero definir como testar. Me guie pelas 4 Camadas de Métricas, Plano de Evals e Riscos & Guardrails.",
  'Roll-out': "Quero planejar o lançamento. Me guie pelo Rollout Faseado e Onboarding & Limitações.",
  'Monitoring': "Quero configurar o monitoramento. Me guie pela Observabilidade e Ciclo de Melhoria.",
};

/** Build dynamic welcome message for a phase, including previous phase context */
export function buildPhaseWelcome(
  phase: Phase,
  allDeliverables: Record<Phase, Deliverable[]>,
  phaseDetails: { id: Phase; deliverables: Deliverable[] }[],
): string {
  const phaseIndex = PHASES.indexOf(phase);
  const phaseInfo = phaseDetails.find(p => p.id === phase);
  const deliverablesList = phaseInfo?.deliverables
    .map((d, i) => `${i + 1}. **${d.label}** — ${d.description}`)
    .join('\n') || '';

  let prevSummary = '';
  if (phaseIndex > 0) {
    const prevPhase = PHASES[phaseIndex - 1];
    const prevDeliverables = allDeliverables[prevPhase] || [];
    const completedItems = prevDeliverables.filter(d => d.status === 'completed');
    if (completedItems.length > 0) {
      prevSummary = `Na fase anterior (**${prevPhase}**), definimos:\n${completedItems.map(d =>
        `- **${d.label}**: ${d.content ? d.content.slice(0, 120) + (d.content.length > 120 ? '...' : '') : 'Concluído'}`
      ).join('\n')}\n\n`;
    }
  }

  const intro = PHASE_INTROS[phase];
  const firstDeliverable = phaseInfo?.deliverables[0];

  return `${prevSummary}Bem-vindo à fase **${phase}** ${intro.emoji}\n\n${intro.objective}\n\nEntregáveis desta fase:\n${deliverablesList}\n\nVamos começar pelo primeiro: **${firstDeliverable?.label}**. Clique no botão abaixo ou me diga por onde quer iniciar!`;
}
```

- [ ] **Step 6: Delete old `src/types.ts` and update all imports**

Update every file that imports from `'./types'` or `'../types'` to import from the new locations:
- Types → `'../types'` or `'./types'`
- `PHASE_DETAILS` → `'../data/phases'`
- `PHASES` → `'../data/constants'`

Files to update: `src/App.tsx`, `src/services/gemini.ts`, `src/services/analytics.ts`, `src/AdminDashboard.tsx`, `src/DocumentExport.tsx`

- [ ] **Step 7: Verify the app compiles**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit`
Expected: No errors (warnings OK)

- [ ] **Step 8: Commit**

```bash
git add src/types/ src/data/ src/types.ts src/App.tsx src/services/ src/AdminDashboard.tsx src/DocumentExport.tsx
git commit -m "refactor: extract types and data layer into focused modules"
```

---

## Task 2: Custom Hooks — Extract State Logic from App.tsx

Move all state management and side effects out of App.tsx into reusable hooks.

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/hooks/useChat.ts`
- Create: `src/hooks/usePhases.ts`
- Create: `src/hooks/useDeliverables.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useLocalStorage.ts`**

```typescript
// src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

/**
 * A typed hook that syncs React state with localStorage.
 * Data persists across page reloads — this is how the app
 * works in "local mode" without a database.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

- [ ] **Step 2: Create `src/hooks/usePhases.ts`**

```typescript
// src/hooks/usePhases.ts

import { useState, useMemo } from 'react';
import type { Phase, Deliverable } from '../types';
import { PHASES } from '../data/constants';

/**
 * Manages phase navigation and progress tracking.
 * The student moves through 6 phases linearly,
 * but can jump back to any completed phase.
 */
export function usePhases(currentDeliverables: Deliverable[]) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('Ideation');

  const phaseProgress = useMemo(() => {
    const completed = currentDeliverables.filter(d => d.status === 'completed').length;
    return currentDeliverables.length > 0
      ? (completed / currentDeliverables.length) * 100
      : 0;
  }, [currentDeliverables]);

  const allCompleted = currentDeliverables.every(d => d.status === 'completed');

  const goToNextPhase = () => {
    const currentIndex = PHASES.indexOf(currentPhase);
    if (currentIndex < PHASES.length - 1) {
      setCurrentPhase(PHASES[currentIndex + 1]);
    }
  };

  return {
    currentPhase,
    setCurrentPhase,
    phaseProgress,
    allCompleted,
    goToNextPhase,
  };
}
```

- [ ] **Step 3: Create `src/hooks/useDeliverables.ts`**

```typescript
// src/hooks/useDeliverables.ts

import { useEffect } from 'react';
import type { Phase, Deliverable } from '../types';
import { PHASE_DETAILS } from '../data/phases';
import { STORAGE_KEYS } from '../data/constants';
import { useLocalStorage } from './useLocalStorage';
import { reformatDeliverableContent } from '../services/gemini';

/**
 * Manages deliverable state across all phases.
 * Syncs with PHASE_DETAILS on mount (handles curriculum updates)
 * and persists to localStorage.
 */
export function useDeliverables() {
  const [deliverablesByPhase, setDeliverablesByPhase] = useLocalStorage<Record<Phase, Deliverable[]>>(
    STORAGE_KEYS.deliverables,
    buildInitialDeliverables(),
  );

  // Reformat completed deliverables that lack markdown formatting (once on mount)
  useEffect(() => {
    Object.entries(deliverablesByPhase).forEach(([phase, dels]) => {
      dels.forEach(d => {
        if (d.status === 'completed' && d.content && !d.content.includes('**')) {
          reformatDeliverableContent(d.content, d.label).then(formatted => {
            if (formatted !== d.content) {
              setDeliverablesByPhase(prev => ({
                ...prev,
                [phase]: prev[phase as Phase].map(dd =>
                  dd.id === d.id ? { ...dd, content: formatted } : dd
                ),
              }));
            }
          });
        }
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDeliverable = (phase: Phase, id: string, content: string) => {
    setDeliverablesByPhase(prev => ({
      ...prev,
      [phase]: prev[phase].map(d =>
        d.id === id
          ? { ...d, content, status: content.trim() ? 'completed' : 'pending' }
          : d
      ),
    }));
  };

  const resetPhaseDeliverables = (phase: Phase) => {
    const initial = PHASE_DETAILS.find(p => p.id === phase);
    if (!initial) return;
    setDeliverablesByPhase(prev => ({
      ...prev,
      [phase]: initial.deliverables.map(d => ({ ...d, content: '', status: 'pending' })),
    }));
  };

  return {
    deliverablesByPhase,
    setDeliverablesByPhase,
    updateDeliverable,
    resetPhaseDeliverables,
  };
}

function buildInitialDeliverables(): Record<Phase, Deliverable[]> {
  const result = {} as Record<Phase, Deliverable[]>;
  PHASE_DETAILS.forEach(p => {
    result[p.id] = p.deliverables;
  });
  return result;
}
```

- [ ] **Step 4: Create `src/hooks/useChat.ts`**

```typescript
// src/hooks/useChat.ts

import { useState, useEffect, useRef } from 'react';
import type { Phase, Message, Deliverable } from '../types';
import { PHASES, STORAGE_KEYS, API_TIMEOUT_MS } from '../data/constants';
import { PHASE_DETAILS } from '../data/phases';
import { buildPhaseWelcome, PHASE_START_PROMPTS } from '../data/prompts';
import { useLocalStorage } from './useLocalStorage';
import { getChatResponse, reformatDeliverableContent } from '../services/gemini';
import { trackMessage, trackPhaseComplete, trackLatency } from '../services/analytics';

/**
 * Manages chat messages, AI responses, and deliverable updates from chat.
 * This is the core interaction loop: student asks → Gemini responds →
 * deliverables get filled automatically via JSON schema.
 */
export function useChat(
  currentPhase: Phase,
  deliverablesByPhase: Record<Phase, Deliverable[]>,
  setDeliverablesByPhase: React.Dispatch<React.SetStateAction<Record<Phase, Deliverable[]>>>,
  setCurrentPhase: (phase: Phase) => void,
) {
  const [messagesByPhase, setMessagesByPhase] = useLocalStorage<Record<Phase, Message[]>>(
    STORAGE_KEYS.messages,
    buildInitialMessages(),
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inject welcome messages for empty phases on mount
  useEffect(() => {
    const updates: Partial<Record<Phase, Message[]>> = {};
    PHASES.forEach(p => {
      if (!messagesByPhase[p] || messagesByPhase[p].length === 0) {
        updates[p] = [{
          role: 'model',
          content: buildPhaseWelcome(p, deliverablesByPhase, PHASE_DETAILS),
          phase: p,
        }];
      }
    });
    if (Object.keys(updates).length > 0) {
      setMessagesByPhase(prev => ({ ...prev, ...updates }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh welcome when switching to a phase with only the welcome message
  useEffect(() => {
    const msgs = messagesByPhase[currentPhase];
    if (msgs && msgs.length === 1 && msgs[0].role === 'model') {
      const freshWelcome = buildPhaseWelcome(currentPhase, deliverablesByPhase, PHASE_DETAILS);
      if (msgs[0].content !== freshWelcome) {
        setMessagesByPhase(prev => ({
          ...prev,
          [currentPhase]: [{ role: 'model', content: freshWelcome, phase: currentPhase }],
        }));
      }
    }
  }, [currentPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentMessages = messagesByPhase[currentPhase] || [];

  const handleSend = async (customInput?: string) => {
    const textToSend = typeof customInput === 'string' ? customInput : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend, phase: currentPhase };
    setMessagesByPhase(prev => ({
      ...prev,
      [currentPhase]: [...prev[currentPhase], userMessage],
    }));
    setInput('');
    setIsLoading(true);

    try {
      trackMessage(currentPhase, 'user', textToSend);

      const history = [...messagesByPhase[currentPhase], userMessage].map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }],
      }));

      const responsePromise = getChatResponse(history, currentPhase, deliverablesByPhase);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: AI took too long to respond.')), API_TIMEOUT_MS)
      );

      const startTime = Date.now();
      const response = await Promise.race([responsePromise, timeoutPromise]);
      trackLatency(Date.now() - startTime, currentPhase);
      trackMessage(currentPhase, 'model', response.text);

      const modelMessage: Message = { role: 'model', content: response.text, phase: currentPhase };
      setMessagesByPhase(prev => ({
        ...prev,
        [currentPhase]: [...prev[currentPhase], modelMessage],
      }));

      // Apply deliverable updates from the AI response
      if (response.deliverableUpdates?.length > 0) {
        for (const update of response.deliverableUpdates) {
          const del = deliverablesByPhase[currentPhase].find(d => d.id === update.id);
          reformatDeliverableContent(update.content, del?.label || update.id).then(formatted => {
            setDeliverablesByPhase(prev => ({
              ...prev,
              [currentPhase]: prev[currentPhase].map(d =>
                d.id === update.id ? { ...d, content: formatted } : d
              ),
            }));
          });
        }

        setDeliverablesByPhase(prev => {
          const updated = prev[currentPhase].map(d => {
            const upd = response.deliverableUpdates.find((u: { id: string }) => u.id === d.id);
            return upd ? { ...d, content: upd.content, status: 'completed' as const } : d;
          });

          const allDone = updated.every(d => d.status === 'completed');
          if (allDone) {
            trackPhaseComplete(currentPhase);
            addCongratsMessage(currentPhase);
          }

          return { ...prev, [currentPhase]: updated };
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Sorry, an error occurred while processing your message.';
      setMessagesByPhase(prev => ({
        ...prev,
        [currentPhase]: [...prev[currentPhase], { role: 'model', content: errorMessage, phase: currentPhase }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPhase = () => handleSend(PHASE_START_PROMPTS[currentPhase]);

  const resetPhaseMessages = () => {
    setMessagesByPhase(prev => ({
      ...prev,
      [currentPhase]: [{
        role: 'model',
        content: buildPhaseWelcome(currentPhase, deliverablesByPhase, PHASE_DETAILS),
        phase: currentPhase,
      }],
    }));
  };

  function addCongratsMessage(phase: Phase) {
    setTimeout(() => {
      const nextPhase = PHASES[PHASES.indexOf(phase) + 1];
      if (!nextPhase) return;
      setMessagesByPhase(m => {
        const msgs = m[phase];
        if (msgs.some(msg => msg.content.includes('Parabéns!') && msg.content.includes(phase))) return m;
        return {
          ...m,
          [phase]: [...msgs, {
            role: 'model' as const,
            content: `🎉 **Parabéns!** Você concluiu todos os entregáveis da fase **${phase}**. \n\nDeseja avançar para a próxima fase: **${nextPhase}**?`,
            phase,
          }],
        };
      });
    }, 1500);
  }

  return {
    messagesByPhase,
    currentMessages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSend,
    handleStartPhase,
    resetPhaseMessages,
    scrollToBottom,
  };
}

function buildInitialMessages(): Record<Phase, Message[]> {
  const result = {} as Record<Phase, Message[]>;
  PHASES.forEach(p => { result[p] = []; });
  return result;
}
```

- [ ] **Step 5: Verify the app compiles**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/hooks/
git commit -m "refactor: extract state management into custom hooks"
```

---

## Task 3: UI Components — Break Down App.tsx

Extract the monolithic JSX into focused, reusable components.

**Files:**
- Create: `src/components/ui/ErrorBoundary.tsx`
- Create: `src/components/ui/Layout.tsx`
- Create: `src/components/chat/ChatPanel.tsx`
- Create: `src/components/chat/ChatMessage.tsx`
- Create: `src/components/chat/ChatInput.tsx`
- Create: `src/components/chat/TypingIndicator.tsx`
- Create: `src/components/phases/PhaseNavigation.tsx`
- Create: `src/components/phases/PhaseOnboarding.tsx`
- Create: `src/components/deliverables/DeliverablePanel.tsx`
- Create: `src/components/deliverables/DeliverableCard.tsx`
- Create: `src/components/deliverables/DeliverableEditor.tsx`
- Create: `src/components/workspace/WorkspaceView.tsx`
- Modify: `src/App.tsx` (rewrite as slim orchestrator)
- Modify: `src/main.tsx` (add ErrorBoundary)

- [ ] **Step 1: Create `src/components/ui/ErrorBoundary.tsx`**

```typescript
// src/components/ui/ErrorBoundary.tsx

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors anywhere in the component tree and shows
 * a friendly fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Create chat components**

Create `src/components/chat/ChatMessage.tsx`:
```typescript
import { cn } from '../../lib/utils';
import { User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

interface Props {
  message: Message;
  index: number;
  feedback?: 'positive' | 'negative';
  onFeedback?: (index: number, rating: 'positive' | 'negative') => void;
}

export function ChatMessage({ message, index, feedback, onFeedback }: Props) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn("flex gap-4", message.role === 'user' ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
        message.role === 'user' ? "bg-gray-900 text-white" : "bg-white text-blue-600 border border-gray-100"
      )}>
        {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={cn("flex flex-col max-w-[85%]", message.role === 'user' ? "items-end" : "items-start")}>
        <div className={cn(
          "px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm",
          message.role === 'user'
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        )}>
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-3 prose-headings:text-inherit prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-inherit prose-ul:list-disc prose-ul:my-2 prose-li:my-1 prose-ol:my-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {message.role === 'model' && index > 0 && onFeedback && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <button
              onClick={() => onFeedback(index, 'positive')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                feedback === 'positive'
                  ? "bg-green-100 text-green-600"
                  : "text-gray-300 hover:text-green-500 hover:bg-green-50"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(index, 'negative')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                feedback === 'negative'
                  ? "bg-red-100 text-red-600"
                  : "text-gray-300 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {feedback && (
              <span className={cn(
                "text-[10px] font-bold ml-1",
                feedback === 'positive' ? "text-green-500" : "text-red-500"
              )}>
                {feedback === 'positive' ? 'Obrigado!' : 'Vamos melhorar'}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

Create `src/components/chat/TypingIndicator.tsx`:
```typescript
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
        <Bot className="w-5 h-5 animate-pulse" />
      </div>
      <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex flex-col gap-2">
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Processando resposta...
        </span>
      </div>
    </div>
  );
}
```

Create `src/components/chat/ChatInput.tsx`:
```typescript
import { Send } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
}

export function ChatInput({ value, onChange, onSend, disabled, placeholder }: Props) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-[2rem] pl-6 pr-20 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-2xl shadow-blue-900/5 resize-none min-h-[64px] max-h-[200px]"
        rows={1}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="absolute right-3 bottom-3 p-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 group"
      >
        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
```

Create `src/components/chat/ChatPanel.tsx` — composes ChatMessage, TypingIndicator, ChatInput, and PhaseOnboarding into the full chat view. This file assembles the chat area from App.tsx lines 737-962.

- [ ] **Step 3: Create phase components**

Create `src/components/phases/PhaseNavigation.tsx` — the sidebar from App.tsx lines 530-653 (phase list, deliverable list, progress bar, reset button).

Create `src/components/phases/PhaseOnboarding.tsx` — the onboarding hero card from App.tsx lines 748-820.

- [ ] **Step 4: Create workspace components**

Create `src/components/workspace/WorkspaceView.tsx` — the workspace from App.tsx lines 964-1122 (deliverable list sidebar + editor area).

Create `src/components/deliverables/DeliverableCard.tsx` — individual deliverable item in sidebar lists.

Create `src/components/deliverables/DeliverableEditor.tsx` — the editor/preview area from App.tsx lines 1017-1092.

- [ ] **Step 5: Rewrite `src/App.tsx` as slim orchestrator**

The new App.tsx should be ~150-200 lines, composing hooks and components:

```typescript
// src/App.tsx — Slim orchestrator

import { useState, useEffect } from 'react';
import { usePhases } from './hooks/usePhases';
import { useDeliverables } from './hooks/useDeliverables';
import { useChat } from './hooks/useChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './data/constants';
import { startSession, heartbeat, trackFeedback } from './services/analytics';
import { HEARTBEAT_INTERVAL_MS } from './data/constants';
import { PhaseNavigation } from './components/phases/PhaseNavigation';
import { ChatPanel } from './components/chat/ChatPanel';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { DocumentExport } from './components/document/DocumentExport';
import { AdminDashboard } from './components/admin/AdminDashboard';
// ... header imports (icons, cn, etc.)

type View = 'chat' | 'workspace' | 'document' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { deliverablesByPhase, setDeliverablesByPhase, updateDeliverable, resetPhaseDeliverables } = useDeliverables();
  const { currentPhase, setCurrentPhase, phaseProgress, allCompleted, goToNextPhase } = usePhases(
    deliverablesByPhase[/* currentPhase — will need to wire */]
  );
  const chat = useChat(currentPhase, deliverablesByPhase, setDeliverablesByPhase, setCurrentPhase);
  const [feedbackGiven, setFeedbackGiven] = useLocalStorage<Record<string, 'positive' | 'negative'>>(
    STORAGE_KEYS.feedback, {}
  );

  // Analytics: session start + heartbeat
  useEffect(() => {
    startSession();
    const interval = setInterval(() => heartbeat(currentPhase), HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentPhase]);

  const handleFeedback = (index: number, rating: 'positive' | 'negative') => {
    const key = `${currentPhase}:${index}`;
    setFeedbackGiven(prev => ({ ...prev, [key]: rating }));
    trackFeedback(currentPhase, rating, chat.currentMessages[index]?.content || '');
  };

  const handleResetPhase = () => {
    chat.resetPhaseMessages();
    resetPhaseDeliverables(currentPhase);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      <PhaseNavigation
        isOpen={isSidebarOpen}
        currentPhase={currentPhase}
        onPhaseSelect={setCurrentPhase}
        deliverables={deliverablesByPhase[currentPhase]}
        phaseProgress={phaseProgress}
        onViewDeliverable={(id) => { setView('workspace'); /* set active */ }}
        onResetAll={() => { localStorage.clear(); window.location.reload(); }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header with view tabs — extracted inline */}
        {/* ... */}

        {view === 'admin' ? <AdminDashboard /> :
         view === 'document' ? <DocumentExport deliverablesByPhase={deliverablesByPhase} /> :
         view === 'chat' ? (
          <ChatPanel
            messages={chat.currentMessages}
            isLoading={chat.isLoading}
            input={chat.input}
            onInputChange={chat.setInput}
            onSend={chat.handleSend}
            onStartPhase={chat.handleStartPhase}
            currentPhase={currentPhase}
            deliverables={deliverablesByPhase[currentPhase]}
            allCompleted={allCompleted}
            onNextPhase={() => { goToNextPhase(); setView('chat'); }}
            feedbackGiven={feedbackGiven}
            onFeedback={handleFeedback}
            messagesEndRef={chat.messagesEndRef}
          />
        ) : (
          <WorkspaceView
            deliverables={deliverablesByPhase[currentPhase]}
            currentPhase={currentPhase}
            onUpdate={(id, content) => updateDeliverable(currentPhase, id, content)}
            onBackToChat={() => setView('chat')}
          />
        )}
      </main>
    </div>
  );
}
```

Note: The exact wiring will require adjustments as you implement. The key constraint is: App.tsx should be under 200 lines and only compose — no inline JSX for chat messages, deliverables, etc.

- [ ] **Step 6: Update `src/main.tsx` with ErrorBoundary**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
```

- [ ] **Step 7: Verify the app compiles and renders**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit`
Run: `cd /Users/lirad/Repositories/AIPL && npm run build`
Expected: Both succeed

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/App.tsx src/main.tsx
git commit -m "refactor: decompose App.tsx into focused components and hooks"
```

---

## Task 4: Admin Dashboard — Decompose

Break AdminDashboard.tsx (893 lines) into focused sub-components.

**Files:**
- Create: `src/components/admin/AdminDashboard.tsx` (slim orchestrator)
- Create: `src/components/admin/MetricsOverview.tsx`
- Create: `src/components/admin/GuardrailsPanel.tsx`
- Create: `src/components/admin/UsersPanel.tsx`
- Create: `src/components/admin/MonitoringPanel.tsx`
- Delete: `src/AdminDashboard.tsx`

- [ ] **Step 1: Read existing AdminDashboard.tsx and identify sections**

The existing file has 4 tabs: Overview, Guardrails, Users, Monitoring. Each becomes its own component.

- [ ] **Step 2: Create sub-components**

Extract each tab's JSX into its own file. The new `AdminDashboard.tsx` orchestrates tabs and data fetching:

```typescript
// src/components/admin/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { fetchDashboard, fetchUsers, fetchGuardrails, fetchActivity, fetchFeedback } from '../../services/analytics';
import { MetricsOverview } from './MetricsOverview';
import { GuardrailsPanel } from './GuardrailsPanel';
import { UsersPanel } from './UsersPanel';
import { MonitoringPanel } from './MonitoringPanel';

type Tab = 'overview' | 'guardrails' | 'users' | 'monitoring';

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<Record<string, unknown>>({});
  // ... fetch logic, tab rendering
}
```

- [ ] **Step 3: Verify and commit**

Run: `cd /Users/lirad/Repositories/AIPL && npm run build`
```bash
git add src/components/admin/ src/AdminDashboard.tsx
git commit -m "refactor: decompose AdminDashboard into focused sub-components"
```

---

## Task 5: Services — Security & Dual Mode

Fix security issues and implement local/cloud auto-detection.

**Files:**
- Modify: `src/services/gemini.ts`
- Modify: `src/services/analytics.ts`
- Create: `src/services/storage.ts`
- Modify: `vite.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Fix Gemini API key handling in `vite.config.ts`**

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

Key change: Remove `process.env.GEMINI_API_KEY` from `define`. Use Vite's built-in `VITE_` prefix instead.

- [ ] **Step 2: Update `src/services/gemini.ts` to use Vite env**

```typescript
// Line 4 — change from:
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
// To:
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
```

- [ ] **Step 3: Update `src/services/analytics.ts` with auto-detection**

```typescript
// src/services/analytics.ts

import type { Phase } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';
const API_AVAILABLE = Boolean(API_URL);

function getSessionId(): string {
  let sid = localStorage.getItem('aipl_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('aipl_session_id', sid);
  }
  return sid;
}

/**
 * Fire-and-forget POST to the analytics API.
 * In local mode (no VITE_API_URL), all calls are silent no-ops.
 * Analytics should never break the app.
 */
async function post(path: string, body: Record<string, unknown>) {
  if (!API_AVAILABLE) return; // Local mode: no-op
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

// ... rest of exports stay the same

// Admin fetchers also need the guard:
export async function fetchDashboard() {
  if (!API_AVAILABLE) return null;
  const res = await fetch(`${API_URL}/api/admin/dashboard`);
  return res.json();
}
// ... same pattern for other fetchers
```

- [ ] **Step 4: Update `.env.example`**

```bash
# Required: Your Google Gemini API key (get one at https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Only needed for cloud mode (Railway deployment)
# VITE_API_URL=https://your-railway-app.up.railway.app
# REDIS_URL=redis://user:password@host:port
# ADMIN_KEY=your_secret_admin_key
# PORT=3001
```

- [ ] **Step 5: Verify and commit**

Run: `cd /Users/lirad/Repositories/AIPL && npm run build`
```bash
git add src/services/ vite.config.ts .env.example
git commit -m "fix: remove hardcoded secrets, add dual-mode auto-detection"
```

---

## Task 6: Server — Security Hardening

Add input validation, admin protection, rate limiting, and remove hardcoded Redis URL.

**Files:**
- Modify: `server/index.ts`
- Create: `server/routes/session.ts`
- Create: `server/routes/tracking.ts`
- Create: `server/routes/admin.ts`
- Create: `server/middleware/validation.ts`
- Create: `server/middleware/rateLimit.ts`
- Create: `server/services/redis.ts`
- Modify: `package.json` (add zod, express-rate-limit)

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/lirad/Repositories/AIPL && npm install zod express-rate-limit
```

- [ ] **Step 2: Create `server/services/redis.ts`**

```typescript
// server/services/redis.ts

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error('[Redis] REDIS_URL environment variable is required. Exiting.');
  process.exit(1);
}

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));
```

- [ ] **Step 3: Create `server/middleware/validation.ts`**

```typescript
// server/middleware/validation.ts

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const VALID_PHASES = [
  'Ideation', 'Opportunity', 'Concept/Prototype',
  'Testing & Analysis', 'Roll-out', 'Monitoring',
] as const;

export const SessionStartSchema = z.object({
  sessionId: z.string().uuid(),
  userAgent: z.string().optional(),
});

export const HeartbeatSchema = z.object({
  sessionId: z.string().uuid(),
  currentPhase: z.enum(VALID_PHASES).optional(),
});

export const TrackMessageSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
  role: z.enum(['user', 'model']),
  content: z.string().max(5000).optional(),
});

export const TrackPhaseCompleteSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
});

export const TrackGuardrailSchema = z.object({
  sessionId: z.string().uuid(),
  type: z.string().max(100),
  layer: z.enum(['input', 'output']),
  description: z.string().max(1000),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const TrackLatencySchema = z.object({
  sessionId: z.string().uuid(),
  latencyMs: z.number().min(0).max(300000),
  phase: z.enum(VALID_PHASES),
});

export const TrackFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  phase: z.enum(VALID_PHASES),
  rating: z.enum(['positive', 'negative']),
  messagePreview: z.string().max(500).optional(),
});

/** Express middleware that validates req.body against a zod schema */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
```

- [ ] **Step 4: Create `server/middleware/rateLimit.ts`**

```typescript
// server/middleware/rateLimit.ts

import rateLimit from 'express-rate-limit';

export const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests. Try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
```

- [ ] **Step 5: Create route files**

Create `server/routes/session.ts`, `server/routes/tracking.ts`, `server/routes/admin.ts` by extracting the corresponding endpoints from `server/index.ts`. Admin routes should check for `ADMIN_KEY`:

```typescript
// server/routes/admin.ts (excerpt)
import { Router } from 'express';
import { redis } from '../services/redis';

const router = Router();
const ADMIN_KEY = process.env.ADMIN_KEY;

router.use((req, res, next) => {
  if (ADMIN_KEY && req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }
  next();
});

// ... all GET /api/admin/* routes
export default router;
```

- [ ] **Step 6: Rewrite `server/index.ts` as slim entry point**

```typescript
// server/index.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sessionRoutes from './routes/session';
import trackingRoutes from './routes/tracking';
import adminRoutes from './routes/admin';
import { redis } from './services/redis';
import { trackingLimiter } from './middleware/rateLimit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Intentionally open CORS — this is an educational project.
// In production, restrict to specific origins.
app.use(cors());
app.use(express.json());

app.use('/api/session', sessionRoutes);
app.use('/api/track', trackingLimiter, trackingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', redis: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
});

// Serve frontend in production
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AIPL Server] Running on http://0.0.0.0:${PORT}`);
});
```

- [ ] **Step 7: Verify server compiles and starts**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add server/ package.json package-lock.json
git commit -m "fix: harden server with validation, rate limiting, and admin auth"
```

---

## Task 7: TypeScript Strict Mode

Enable strict TypeScript and fix all type errors.

**Files:**
- Modify: `tsconfig.json`
- Modify: Various source files (fix `any` types)

- [ ] **Step 1: Enable strict mode in `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./*"] },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

Key changes: Add `"strict": true`, remove `experimentalDecorators` and `useDefineForClassFields` (not needed).

- [ ] **Step 2: Run type check and fix errors**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit 2>&1 | head -50`

Fix all `any` types with proper interfaces. Common patterns to fix:
- `const initial: any = saved ? JSON.parse(saved) : {};` → use proper type assertion
- `response.deliverableUpdates.find((u: any) => ...)` → type the parameter
- `Promise.race([...]) as any` → properly type the race result

- [ ] **Step 3: Verify and commit**

Run: `cd /Users/lirad/Repositories/AIPL && npx tsc --noEmit`
Expected: No errors

```bash
git add tsconfig.json src/
git commit -m "feat: enable strict TypeScript mode"
```

---

## Task 8: Package.json & Config Cleanup

Fix package name, organize dependencies, update scripts for dual mode.

**Files:**
- Modify: `package.json`
- Modify: `nixpacks.toml`

- [ ] **Step 1: Update `package.json`**

```json
{
  "name": "aipl",
  "version": "1.0.0",
  "description": "AI Product Lifecycle — Interactive learning tool for building AI products",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit",
    "server": "tsx server/index.ts",
    "start": "npm run build && tsx server/index.ts",
    "dev:all": "npm run server & npm run dev"
  },
  "dependencies": {
    // Keep all existing, add zod and express-rate-limit
  },
  "devDependencies": {
    // Keep all existing, remove wrangler if not needed
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json nixpacks.toml
git commit -m "chore: update package metadata and scripts"
```

---

## Task 9: Documentation — README, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, LICENSE

Create all documentation files.

**Files:**
- Create: `README.md` (overwrite existing minimal one)
- Create: `CLAUDE.md`
- Create: `AGENTS.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`

- [ ] **Step 1: Create `README.md`**

Full educational README following the structure defined in the design spec:
- Header with badges and description
- What is AIPL (6-phase framework with diagram)
- Architecture diagram
- Quick Start (Local) — 5 steps
- Deploy to Cloud (Railway) — button + guide
- Tech Stack table
- Project Structure (annotated tree)
- How the AI Integration Works (context engineering, JSON schema, phase-aware prompting) — with real code snippets
- Key Design Decisions (intentional CORS, localStorage, own API key)
- Contributing link
- License

- [ ] **Step 2: Create `CLAUDE.md`**

```markdown
# AIPL — Claude Code Context

## Project
AIPL (AI Product Lifecycle) is an educational web app that guides students through 6 phases of building AI products. Built for Escola Tera's AI Product Management course.

## Tech Stack
- Frontend: React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS 4
- AI: Google Gemini API (client-side, student's own key)
- Backend (cloud mode only): Express + Redis (ioredis)
- Deployment: Railway (optional)

## How to Run
```bash
npm install
cp .env.example .env  # add your VITE_GEMINI_API_KEY
npm run dev            # local mode, no backend needed
```

## Code Conventions
- Language: English (code, comments, commits, docs)
- TypeScript: strict mode enabled
- Components: focused, under 250 lines each
- State: custom hooks in src/hooks/
- Data: AIPL framework content in src/data/ (phases, prompts, tools)
- Services: external integrations in src/services/

## Architecture
- src/components/ — UI pieces organized by feature (chat/, phases/, deliverables/, admin/)
- src/hooks/ — React hooks encapsulating state logic
- src/services/ — Gemini API, analytics, storage
- src/data/ — AIPL framework content (the curriculum)
- src/types/ — TypeScript definitions
- server/ — Express API (only used in cloud mode with Redis)

## Key Decisions
- CORS is intentionally open (educational project)
- Gemini API key is client-side (each student uses their own)
- localStorage for persistence in local mode
- Analytics are no-ops when no backend is available

## Do NOT
- Change AIPL phase content without explicit instruction
- Add unnecessary abstractions or over-engineer
- Commit .env files or hardcode API keys
```

- [ ] **Step 3: Create `AGENTS.md`**

```markdown
# AGENTS.md — AI Agent Instructions

## About This Project
AIPL is an educational app for teaching AI product development.
The codebase is structured for readability and learning.

## File Map
| Directory | Responsibility |
|-----------|---------------|
| src/components/ | UI components by feature |
| src/hooks/ | State management hooks |
| src/services/ | External service integrations |
| src/data/ | AIPL curriculum content |
| src/types/ | TypeScript definitions |
| server/ | Express API (cloud mode) |

## Guidelines
- Keep files under 250 lines
- Use TypeScript strict mode
- Follow existing component patterns
- Educational comments only where the "why" matters
- English for all code and documentation

## Protected Content
Do NOT modify without explicit instruction:
- Phase definitions in src/data/phases.ts
- System prompts in src/data/prompts.ts
- The 6-phase AIPL framework structure
```

- [ ] **Step 4: Create `CONTRIBUTING.md`**

Standard contributing guide: fork, branch, PR workflow. How to add a new phase or tool. Code style.

- [ ] **Step 5: Create `LICENSE`**

MIT License with current year and Lira as author.

- [ ] **Step 6: Commit**

```bash
git add README.md CLAUDE.md AGENTS.md CONTRIBUTING.md LICENSE
git commit -m "docs: add comprehensive README and project documentation"
```

---

## Task 10: Railway Template & Final Cleanup

Create Railway template config and clean up artifacts.

**Files:**
- Create: `railway.toml` (or update `nixpacks.toml`)
- Modify: `README.md` (add Deploy on Railway button)
- Remove: `AIPL-Document-2026-04-02.html` (generated artifact, shouldn't be in repo)
- Remove: `Ciclo de Gestão Com Produtos de IA.pdf` (binary, shouldn't be in repo)
- Remove: `.wrangler/` (if present and not needed)
- Update: `.gitignore` (add new patterns)

- [ ] **Step 1: Update `nixpacks.toml` for Railway**

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx tsx server/index.ts"
```

- [ ] **Step 2: Add Railway template button to README**

Add to the Cloud Deploy section of README:

```markdown
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/TEMPLATE_ID)
```

Note: The actual template ID will be created on Railway's dashboard by configuring a template from the repo. For now, add a placeholder and document the steps.

- [ ] **Step 3: Clean up artifacts**

Remove binary/generated files from tracking:
```bash
git rm --cached "AIPL-Document-2026-04-02.html" "Ciclo de Gestão Com Produtos de IA.pdf" 2>/dev/null || true
```

Update `.gitignore`:
```
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
.wrangler/
*.html
!index.html
*.pdf
```

- [ ] **Step 4: Final build verification**

```bash
cd /Users/lirad/Repositories/AIPL
npm run lint
npm run build
```

Both must pass.

- [ ] **Step 5: Commit**

```bash
git add nixpacks.toml .gitignore README.md
git commit -m "chore: add Railway template config and clean up artifacts"
```

---

## Task 11: Integration Verification

Verify the complete refactored app works end-to-end.

- [ ] **Step 1: Clean install test**

```bash
cd /Users/lirad/Repositories/AIPL
rm -rf node_modules
npm install
```

- [ ] **Step 2: Local mode test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Chat loads with welcome message
- Can send messages (requires valid Gemini key)
- Phase navigation works
- Deliverables panel works
- Workspace view works
- Document export works
- Admin tab shows "No backend connected" or graceful empty state

- [ ] **Step 3: Build test**

```bash
npm run build
```

Expected: Builds successfully, output in `dist/`

- [ ] **Step 4: Lint test**

```bash
npm run lint
```

Expected: No TypeScript errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: AIPL v2 — educational repository with modular architecture"
```
