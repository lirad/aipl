import { motion } from 'motion/react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Layers,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { KPICard } from './MetricsOverview';
import type { DashboardData, GuardrailLog } from './types';
import { GUARDRAIL_TYPE_LABELS, timeAgo } from './types';

interface GuardrailsPanelProps {
  kpis: DashboardData['kpis'] | undefined;
  guardrailLogs: GuardrailLog[];
}

export default function GuardrailsPanel({ kpis, guardrailLogs }: GuardrailsPanelProps) {
  return (
    <motion.div
      key="guardrails"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Guardrail KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={<Shield className="w-5 h-5 text-white" />}
          label="Total Ativacoes"
          value={kpis?.guardrailsTriggered ?? 0}
          sub="Todos os guardrails"
          color="bg-red-500"
        />
        <KPICard
          icon={<ShieldAlert className="w-5 h-5 text-white" />}
          label="Input Guards"
          value={kpis?.guardrailsInput ?? 0}
          sub="PII, injection, toxico"
          color="bg-orange-500"
        />
        <KPICard
          icon={<ShieldCheck className="w-5 h-5 text-white" />}
          label="Output Guards"
          value={kpis?.guardrailsOutput ?? 0}
          sub="Alucinacao, formato, tom"
          color="bg-yellow-500"
        />
      </div>

      {/* Guardrails Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Arquitetura de Guardrails
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Guards */}
          <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h4 className="text-sm font-bold text-red-800">Input Guardrails</h4>
            </div>
            <p className="text-xs text-red-600 mb-3">O que o sistema bloqueia ANTES de chegar ao modelo</p>
            <div className="space-y-2">
              {[
                { label: 'PII Detection', desc: 'Detecta e mascara dados pessoais (CPF, email, telefone)' },
                { label: 'Prompt Injection', desc: 'Bloqueia tentativas de manipular o system prompt' },
                { label: 'Conteudo Toxico', desc: 'Filtra linguagem ofensiva ou prejudicial' },
              ].map(g => (
                <div key={g.label} className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-800">{g.label}</p>
                    <p className="text-[10px] text-red-600">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Output Guards */}
          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-800">Output Guardrails</h4>
            </div>
            <p className="text-xs text-amber-600 mb-3">O que o sistema valida ANTES de mostrar ao usuario</p>
            <div className="space-y-2">
              {[
                { label: 'Anti-Alucinacao', desc: 'Verifica se a resposta cita fontes ou inventa dados' },
                { label: 'Formato & Estrutura', desc: 'Valida JSON, Markdown e estrutura dos entregaveis' },
                { label: 'Tom & Relevancia', desc: 'Garante tom profissional e respostas dentro do escopo' },
              ].map(g => (
                <div key={g.label} className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5">
                  <Eye className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">{g.label}</p>
                    <p className="text-[10px] text-amber-600">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guardrail Events Log */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Log de Eventos ({guardrailLogs.length})
        </h3>
        {guardrailLogs.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-600">Nenhuma violacao registrada</p>
            <p className="text-xs text-gray-400 mt-1">Os guardrails estao configurados e monitorando</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {guardrailLogs.map((log, i) => {
              const typeInfo = GUARDRAIL_TYPE_LABELS[log.type] || { label: log.type, color: 'text-gray-500' };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    log.severity === 'high' ? 'bg-red-500' : log.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold", typeInfo.color)}>{typeInfo.label}</span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                        log.layer === 'input' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {log.layer}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{log.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(log.timestamp)}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
