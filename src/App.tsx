import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Bot,
  User,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Code,
  TestTube,
  Rocket,
  Activity,
  Menu,
  X,
  CheckCircle2,
  Info,
  FileText,
  Save,
  LayoutDashboard,
  MessageSquare,
  ArrowRight,
  PlayCircle,
  Sparkles,
  RotateCcw,
  Loader2,
  Brain,
  BookOpen,
  Shield,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import type { Phase, Message, Deliverable } from './types';
import { PHASES } from './data/constants';
import { PHASE_DETAILS } from './data/phases';
import { PHASE_ONBOARDING } from './data/prompts';
import { startSession, heartbeat, trackFeedback } from './services/analytics';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDeliverables } from './hooks/useDeliverables';
import { useChat } from './hooks/useChat';
import DocumentExport from './DocumentExport';
import AdminDashboard from './components/admin/AdminDashboard';

const PHASE_ICONS: Record<Phase, React.ReactNode> = {
  'Ideation': <Lightbulb className="w-5 h-5" />,
  'Opportunity': <TrendingUp className="w-5 h-5" />,
  'Concept/Prototype': <Code className="w-5 h-5" />,
  'Testing & Analysis': <TestTube className="w-5 h-5" />,
  'Roll-out': <Rocket className="w-5 h-5" />,
  'Monitoring': <Activity className="w-5 h-5" />,
};

