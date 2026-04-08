import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import type { Phase, Deliverable } from '../../types';
import { PHASES } from '../../data/constants';
import { PHASE_ONBOARDING } from '../../data/prompts';

interface PhaseOnboardingProps {
  currentPhase: Phase;
  currentDeliverables: Deliverable[];
  allDeliverables: Record<Phase, Deliverable[]>;
  onStartPhase: () => void;
  isLoading: boolean;
  phaseIconLg: React.ReactNode;
}

export function PhaseOnboarding({
  currentPhase,
  currentDeliverables,
  allDeliverables,
  onStartPhase,
  isLoading,
  phaseIconLg,
}: PhaseOnboardingProps) {
  const phaseIndex = PHASES.indexOf(currentPhase);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden p-10 bg-white rounded-[3rem] border border-blue-100 shadow-2xl shadow-blue-900/10 group"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-900/20 mb-2">
          {phaseIconLg}
        </div>

        {/* Previous phase summary */}
        {phaseIndex > 0 && (() => {
          const prevPhase = PHASES[phaseIndex - 1];
          const prevDeliverables = allDeliverables[prevPhase];
          const completedCount = prevDeliverables.filter(d => d.status === 'completed').length;
          return (
            <div className="w-full bg-green-50 border border-green-100 rounded-2xl p-4 text-sm">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Fase anterior concluida: {prevPhase} ({completedCount}/{prevDeliverables.length} entregaveis)
              </div>
              <div className="text-green-600 text-xs space-y-1">
                {prevDeliverables.filter(d => d.status === 'completed').map(d => (
                  <div key={d.id} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                    <span><strong>{d.label}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">
            {PHASE_ONBOARDING[currentPhase].title}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {PHASE_ONBOARDING[currentPhase].subtitle}
          </p>
        </div>

        {/* Deliverables preview */}
        <div className="w-full grid grid-cols-2 gap-3">
          {currentDeliverables.map(d => (
            <div key={d.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs">
              <div className="font-bold text-gray-700">{d.label}</div>
              <div className="text-gray-400 mt-0.5">{d.description}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            onClick={() => onStartPhase()}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            {PHASE_ONBOARDING[currentPhase].cta}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
