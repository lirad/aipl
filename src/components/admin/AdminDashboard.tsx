import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Users,
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  Gauge,
  CircleDot,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchDashboard, fetchUsers, fetchGuardrails, fetchActivity, fetchFeedback, fetchHealth } from '../../services/analytics';
import type { AdminTab, DashboardData, UserData, GuardrailLog, ActivityLog, FeedbackData } from './types';
import { timeAgo } from './types';
import MetricsOverview from './MetricsOverview';
import GuardrailsPanel from './GuardrailsPanel';
import UsersPanel from './UsersPanel';
import MonitoringPanel from './MonitoringPanel';

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [guardrailLogs, setGuardrailLogs] = useState<GuardrailLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ messages: ActivityLog[]; completions: ActivityLog[] }>({ messages: [], completions: [] });
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [health, setHealth] = useState<{ status: string; redis: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashData, usersData, guardrailsData, activityData, feedbackData, healthData] = await Promise.all([
        fetchDashboard(),
        fetchUsers(),
        fetchGuardrails(),
        fetchActivity(),
        fetchFeedback(),
        fetchHealth(),
      ]);
      setDashboard(dashData);
      setUsers(usersData.users || []);
      setGuardrailLogs(guardrailsData.logs || []);
      setActivityLogs(activityData);
      setFeedback(feedbackData);
      setHealth(healthData);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  const kpis = dashboard?.kpis;

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visao Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'guardrails', label: 'Guardrails', icon: <Shield className="w-4 h-4" /> },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoramento', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      {/* Admin Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Gauge className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">Admin Panel</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    tab === t.id ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                health.redis === 'connected'
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              )}>
                <CircleDot className="w-3 h-3" />
                Redis {health.redis === 'connected' ? 'Online' : 'Offline'}
              </div>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <span className="text-[10px] text-gray-400">{timeAgo(lastRefresh)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <MetricsOverview dashboard={dashboard} />
          )}
          {tab === 'guardrails' && (
            <GuardrailsPanel kpis={kpis} guardrailLogs={guardrailLogs} />
          )}
          {tab === 'users' && (
            <UsersPanel kpis={kpis} users={users} />
          )}
          {tab === 'monitoring' && (
            <MonitoringPanel
              dashboard={dashboard}
              kpis={kpis}
              health={health}
              feedback={feedback}
              activityLogs={activityLogs}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
