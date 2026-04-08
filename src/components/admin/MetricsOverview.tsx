import { motion } from 'motion/react';
import {
  Users,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  TrendingUp,
  Zap,
  UserCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DashboardData } from './types';
import { PHASE_COLORS, PHASE_LABELS } from './types';

function KPICard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function PhaseBar({ phase, value, max }: { phase: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-gray-600 w-28 truncate">{PHASE_LABELS[phase] || phase}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn("h-full rounded-full", PHASE_COLORS[phase] || 'bg-blue-500')}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{value}</span>
    </div>
  );
}

export { KPICard };

interface MetricsOverviewProps {
  dashboard: DashboardData | null;
}

export default function MetricsOverview({ dashboard }: MetricsOverviewProps) {
  const kpis = dashboard?.kpis;
  const maxPhaseMessages = dashboard ? Math.max(...Object.values(dashboard.phaseMessages), 1) : 1;
  const maxPhaseCompletions = dashboard ? Math.max(...Object.values(dashboard.phaseCompletions), 1) : 1;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5 text-white" />}
          label="Total Usuarios"
          value={kpis?.totalUsers ?? 0}
          sub="Unicos registrados"
          color="bg-blue-500"
        />
        <KPICard
          icon={<Zap className="w-5 h-5 text-white" />}
          label="Sessoes Ativas"
          value={kpis?.activeSessions ?? 0}
          sub="Ultimos 5 min"
          color="bg-emerald-500"
        />
        <KPICard
          icon={<MessageSquare className="w-5 h-5 text-white" />}
          label="Mensagens"
          value={kpis?.totalMessages ?? 0}
          sub="Total trocadas"
          color="bg-purple-500"
        />
        <KPICard
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          label="Entregas"
          value={kpis?.totalCompletions ?? 0}
          sub="Fases concluidas"
          color="bg-amber-500"
        />
        <KPICard
          icon={<ThumbsUp className="w-5 h-5 text-white" />}
          label="Satisfacao"
          value={kpis && (kpis.feedbackPositive + kpis.feedbackNegative) > 0
            ? `${Math.round((kpis.feedbackPositive / (kpis.feedbackPositive + kpis.feedbackNegative)) * 100)}%`
            : '—'}
          sub={`${kpis?.feedbackPositive ?? 0} positivos / ${kpis?.feedbackNegative ?? 0} negativos`}
          color="bg-green-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Phase */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Mensagens por Fase
          </h3>
          <div className="space-y-3">
            {dashboard && Object.entries(dashboard.phaseMessages).map(([phase, count]) => (
              <PhaseBar key={phase} phase={phase} value={count} max={maxPhaseMessages} />
            ))}
          </div>
        </div>

        {/* Completions by Phase */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Conclusoes por Fase (Funil)
          </h3>
          <div className="space-y-3">
            {dashboard && Object.entries(dashboard.phaseCompletions).map(([phase, count]) => (
              <PhaseBar key={phase} phase={phase} value={count} max={maxPhaseCompletions} />
            ))}
          </div>
        </div>
      </div>

      {/* DAU Chart */}
      {dashboard && dashboard.dau.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Usuarios Ativos Diarios (7 dias)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {(() => { const maxDau = Math.max(...dashboard.dau.map(x => x.count), 1); return dashboard.dau.map((d, i) => {
              const pct = (d.count / maxDau) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600">{d.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[9px] text-gray-400">{d.date.slice(5)}</span>
                </div>
              );
            }); })()}
          </div>
        </div>
      )}
    </motion.div>
  );
}
