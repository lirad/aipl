import { useState, useRef, useEffect } from 'react';
import type { Phase, Message, Deliverable } from '../types';
import { PHASES, STORAGE_KEYS, API_TIMEOUT_MS } from '../data/constants';
import { PHASE_DETAILS } from '../data/phases';
import { buildPhaseWelcome, PHASE_START_PROMPTS } from '../data/prompts';
import { getChatResponse, reformatDeliverableContent } from '../services/gemini';
import { trackMessage, trackPhaseComplete, trackLatency } from '../services/analytics';

interface UseChatParams {
  currentPhase: Phase;
  setCurrentPhase: React.Dispatch<React.SetStateAction<Phase>>;
  deliverablesByPhase: Record<Phase, Deliverable[]>;
  setDeliverablesByPhase: React.Dispatch<React.SetStateAction<Record<Phase, Deliverable[]>>>;
  view: 'chat' | 'workspace' | 'document' | 'admin';
}

/**
 * Manages chat state and AI interaction for all phases.
 *
 * Responsibilities:
 * - messagesByPhase state (with localStorage persistence)
 * - input + isLoading state
 * - Welcome message injection and refresh on phase change
 * - handleSend: full flow (user msg -> Gemini -> deliverable updates -> congrats)
 * - handleStartPhase: sends the predefined start prompt
 * - handleResetPhase: resets messages for the current phase
 * - scrollToBottom helper
 */
