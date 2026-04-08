import { motion } from 'motion/react';
import {
  Users,
  Zap,
  UserCheck,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { KPICard } from './MetricsOverview';
import type { DashboardData, UserData } from './types';
import { PHASE_COLORS, PHASE_LABELS, timeAgo } from './types';

interface UsersPanelProps {
  kpis: DashboardData['kpis'] | undefined;
  users: UserData[];
}

export default function UsersPanel({ kpis, users }: UsersPanelProps) {
  return (
    <motion.div
      key="users"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5 text-white" />}
          label="Total Usuarios"
          value={kpis?.totalUsers ?? 0}
          sub="Unicos registrados"
          color="bg-blue-500"
        />
        <KPICard
          icon={<Zap className="w-5 h-5 text-white" />}
          label="Online Agora"
          value={users.length}
          sub="Sessoes ativas"
          color="bg-emerald-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Usuarios Ativos ({users.length})
          </h3>
        </div>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-600">Nenhum usuario ativo</p>
            <p className="text-xs text-gray-400 mt-1">Usuarios aparecerao quando iniciarem sessoes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Table Header */}
            <div className="grid grid-cols-5 px-6 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Sessao</span>
              <span>Fase Atual</span>
              <span className="text-center">Mensagens</span>
              <span className="text-center">Duracao</span>
              <span className="text-right">Ultima Atividade</span>
            </div>
            {users.map((user, i) => {
              const duration = Math.floor((user.lastActive - user.startedAt) / 60000);
              return (
                <motion.div
                  key={user.sessionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-5 px-6 py-3 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-gray-700">{user.sessionId}</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", PHASE_COLORS[user.currentPhase] || 'bg-gray-400')} />
                    <span className="text-xs font-semibold text-gray-700">
                      {PHASE_LABELS[user.currentPhase] || user.currentPhase}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 text-center font-bold">{user.messageCount}</span>
                  <span className="text-xs text-gray-500 text-center">{duration}min</span>
                  <span className="text-xs text-gray-400 text-right">{timeAgo(user.lastActive)}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phase Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Distribuicao por Fase
        </h3>
        <div className="flex gap-3">
          {Object.entries(PHASE_LABELS).map(([phase, label]) => {
            const count = users.filter(u => u.currentPhase === phase).length;
            return (
              <div key={phase} className="flex-1 text-center">
                <div className={cn(
                  "w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-white font-black text-lg mb-2",
                  PHASE_COLORS[phase] || 'bg-gray-400'
                )}>
                  {count}
                </div>
                <p className="text-[10px] font-bold text-gray-500">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
