import { motion, AnimatePresence } from 'motion/react';
import { Bot, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Phase, Message, Deliverable } from '../../types';
import { PHASE_DETAILS } from '../../data/phases';

interface PhaseNavigationProps {
  isOpen: boolean;
  currentPhase: Phase;
  currentDeliverables: Deliverable[];
  phaseProgress: number;
  activeDeliverableId: string | null;
  view: string;
  messagesByPhase: Record<Phase, Message[]>;
  phaseIcons: Record<Phase, React.ReactNode>;
  onPhaseSelect: (phase: Phase) => void;
  onDeliverableSelect: (id: string) => void;
  onSetMessagesByPhase: React.Dispatch<React.SetStateAction<Record<Phase, Message[]>>>;
  onResetAll: () => void;
}

export function PhaseNavigation({
  isOpen,
  currentPhase,
  currentDeliverables,
  phaseProgress,
  activeDeliverableId,
  view,
  messagesByPhase,
  phaseIcons,
  onPhaseSelect,
  onDeliverableSelect,
  onSetMessagesByPhase,
  onResetAll,
}: PhaseNavigationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl"
        >
          <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Bot className="text-white w-5 h-5" />
              </div>
              AIPL Guide
            </h1>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em] font-bold">AI Product Lifecycle</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <nav className="p-4 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Fases do Ciclo</p>
              {PHASE_DETAILS.map((phase, index) => (
                <button
                  key={phase.id}
                  onClick={() => {
                    onPhaseSelect(phase.id);
                    if (messagesByPhase[phase.id].length === 0) {
                      onSetMessagesByPhase(prev => ({
                        ...prev,
                        [phase.id]: [{
                          role: 'model',
                          content: `Bem-vindo a fase de **${phase.label}**. Como posso ajudar voce com os entregaveis desta etapa?`,
                          phase: phase.id
                        }]
                      }));
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-200 group",
                    currentPhase === phase.id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    currentPhase === phase.id ? "bg-blue-600 text-white" : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    {phaseIcons[phase.id]}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">Fase 0{index + 1}</span>
                    <span className="truncate max-w-[140px]">{phase.label}</span>
                  </div>
                  {currentPhase === phase.id && <ChevronRight className="ml-auto w-4 h-4 animate-pulse" />}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Entregaveis Atuais</p>
              <div className="space-y-3 px-1">
                {currentDeliverables.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onDeliverableSelect(d.id)}
                    className={cn(
                      "w-full text-left bg-gray-50 rounded-xl p-3 border transition-all group",
                      activeDeliverableId === d.id && view === 'workspace'
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-100 hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={cn(
                        "w-4 h-4 mt-0.5 transition-colors",
                        d.status === 'completed' ? "text-green-500" : "text-gray-300 group-hover:text-blue-500"
                      )} />
                      <div>
                        <p className={cn(
                          "text-xs font-bold",
                          d.status === 'completed' ? "text-gray-900" : "text-gray-700"
                        )}>{d.label}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-1">{d.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
            <button
              onClick={onResetAll}
              className="w-full flex items-center justify-center gap-2 p-3 text-[10px] font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 uppercase tracking-widest"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar Todo o Projeto
            </button>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Progresso da Fase</p>
                <p className="text-[10px] text-blue-600 font-bold">{Math.round(phaseProgress)}%</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  animate={{ width: `${phaseProgress}%` }}
                  className="bg-blue-600 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