export function useChat({
  currentPhase,
  setCurrentPhase,
  deliverablesByPhase,
  setDeliverablesByPhase,
  view,
}: UseChatParams) {
  const [messagesByPhase, setMessagesByPhase] = useState<Record<Phase, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.messages);
    const initial: Record<string, Message[]> = saved ? JSON.parse(saved) : {};

    // Ensure every phase has at least an empty array (welcome messages injected via useEffect)
    PHASES.forEach(p => {
      if (!initial[p]) {
        initial[p] = [];
      }
    });
    return initial as Record<Phase, Message[]>;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messagesByPhase));
  }, [messagesByPhase]);

  // Inject dynamic welcome messages for phases that have no messages
  useEffect(() => {
    const updates: Partial<Record<Phase, Message[]>> = {};
    PHASES.forEach(p => {
      if (!messagesByPhase[p] || messagesByPhase[p].length === 0) {
        updates[p] = [{
          role: 'model',
          content: buildPhaseWelcome(p, deliverablesByPhase, PHASE_DETAILS),
          phase: p
        }];
      }
    });
    if (Object.keys(updates).length > 0) {
      setMessagesByPhase(prev => ({ ...prev, ...updates }));
    }
  }, []); // Run once on mount

  // Refresh welcome message when switching to a phase with only the welcome message
  useEffect(() => {
    const msgs = messagesByPhase[currentPhase];
    if (msgs && msgs.length === 1 && msgs[0].role === 'model') {
      const freshWelcome = buildPhaseWelcome(currentPhase, deliverablesByPhase, PHASE_DETAILS);
      if (msgs[0].content !== freshWelcome) {
        setMessagesByPhase(prev => ({
          ...prev,
          [currentPhase]: [{ role: 'model', content: freshWelcome, phase: currentPhase }]
        }));
      }
    }
  }, [currentPhase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') scrollToBottom();
  }, [messagesByPhase, view, currentPhase]);

  const handleResetPhase = () => {
    setMessagesByPhase(prev => ({
      ...prev,
      [currentPhase]: [{
        role: 'model',
        content: buildPhaseWelcome(currentPhase, deliverablesByPhase, PHASE_DETAILS),
        phase: currentPhase
      }]
    }));
  };

  const handleStartPhase = async () => {
    handleSend(PHASE_START_PROMPTS[currentPhase]);
  };

  const handleSend = async (customInput?: string | React.MouseEvent) => {
    const textToSend = typeof customInput === 'string' ? customInput : input;
    if (!textToSend.trim() || isLoading) return;

    // Detect manual phase change requests
    const phaseKeywords: Record<string, Phase> = {
      'ideation': 'Ideation',
      'fase 1': 'Ideation',
      'etapa 1': 'Ideation',
      'opportunity': 'Opportunity',
      'fase 2': 'Opportunity',
      'etapa 2': 'Opportunity',
      'concept': 'Concept/Prototype',
      'prototype': 'Concept/Prototype',
      'fase 3': 'Concept/Prototype',
      'etapa 3': 'Concept/Prototype',
      'testing': 'Testing & Analysis',
      'analysis': 'Testing & Analysis',
      'fase 4': 'Testing & Analysis',
      'etapa 4': 'Testing & Analysis',
      'roll-out': 'Roll-out',
      'fase 5': 'Roll-out',
      'etapa 5': 'Roll-out',
      'monitoring': 'Monitoring',
      'fase 6': 'Monitoring',
      'etapa 6': 'Monitoring',
    };

    const lowerInput = textToSend.toLowerCase();
    let targetPhase: Phase | null = null;

    for (const [kw, phase] of Object.entries(phaseKeywords)) {
      const includesPhase = lowerInput.includes(kw);
      const isChangeRequest = lowerInput.includes('vamos') || lowerInput.includes('mudar') || lowerInput.includes('ir para');
      const isClarification = lowerInput.includes('estamos na') || lowerInput.includes('ainda na') || lowerInput.includes('voltar para');

      if (includesPhase && (isChangeRequest || isClarification)) {
        targetPhase = phase;
        break;
      }
    }

    if (targetPhase && targetPhase !== currentPhase) {
      setCurrentPhase(targetPhase);
      // We still want to send the message to the new phase's context
    }

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      phase: currentPhase
    };

    setMessagesByPhase(prev => ({
      ...prev,
      [currentPhase]: [...prev[currentPhase], userMessage]
    }));
    setInput('');
    setIsLoading(true);

    try {
      trackMessage(currentPhase, 'user', textToSend);

      const history = [...messagesByPhase[currentPhase], userMessage].map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }]
      }));

      const responsePromise = getChatResponse(history, currentPhase, deliverablesByPhase);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: AI took too long to respond.")), API_TIMEOUT_MS)
      );

      const startTime = Date.now();
      const response = await Promise.race([responsePromise, timeoutPromise]);
      trackLatency(Date.now() - startTime, currentPhase);
      trackMessage(currentPhase, 'model', response.text);

      const modelMessage: Message = {
        role: 'model',
        content: response.text,
        phase: currentPhase
      };

      setMessagesByPhase(prev => ({
        ...prev,
        [currentPhase]: [...prev[currentPhase], modelMessage]
      }));

      if (response.deliverableUpdates && response.deliverableUpdates.length > 0) {
        // Reformat each deliverable content via LLM in background
        for (const update of response.deliverableUpdates) {
          const del = deliverablesByPhase[currentPhase].find(d => d.id === update.id);
          reformatDeliverableContent(update.content, del?.label || update.id).then(formatted => {
            setDeliverablesByPhase(prev => ({
              ...prev,
              [currentPhase]: prev[currentPhase].map(d =>
                d.id === update.id ? { ...d, content: formatted } : d
              )
            }));
          });
        }

        setDeliverablesByPhase(prev => {
          const newDeliverables = { ...prev };
          const updatedPhaseDeliverables = newDeliverables[currentPhase].map(d => {
            const update = response.deliverableUpdates.find((u: any) => u.id === d.id);
            return update ? { ...d, content: update.content, status: 'completed' as const } : d;
          });
          newDeliverables[currentPhase] = updatedPhaseDeliverables;

          // Check if all are completed after update
          const allDone = updatedPhaseDeliverables.every(d => d.status === 'completed');
          if (allDone) {
            trackPhaseComplete(currentPhase);
            // Add a small delay to let the user see the last response before the "congrats" message
            setTimeout(() => {
              const nextPhase = PHASES[PHASES.indexOf(currentPhase) + 1];
              if (nextPhase) {
                setMessagesByPhase(m => {
                  const currentMsgs = m[currentPhase];
                  const alreadyCongrats = currentMsgs.some(msg => msg.content.includes("Parabéns!") && msg.content.includes(currentPhase));
                  if (alreadyCongrats) return m;

                  const congratsMessage: Message = {
                    role: 'model',
                    content: `🎉 **Parabéns!** Você concluiu todos os entregáveis da fase **${currentPhase}**. \n\nDeseja avançar para a próxima fase: **${nextPhase}**?`,
                    phase: currentPhase
                  };

                  return {
                    ...m,
                    [currentPhase]: [...currentMsgs, congratsMessage]
                  };
                });
              }
            }, 1500);
          }

          return newDeliverables;
        });
      }
    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage = error instanceof Error ? error.message : "Desculpe, ocorreu um erro ao processar sua mensagem.";
      setMessagesByPhase(prev => ({
        ...prev,
        [currentPhase]: [...prev[currentPhase], {
          role: 'model',
          content: errorMessage,
          phase: currentPhase
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = messagesByPhase[currentPhase];

  return {
    messagesByPhase,
    setMessagesByPhase,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    currentMessages,
    handleSend,
    handleStartPhase,
    handleResetPhase,
  };
}