const PHASE_ICONS_LG: Record<Phase, React.ReactNode> = {
  'Ideation': <Lightbulb className="w-10 h-10" />,
  'Opportunity': <TrendingUp className="w-10 h-10" />,
  'Concept/Prototype': <Code className="w-10 h-10" />,
  'Testing & Analysis': <TestTube className="w-10 h-10" />,
  'Roll-out': <Rocket className="w-10 h-10" />,
  'Monitoring': <Activity className="w-10 h-10" />,
};

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('Ideation');
  const [view, setView] = useState<'chat' | 'workspace' | 'document' | 'admin'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useLocalStorage<Record<string, 'positive' | 'negative'>>('aipl_feedback', {});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Hooks
  const { deliverablesByPhase, setDeliverablesByPhase, resetPhaseDeliverables } = useDeliverables();

  const {
    messagesByPhase,
    setMessagesByPhase,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    currentMessages,
    handleSend,
    handleStartPhase,
    handleResetPhase: resetChatPhase,
  } = useChat({ currentPhase, setCurrentPhase, deliverablesByPhase, setDeliverablesByPhase, view });

  // Analytics: session start + heartbeat
  useEffect(() => {
    startSession();
    const interval = setInterval(() => heartbeat(currentPhase), 30000);
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Combined reset: chat messages + deliverables
  const handleResetPhase = () => {
    resetChatPhase();
    resetPhaseDeliverables(currentPhase);
  };

  const handleFeedback = (messageIndex: number, rating: 'positive' | 'negative') => {
    const key = `${currentPhase}:${messageIndex}`;
    setFeedbackGiven(prev => ({ ...prev, [key]: rating }));
    const msg = currentMessages[messageIndex];
    trackFeedback(currentPhase, rating, msg?.content || '');
  };

  const goToNextPhase = () => {
    const currentIndex = PHASES.indexOf(currentPhase);
    if (currentIndex < PHASES.length - 1) {
      setCurrentPhase(PHASES[currentIndex + 1]);
      setView('chat');
    }
  };

  const currentDeliverables = deliverablesByPhase[currentPhase];
  const allCompleted = currentDeliverables.every(d => d.status === 'completed');

  const updateDeliverable = (id: string, content: string) => {
    setDeliverablesByPhase(prev => {
      const newDeliverables = { ...prev };
      const updatedPhaseDeliverables = newDeliverables[currentPhase].map(d =>
        d.id === id ? { ...d, content, status: (content.trim() ? 'completed' : 'pending') as 'completed' | 'pending' } : d
      );
      newDeliverables[currentPhase] = updatedPhaseDeliverables;

      // Check if all are completed after manual update
      const allDone = updatedPhaseDeliverables.every(d => d.status === 'completed');
      if (allDone) {
        const nextPhase = PHASES[PHASES.indexOf(currentPhase) + 1];
        if (nextPhase) {
          const congratsMessage: Message = {
            role: 'model',
            content: `🎉 **Parabéns!** Você concluiu todos os entregáveis da fase **${currentPhase}**. \n\nDeseja avançar para a próxima fase: **${nextPhase}**?`,
            phase: currentPhase
          };
          // Only add if not already there to avoid duplicates
          setMessagesByPhase(m => {
            const currentMsgs = m[currentPhase];
            const alreadyCongrats = currentMsgs.some(msg => msg.content.includes("Parabéns!") && msg.content.includes(currentPhase));
            if (alreadyCongrats) return m;

            return {
              ...m,
              [currentPhase]: [...currentMsgs, congratsMessage]
            };
          });
        }
      }

      return newDeliverables;
    });
  };

  const copyTemplate = (deliverable: Deliverable) => {
    const template = deliverable.suggestion
      .replace(/### Como preencher este documento:\n/, '')
      .replace(/\d\. \*\*(.*?)\*\*:/g, '## $1\n[Escreva aqui...]\n')
      .replace(/- \*\*(.*?)\*\*:/g, '- **$1**: [Escreva aqui...]');

    updateDeliverable(deliverable.id, template);
  };

  const activeDeliverable = useMemo(() =>
    currentDeliverables.find(d => d.id === activeDeliverableId),
    [currentDeliverables, activeDeliverableId]
  );

  const phaseProgress = useMemo(() => {
    const completed = currentDeliverables.filter(d => d.status === 'completed').length;
    return (completed / currentDeliverables.length) * 100;
  }, [currentDeliverables]);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
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
                      setCurrentPhase(phase.id);
                      if (messagesByPhase[phase.id].length === 0) {
                        setMessagesByPhase(prev => ({
                          ...prev,
                          [phase.id]: [{
                            role: 'model',
                            content: `Bem-vindo à fase de **${phase.label}**. Como posso ajudar você com os entregáveis desta etapa?`,
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
                      {PHASE_ICONS[phase.id]}
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
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Entregáveis Atuais</p>
                <div className="space-y-3 px-1">
                  {currentDeliverables.map((d) => (
                    <button 
                      key={d.id} 
                      onClick={() => {
                        setView('workspace');
                        setActiveDeliverableId(d.id);
                      }}
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
                onClick={() => {
                  localStorage.removeItem('aipl_messages');
                  localStorage.removeItem('aipl_deliverables');
                  window.location.reload();
                }}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="h-4 w-[1px] bg-gray-200" />
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setView('chat')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === 'chat' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
              <button
                onClick={() => setView('workspace')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === 'workspace' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Workspace
              </button>
              <button
                onClick={() => setView('document')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === 'document' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Documento
              </button>
              <button
                onClick={() => setView('admin')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === 'admin' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetPhase}
              title="Reiniciar esta fase"
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Página da Fase</span>
              <span className="text-sm font-bold text-gray-800">{currentPhase}</span>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              {PHASE_ICONS[currentPhase]}
            </div>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'admin' ? (
            <AdminDashboard />
          ) : view === 'document' ? (
            <DocumentExport deliverablesByPhase={deliverablesByPhase} />
          ) : view === 'chat' ? (
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
                          {PHASE_ICONS_LG[currentPhase]}
                        </div>

                        {/* Previous phase summary */}
                        {(() => {
                          const phaseIndex = PHASES.indexOf(currentPhase);
                          if (phaseIndex > 0) {
                            const prevPhase = PHASES[phaseIndex - 1];
                            const prevDeliverables = deliverablesByPhase[prevPhase];
                            const completedCount = prevDeliverables.filter(d => d.status === 'completed').length;
                            return (
                              <div className="w-full bg-green-50 border border-green-100 rounded-2xl p-4 text-sm">
                                <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Fase anterior concluída: {prevPhase} ({completedCount}/{prevDeliverables.length} entregáveis)
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
                          }
                          return null;
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
                            onClick={() => handleStartPhase()}
                            disabled={isLoading}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {PHASE_ONBOARDING[currentPhase].cta}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={cn(
                        "flex gap-4",
                        message.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        message.role === 'user' ? "bg-gray-900 text-white" : "bg-white text-blue-600 border border-gray-100"
                      )}>
                        {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      
                      <div className={cn(
                        "flex flex-col max-w-[85%]",
                        message.role === 'user' ? "items-end" : "items-start"
                      )}>
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
                        {/* Feedback buttons for model messages (skip welcome message at index 0) */}
                        {message.role === 'model' && index > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 ml-1">
                            {(() => {
                              const fbKey = `${currentPhase}:${index}`;
                              const given = feedbackGiven[fbKey];
                              return (
                                <>
                                  <button
                                    onClick={() => handleFeedback(index, 'positive')}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-all",
                                      given === 'positive'
                                        ? "bg-green-100 text-green-600"
                                        : "text-gray-300 hover:text-green-500 hover:bg-green-50"
                                    )}
                                    title="Resposta util"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(index, 'negative')}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-all",
                                      given === 'negative'
                                        ? "bg-red-100 text-red-600"
                                        : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                                    )}
                                    title="Resposta nao ajudou"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                  {given && (
                                    <span className={cn(
                                      "text-[10px] font-bold ml-1",
                                      given === 'positive' ? "text-green-500" : "text-red-500"
                                    )}>
                                      {given === 'positive' ? 'Obrigado!' : 'Vamos melhorar'}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <Bot className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex flex-col gap-2">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                          Processando resposta...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent">
                <div className="max-w-3xl mx-auto relative">
                  {allCompleted && PHASES.indexOf(currentPhase) < PHASES.length - 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-6 left-0 right-0 flex justify-center"
                    >
                      <button
                        onClick={goToNextPhase}
                        className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-3 group"
                      >
                        <span>Ir para Próxima Fase: {PHASES[PHASES.indexOf(currentPhase) + 1]}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Discutir entregáveis de ${currentPhase}...`}
                    className="w-full bg-white border border-gray-200 rounded-[2rem] pl-6 pr-20 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-2xl shadow-blue-900/5 resize-none min-h-[64px] max-h-[200px]"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 bottom-3 p-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 group"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Deliverables List */}
              <div className="w-72 border-r border-gray-100 bg-white overflow-y-auto p-4 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Workspace: {currentPhase}</p>
                {currentDeliverables.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDeliverableId(d.id)}
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
                        {d.status === 'completed' ? 'Concluído' : 'Pendente'}
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
                          {activeDeliverable.status === 'completed' ? 'Entrega Realizada' : 'Em Elaboração'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conteúdo do Entregável</label>
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
                              onChange={(e) => updateDeliverable(activeDeliverable.id, e.target.value)}
                              placeholder="Comece a escrever seu entregável aqui..."
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
                              "{activeDeliverable.expertTip || 'Seja o mais específico possível. Em IA, a clareza sobre os dados e o problema define 80% do sucesso do projeto.'}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-4">
                        <button 
                          onClick={() => setView('chat')}
                          className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                          Voltar ao Chat
                        </button>
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Salvar Alterações
                        </button>
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
                          Selecione um entregável na lista ao lado para começar a trabalhar nele.
                        </p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
