import { useState, useEffect, useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Code,
  TestTube,
  Rocket,
  Activity,
  Menu,
  X,
  RotateCcw,
  MessageSquare,
  FileText,
  BookOpen,
  Shield,
} from 'lucide-react';
import { cn } from './lib/utils';
import type { Phase, Message } from './types';
import { PHASES } from './data/constants';
import { startSession, heartbeat, trackFeedback } from './services/analytics';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDeliverables } from './hooks/useDeliverables';
import { useChat } from './hooks/useChat';
import DocumentExport from './DocumentExport';
import AdminDashboard from './components/admin/AdminDashboard';
import { PhaseNavigation } from './components/phases/PhaseNavigation';
import { ChatPanel } from './components/chat/ChatPanel';
import { WorkspaceView } from './components/workspace/WorkspaceView';

/** Icon maps — contain JSX so they stay in the component layer, not in data/. */
function phaseIcon(size: 'sm' | 'lg'): Record<Phase, React.ReactNode> {
  const c = size === 'sm' ? 'w-5 h-5' : 'w-10 h-10';
  return {
    'Ideation': <Lightbulb className={c} />,          'Opportunity': <TrendingUp className={c} />,
    'Concept/Prototype': <Code className={c} />,      'Testing & Analysis': <TestTube className={c} />,
    'Roll-out': <Rocket className={c} />,              'Monitoring': <Activity className={c} />,
  };
}
const PHASE_ICONS = phaseIcon('sm');
const PHASE_ICONS_LG = phaseIcon('lg');

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('Ideation');
  const [view, setView] = useState<'chat' | 'workspace' | 'document' | 'admin'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useLocalStorage<Record<string, 'positive' | 'negative'>>('aipl_feedback', {});

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

  useEffect(() => { startSession(); const i = setInterval(() => heartbeat(currentPhase), 30000); return () => clearInterval(i); }, [currentPhase]);

  const handleResetPhase = () => { resetChatPhase(); resetPhaseDeliverables(currentPhase); };
  const handleFeedback = (idx: number, rating: 'positive' | 'negative') => {
    setFeedbackGiven(prev => ({ ...prev, [`${currentPhase}:${idx}`]: rating }));
    trackFeedback(currentPhase, rating, currentMessages[idx]?.content || '');
  };
  const goToNextPhase = () => { const i = PHASES.indexOf(currentPhase); if (i < PHASES.length - 1) { setCurrentPhase(PHASES[i + 1]); setView('chat'); } };

  const currentDeliverables = deliverablesByPhase[currentPhase];
  const allCompleted = currentDeliverables.every(d => d.status === 'completed');

  const updateDeliverable = (id: string, content: string) => {
    setDeliverablesByPhase(prev => {
      const updated = prev[currentPhase].map(d =>
        d.id === id ? { ...d, content, status: (content.trim() ? 'completed' : 'pending') as 'completed' | 'pending' } : d
      );
      const allDone = updated.every(d => d.status === 'completed');
      if (allDone) {
        const next = PHASES[PHASES.indexOf(currentPhase) + 1];
        if (next) {
          const msg: Message = { role: 'model', content: `\u{1F389} **Parab\u00e9ns!** Voc\u00ea concluiu todos os entreg\u00e1veis da fase **${currentPhase}**. \n\nDeseja avan\u00e7ar para a pr\u00f3xima fase: **${next}**?`, phase: currentPhase };
          setMessagesByPhase(m => {
            const cur = m[currentPhase];
            if (cur.some(m => m.content.includes("Parab\u00e9ns!") && m.content.includes(currentPhase))) return m;
            return { ...m, [currentPhase]: [...cur, msg] };
          });
        }
      }
      return { ...prev, [currentPhase]: updated };
    });
  };

  const phaseProgress = useMemo(() => {
    const c = currentDeliverables.filter(d => d.status === 'completed').length;
    return (c / currentDeliverables.length) * 100;
  }, [currentDeliverables]);
  const handleDeliverableSelect = (id: string) => { setView('workspace'); setActiveDeliverableId(id); };
  const handleResetAll = () => { localStorage.removeItem('aipl_messages'); localStorage.removeItem('aipl_deliverables'); window.location.reload(); };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      <PhaseNavigation
        isOpen={isSidebarOpen}
        currentPhase={currentPhase}
        currentDeliverables={currentDeliverables}
        phaseProgress={phaseProgress}
        activeDeliverableId={activeDeliverableId}
        view={view}
        messagesByPhase={messagesByPhase}
        phaseIcons={PHASE_ICONS}
        onPhaseSelect={setCurrentPhase}
        onDeliverableSelect={handleDeliverableSelect}
        onSetMessagesByPhase={setMessagesByPhase}
        onResetAll={handleResetAll}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {([{ key: 'chat', label: 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" />, activeColor: 'text-blue-600' },
                { key: 'workspace', label: 'Workspace', icon: <FileText className="w-3.5 h-3.5" />, activeColor: 'text-blue-600' },
                { key: 'document', label: 'Documento', icon: <BookOpen className="w-3.5 h-3.5" />, activeColor: 'text-blue-600' },
                { key: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" />, activeColor: 'text-emerald-600' },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setView(tab.key)} className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === tab.key ? `bg-white ${tab.activeColor} shadow-sm` : "text-gray-500 hover:text-gray-700"
                )}>{tab.icon}{tab.label}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleResetPhase} title="Reiniciar esta fase" className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100">
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">P\u00e1gina da Fase</span>
              <span className="text-sm font-bold text-gray-800">{currentPhase}</span>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">{PHASE_ICONS[currentPhase]}</div>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'admin' ? (
            <AdminDashboard />
          ) : view === 'document' ? (
            <DocumentExport deliverablesByPhase={deliverablesByPhase} />
          ) : view === 'chat' ? (
            <ChatPanel
              currentPhase={currentPhase}
              currentMessages={currentMessages}
              currentDeliverables={currentDeliverables}
              allDeliverables={deliverablesByPhase}
              isLoading={isLoading}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              onStartPhase={handleStartPhase}
              onNextPhase={goToNextPhase}
              onFeedback={handleFeedback}
              feedbackGiven={feedbackGiven}
              allCompleted={allCompleted}
              messagesEndRef={messagesEndRef}
              phaseIconLg={PHASE_ICONS_LG[currentPhase]}
            />
          ) : (
            <WorkspaceView
              currentPhase={currentPhase}
              currentDeliverables={currentDeliverables}
              activeDeliverableId={activeDeliverableId}
              onActiveDeliverableChange={setActiveDeliverableId}
              onUpdateDeliverable={updateDeliverable}
              onBackToChat={() => setView('chat')}
            />
          )}
        </div>
      </main>
    </div>);
}
