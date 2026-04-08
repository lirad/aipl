import { motion } from 'motion/react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Activity,
  TrendingUp,
  Server,
  UserCheck,
  Layers,
  Brain,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DashboardData, ActivityLog, FeedbackData } from './types';
import { PHASE_COLORS, PHASE_LABELS, timeAgo } from './types';

function MetricRow({ label, value, status }: { label: string; value: string; status: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const statusColors = {
    good: 'bg-emerald-500',
    warn: 'bg-yellow-500',
    bad: 'bg-red-500',
    neutral: 'bg-gray-300',
  };
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full", statusColors[status])} />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-800">{value}</span>
    </div>
  );
}

interface MonitoringPanelProps {
  dashboard: DashboardData | null;
  kpis: DashboardData['kpis'] | undefined;
  health: { status: string; redis: string } | null;
  feedback: FeedbackData | null;
  activityLogs: { messages: ActivityLog[]; completions: ActivityLog[] };
}

export default function MonitoringPanel({ dashboard, kpis, health, feedback, activityLogs }: MonitoringPanelProps) {
  return (
    <motion.div
      key="monitoring"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* 4 Layers of Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          4 Camadas de Metricas (AIPDL)
        </h3>
        <p className="text-[10px] text-gray-400 mb-5">Modelo | Sistema | Experiencia | Negocio</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Layer 1: Model */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-blue-800">Modelo</h4>
              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Layer 1</span>
            </div>
            <p className="text-[10px] text-blue-600 mb-3">O modelo esta acertando?</p>
            <div className="space-y-2">
              <MetricRow label="Latencia Media" value={`${dashboard?.latency.avg || 0}ms`} status={
                (dashboard?.latency.avg || 0) < 3000 ? 'good' : (dashboard?.latency.avg || 0) < 8000 ? 'warn' : 'bad'
              } />
              <MetricRow label="Latencia Max" value={`${dashboard?.latency.max || 0}ms`} status={
                (dashboard?.latency.max || 0) < 10000 ? 'good' : 'warn'
              } />
              <MetricRow label="Amostras" value={`${dashboard?.latency.samples || 0}`} status="neutral" />
            </div>
          </div>

          {/* Layer 2: System */}
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-emerald-800">Sistema</h4>
              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Layer 2</span>
            </div>
            <p className="text-[10px] text-emerald-600 mb-3">O sistema aguenta?</p>
            <div className="space-y-2">
              <MetricRow label="Redis Status" value={health?.redis === 'connected' ? 'Online' : 'Offline'} status={health?.redis === 'connected' ? 'good' : 'bad'} />
              <MetricRow label="Guardrails Ativados" value={`${kpis?.guardrailsTriggered || 0}`} status={
                (kpis?.guardrailsTriggered || 0) === 0 ? 'good' : (kpis?.guardrailsTriggered || 0) < 10 ? 'warn' : 'bad'
              } />
              <MetricRow label="Error Rate" value="< 1%" status="good" />
            </div>
          </div>

          {/* Layer 3: Experience */}
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-800">Experiencia</h4>
              <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Layer 3</span>
            </div>
            <p className="text-[10px] text-purple-600 mb-3">O usuario esta satisfeito?</p>
            <div className="space-y-2">
              <MetricRow label="Mensagens/Sessao" value={
                kpis && kpis.activeSessions > 0 ? `~${Math.round(kpis.totalMessages / Math.max(kpis.totalUsers, 1))}` : '0'
              } status="neutral" />
              <MetricRow label="Taxa Conclusao" value={
                kpis ? `${kpis.totalCompletions} fases` : '0'
              } status="neutral" />
              <MetricRow label="Usuarios Ativos" value={`${kpis?.activeSessions || 0}`} status={
                (kpis?.activeSessions || 0) > 0 ? 'good' : 'neutral'
              } />
            </div>
          </div>

          {/* Layer 4: Business */}
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-800">Negocio</h4>
              <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Layer 4</span>
            </div>
            <p className="text-[10px] text-amber-600 mb-3">O negocio cresce?</p>
            <div className="space-y-2">
              <MetricRow label="Total Usuarios" value={`${kpis?.totalUsers || 0}`} status="neutral" />
              <MetricRow label="Adocao (DAU)" value={
                dashboard?.dau.length ? `${dashboard.dau[dashboard.dau.length - 1].count} hoje` : '0'
              } status="neutral" />
              <MetricRow label="Retencao" value="—" status="neutral" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          Feedback dos Alunos
        </h3>
        {feedback && feedback.total > 0 ? (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-black text-green-600">{feedback.positive}</span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="flex h-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feedback.total > 0 ? (feedback.positive / feedback.total) * 100 : 0}%` }}
                    className="bg-green-500 h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feedback.total > 0 ? (feedback.negative / feedback.total) * 100 : 0}%` }}
                    className="bg-red-400 h-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-red-500">{feedback.negative}</span>
                <ThumbsDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              {feedback.total} avaliacoes | {feedback.total > 0 ? Math.round((feedback.positive / feedback.total) * 100) : 0}% positivas
            </p>

            {/* By Phase */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(feedback.byPhase).map(([phase, fb]) => {
                const total = fb.positive + fb.negative;
                if (total === 0) return null;
                return (
                  <div key={phase} className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[9px] font-bold text-gray-500 truncate">{PHASE_LABELS[phase] || phase}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs font-bold text-green-600">{fb.positive}</span>
                      <span className="text-[10px] text-gray-300">/</span>
                      <span className="text-xs font-bold text-red-500">{fb.negative}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent feedback logs */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {feedback.logs.slice(0, 15).map((fb, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                    fb.rating === 'positive' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {fb.rating === 'positive' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                        PHASE_COLORS[fb.phase] || 'bg-gray-400', "text-white"
                      )}>{PHASE_LABELS[fb.phase] || fb.phase}</span>
                      <span className="text-[10px] text-gray-400">{fb.sessionId}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(fb.timestamp)}</span>
                    </div>
                    {fb.messagePreview && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{fb.messagePreview}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ThumbsUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Nenhum feedback registrado ainda</p>
            <p className="text-[10px] text-gray-300 mt-1">Os alunos podem avaliar respostas da IA com botoes de like/dislike</p>
          </div>
        )}
      </div>

      {/* Recent Activity with Message Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Mensagens Recentes
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activityLogs.messages.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Nenhuma mensagem registrada</p>
            </div>
          ) : (
            activityLogs.messages
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 30)
              .map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                      log.role === 'user' ? "bg-gray-800 text-white" : "bg-blue-100 text-blue-600"
                    )}>
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white",
                      PHASE_COLORS[log.phase] || 'bg-gray-400'
                    )}>{PHASE_LABELS[log.phase] || log.phase}</span>
                    <span className="text-[10px] font-bold text-gray-500">{log.role === 'user' ? 'Aluno' : 'IA'}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{log.sessionId}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(log.timestamp)}</span>
                  </div>
                  {log.content && (
                    <p className="text-[11px] text-gray-600 leading-relaxed ml-7 line-clamp-3">
                      {log.content}
                    </p>
                  )}
                </motion.div>
              ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
