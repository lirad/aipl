import type { Phase, Deliverable, PhaseInfo } from '../types';
import { PHASES } from './constants';

/** Intro metadata per phase (emoji + one-liner objective). */
export const PHASE_INTROS: Record<Phase, { emoji: string; objective: string }> = {
  'Ideation': { emoji: '\u{1F4A1}', objective: 'Vamos mapear a oportunidade, definir quem usa e classificar o nível de IA do produto.' },
  'Opportunity': { emoji: '\u{1F50D}', objective: 'Hora de validar se a oportunidade é real — os 4 SIMs, concorrência e estratégia de dados.' },
  'Concept/Prototype': { emoji: '\u{1F6E0}\uFE0F', objective: 'Vamos projetar o contexto do modelo, a experiência do agente e estimar custos.' },
  'Testing & Analysis': { emoji: '\u{1F9EA}', objective: 'Métricas em 4 camadas, plano de evals e mitigação de riscos.' },
  'Roll-out': { emoji: '\u{1F680}', objective: 'Rollout faseado (Canary → Beta → GA) e onboarding transparente.' },
  'Monitoring': { emoji: '\u{1F4CA}', objective: 'Observabilidade e ciclo de melhoria contínua.' }
};

/** Onboarding card content shown before a phase conversation starts. */
export const PHASE_ONBOARDING: Record<Phase, { title: string; subtitle: string; cta: string }> = {
  'Ideation': {
    title: "Qual problema sua IA resolve?",
    subtitle: "Vamos mapear a dor, os dados, a viabilidade e o valor. Depois definimos quem usa e o nível de IA.",
    cta: "Começar Ideação"
  },
  'Opportunity': {
    title: "A oportunidade é real?",
    subtitle: "4 perguntas SIM/NÃO para validar. Depois: concorrência e estratégia de dados.",
    cta: "Validar Oportunidade"
  },
  'Concept/Prototype': {
    title: "Como a IA funciona por dentro?",
    subtitle: "Context Engineering (prompt + RAG + tools), experiência do agente, guardrails e custo por request.",
    cta: "Projetar o Conceito"
  },
  'Testing & Analysis': {
    title: "Está funcionando bem?",
    subtitle: "Métricas em 4 camadas, plano de evals e mapeamento de riscos.",
    cta: "Definir Métricas e Evals"
  },
  'Roll-out': {
    title: "Como lançar com segurança?",
    subtitle: "Canary → Beta → GA. Nunca lance para 100% de uma vez.",
    cta: "Planejar Rollout"
  },
  'Monitoring': {
    title: "Como manter evoluindo?",
    subtitle: "Observabilidade, alertas e o ciclo de feedback → melhoria → medição.",
    cta: "Configurar Monitoramento"
  }
};

/** Seed prompt sent when the user clicks "start phase". */
export const PHASE_START_PROMPTS: Record<Phase, string> = {
  'Ideation': "Quero começar a ideação. Me guie pelo Canvas de Oportunidade, Persona com nível de autonomia e Espectro da IA.",
  'Opportunity': "Quero validar a oportunidade. Me guie pela Validação Rápida (4 SIMs), Mapa Competitivo e Dados & Privacidade.",
  'Concept/Prototype': "Quero projetar o conceito. Me guie pelo Context Engineering, Experiência do Agente e Modelo & Custo.",
  'Testing & Analysis': "Quero definir como testar. Me guie pelas 4 Camadas de Métricas, Plano de Evals e Riscos & Guardrails.",
  'Roll-out': "Quero planejar o lançamento. Me guie pelo Rollout Faseado e Onboarding & Limitações.",
  'Monitoring': "Quero configurar o monitoramento. Me guie pela Observabilidade e Ciclo de Melhoria."
};

/**
 * Build a dynamic welcome message for a phase, incorporating context from
 * previous phases' completed deliverables.
 *
 * Accepts `phaseDetails` as a parameter (rather than importing the global
 * array) so the function is easy to test in isolation.
 */
export function buildPhaseWelcome(
  phase: Phase,
  allDeliverables: Record<Phase, Deliverable[]>,
  phaseDetails: PhaseInfo[],
): string {
  const phaseIndex = PHASES.indexOf(phase);
  const phaseInfo = phaseDetails.find(p => p.id === phase);
  const deliverablesList = phaseInfo?.deliverables
    .map((d, i) => `${i + 1}. **${d.label}** — ${d.description}`)
    .join('\n') || '';

  // Build previous phase summary
  let prevSummary = '';
  if (phaseIndex > 0) {
    const prevPhase = PHASES[phaseIndex - 1];
    const prevDeliverables = allDeliverables[prevPhase] || [];
    const completedItems = prevDeliverables.filter(d => d.status === 'completed');
    if (completedItems.length > 0) {
      prevSummary = `Na fase anterior (**${prevPhase}**), definimos:\n${completedItems.map(d => `- **${d.label}**: ${d.content ? d.content.slice(0, 120) + (d.content.length > 120 ? '...' : '') : 'Concluído'}`).join('\n')}\n\n`;
    }
  }

  const intro = PHASE_INTROS[phase];
  const firstDeliverable = phaseInfo?.deliverables[0];

  return `${prevSummary}Bem-vindo à fase **${phase}** ${intro.emoji}\n\n${intro.objective}\n\nEntregáveis desta fase:\n${deliverablesList}\n\nVamos começar pelo primeiro: **${firstDeliverable?.label}**. Clique no botão abaixo ou me diga por onde quer iniciar!`;
}
