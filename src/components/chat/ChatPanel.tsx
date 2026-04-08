import type { RefObject } from 'react';
import { Bot } from 'lucide-react';
import type { Phase, Message, Deliverable } from '../../types';
import { PHASES } from '../../data/constants';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { PhaseOnboarding } from '../phases/PhaseOnboarding';

interface ChatPanelProps {
  currentPhase: Phase;
  currentMessages: Message[];
  currentDeliverables: Deliverable[];
  allDeliverables: Record<Phase, Deliverable[]>;
  isLoading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStartPhase: () => void;
  onNextPhase: () => void;
  onFeedback: (index: number, rating: 'positive' | 'negative') => void;
  feedbackGiven: Record<string, 'positive' | 'negative'>;
  allCompleted: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  phaseIconLg: React.ReactNode;
}

export function ChatPanel({
  currentPhase,
  currentMessages,
  currentDeliverables,
  allDeliverables,
  isLoading,
  input,
  onInputChange,
  onSend,
  onStartPhase,
  onNextPhase,
  onFeedback,
  feedbackGiven,
  allCompleted,
  messagesEndRef,
  phaseIconLg,
}: ChatPanelProps) {
  const phaseIndex = PHASES.indexOf(currentPhase);
  const showNextPhase = allCompleted && phaseIndex < PHASES.length - 1;
  const nextPhaseLabel = showNextPhase ? PHASES[phaseIndex + 1] : undefined;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-blue-100">
              <Bot className="w-3 h-3" />
              Consultoria de IA: {currentPhase}
            </div>
          </div>

          {currentMessages.length <= 1 && (
            <PhaseOnboarding
              currentPhase={currentPhase}
              currentDeliverables={currentDeliverables}
              allDeliverables={allDeliverables}
              onStartPhase={onStartPhase}
              isLoading={isLoading}
              phaseIconLg={phaseIconLg}
            />
          )}

          {currentMessages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              index={index}
              feedbackGiven={feedbackGiven[`${currentPhase}:${index}`]}
              onFeedback={onFeedback}
            />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isLoading}
        placeholder={`Discutir entregaveis de ${currentPhase}...`}
        showNextPhase={showNextPhase}
        nextPhaseLabel={nextPhaseLabel}
        onNextPhase={onNextPhase}
      />
    </div>
  );
}
