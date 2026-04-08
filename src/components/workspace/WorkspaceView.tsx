import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Info,
  Lightbulb,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import type { Phase, Deliverable } from '../../types';

interface WorkspaceViewProps {
  currentPhase: Phase;
  currentDeliverables: Deliverable[];
  activeDeliverableId: string | null;
  onActiveDeliverableChange: (id: string) => void;
  onUpdateDeliverable: (id: string, content: string) => void;
  onBackToChat: () => void;
}

export function WorkspaceView({
  currentPhase,
  currentDeliverables,
  activeDeliverableId,
  onActiveDeliverableChange,
  onUpdateDeliverable,
  onBackToChat,
}: WorkspaceViewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const activeDeliverable = useMemo(
    () => currentDeliverables.find(d => d.id === activeDeliverableId),
    [currentDeliverables, activeDeliverableId]
  );

  const copyTemplate = (deliverable: Deliverable) => {
    const template = deliverable.suggestion
      .replace(/### Como preencher este documento:\n/, '')
      .replace(/\d\. \*\*(.*?)\*\*:/g, '## $1\n[Escreva aqui...]\n')
      .replace(/- \*\*(.*?)\*\*:/g, '- **$1**: [Escreva aqui...]');

    onUpdateDeliverable(deliverable.id, template);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Deliverables List */}
      <div className="w-72 border-r border-gray-100 bg-white overflow-y-auto p-4 space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Workspace: {currentPhase}</p>
        {currentDeliverables.map(d => (
          <button
            key={d.id}
            onClick={() => onActiveDeliverableChange(d.id)}
            className={cn(
              "w-full text-left p-4 rounded-2xl border transition-all",
              activeDeliverableId === d.id
                ? "border-blue-500 bg-blue-50/50 shadow-sm"
                : "border-gray-100 hover:border-gray-200"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full",
                d.status === 'completed' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              )}>
                {d.status === 'completed' ? 'Concluido' : 'Pendente'}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-800">{d.label}</p>
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeDeliverable ? (
            <motion.div
              key={activeDeliverable.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeDeliverable.label}</h2>
                  <p className="text-sm text-gray-500 mt-2">{activeDeliverable.description}</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold",
                  activeDeliverable.status === 'completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                )}>
                  {activeDeliverable.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  {activeDeliverable.status === 'completed' ? 'Entrega Realizada' : 'Em Elaboracao'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conteudo do Entregavel</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setIsPreviewMode(false)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                            !isPreviewMode ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                          )}
                        >
                          Editor
                        </button>
                        <button
                          onClick={() => setIsPreviewMode(true)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                            isPreviewMode ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                          )}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 italic">Markdown suportado</span>
                  </div>

                  {isPreviewMode ? (
                    <div className="w-full min-h-[500px] p-8 bg-white border border-gray-200 rounded-3xl prose prose-sm max-w-none prose-blue">
                      {activeDeliverable.content ? (
                        <ReactMarkdown>{activeDeliverable.content}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-400 italic">Nada para visualizar ainda...</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={activeDeliverable.content || ''}
                      onChange={(e) => onUpdateDeliverable(activeDeliverable.id, e.target.value)}
                      placeholder="Comece a escrever seu entregavel aqui..."
                      className="w-full min-h-[500px] p-8 bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
                    />
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyTemplate(activeDeliverable)}
                        className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold"
                        title="Copiar Template para o Editor"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Usar Template
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                      <Lightbulb className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Guia de Preenchimento</h4>
                    </div>
                    <div className="prose prose-sm prose-blue max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{activeDeliverable.suggestion}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Dica de Especialista</h4>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{activeDeliverable.expertTip || 'Seja o mais especifico possivel. Em IA, a clareza sobre os dados e o problema define 80% do sucesso do projeto.'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={onBackToChat}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Voltar ao Chat
                </button>
                {/* Save is automatic via localStorage on every keystroke */}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                <LayoutDashboard className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Workspace da Fase</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Selecione um entregavel na lista ao lado para comecar a trabalhar nele.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
