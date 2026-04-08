import type { PhaseInfo } from '../types';

export const PHASE_DETAILS: PhaseInfo[] = [
  {
    id: 'Ideation',
    label: 'Ideation',
    deliverables: [
      {
        id: 'opportunity_canvas',
        label: 'Canvas de Oportunidade',
        description: 'Mapeamento rápido da oportunidade em 4 dimensões.',
        suggestion: '### Preencha os 4 quadrantes:\n1. **Dor do Usuário:** Onde o usuário perde tempo repetindo? Onde deveria ser personalizado? Onde decide sem informação suficiente?\n2. **Dados Disponíveis:** Que dados comportamentais já temos? Volume suficiente? Qualidade? Vieses conhecidos?\n3. **Viabilidade Técnica:** Existe modelo pré-treinado disponível? Latência aceitável? Custo computacional viável?\n4. **Valor de Negócio:** Quanto custa o problema hoje? Qual métrica de sucesso? ROI esperado?',
        expertTip: 'Regra de ouro: se os 4 quadrantes têm SIM, priorize. Se algum tem NÃO, investigue antes de investir. Use Perplexity AI para validar premissas de mercado em minutos.',
        status: 'pending'
      },
      {
        id: 'persona_autonomy',
        label: 'Persona & Nível de Autonomia',
        description: 'Quem usa e até onde a IA decide sozinha.',
        suggestion: '### Defina:\n1. **Quem é o usuário?** Nome, cargo, o que faz no dia a dia.\n2. **Qual a dor principal?** O que é manual, repetitivo ou frustrante?\n3. **Nível de autonomia da IA:** Até onde a IA decide sozinha vs. pede confirmação ao humano?\n4. **Padrão Human-in-the-Loop:** Qual abordagem? Confidence Threshold (IA decide acima de X%), Sampling Review (amostragem contínua), Exception Handling (humano revisa edge cases) ou Feedback Loop (correções melhoram o modelo)?',
        expertTip: 'A pergunta não é "IA ou humano?" — é "como combinar da melhor forma?". Defina o threshold de confiança: acima de qual % a IA age sozinha?',
        status: 'pending'
      },
      {
        id: 'ai_spectrum',
        label: 'Espectro da IA',
        description: 'Em que nível a IA opera no seu produto.',
        suggestion: '### Classifique seu produto:\n1. **Nível no Espectro Reforge:**\n   - IA como Feature (uma funcionalidade específica usa IA, ex: Smart Reply)\n   - IA como Core (IA é central na proposta de valor, ex: Copilot)\n   - IA como Plataforma (todo o produto é sobre IA, ex: Spotify)\n   - IA Agêntica (IA opera autonomamente, ex: Devin)\n2. **Arquitetura:** Recomendação, Classificação, Geração (LLM), Previsão ou Agêntica?\n3. **Casos de uso prioritários:** Liste 2-3 funcionalidades ordenadas por impacto × viabilidade.',
        expertTip: 'A maioria dos produtos começa como "IA como Feature" e evolui. Não tente ser agêntico no dia 1 — comece com valor claro e escale.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Opportunity',
    label: 'Opportunity',
    deliverables: [
      {
        id: 'validation',
        label: 'Validação Rápida',
        description: 'Os 4 SIMs que validam a oportunidade.',
        suggestion: '### Responda SIM ou NÃO (com justificativa):\n1. **O usuário sente a dor?** Existe evidência real (entrevistas, dados, reclamações) de que o problema importa?\n2. **Temos dados suficientes?** Dados existem, são acessíveis e têm qualidade mínima para alimentar um modelo?\n3. **É tecnicamente viável?** Existe modelo/API que resolve? A latência é aceitável? O custo faz sentido?\n4. **O ROI é positivo?** O valor gerado supera o custo de implementação em 6 meses?\n\nSe os 4 são SIM: avance. Se algum é NÃO: descreva o que precisa ser investigado.',
        expertTip: 'Use os 4 Riscos de Cagan como lente adicional: Risco de Valor (vão usar?), Usabilidade (conseguem usar?), Viabilidade (conseguimos construir?) e Negócio (funciona financeiramente?).',
        status: 'pending'
      },
      {
        id: 'competitive_map',
        label: 'Mapa Competitivo',
        description: 'Quem mais faz algo parecido e qual é o seu diferencial.',
        suggestion: '### Mapeie:\n1. **Concorrentes diretos:** Quem resolve o mesmo problema com IA?\n2. **Concorrentes indiretos:** Quem resolve sem IA (planilhas, processos manuais, consultorias)?\n3. **Diferencial:** O que seu produto faz que nenhum outro oferece? Por que IA é o caminho certo aqui?\n4. **Timing:** Por que agora? O que mudou (modelos mais baratos, dados disponíveis, mercado maduro)?',
        expertTip: 'Perplexity AI com busca em tempo real é a forma mais rápida de mapear concorrentes. Peça: "Liste empresas que usam IA para [seu problema] e compare funcionalidades."',
        status: 'pending'
      },
      {
        id: 'data_privacy',
        label: 'Dados & Privacidade',
        description: 'Que dados temos, como protegê-los e qual a estratégia de acesso.',
        suggestion: '### Defina:\n1. **Inventário de dados:** O que já temos? (logs, feedbacks, docs internos, APIs externas)\n2. **API vs. App:** Vamos usar APIs pagas (dados protegidos, contratos) ou apps gratuitos (cuidado com privacidade)?\n3. **PII e dados sensíveis:** Existe informação pessoal? Como anonimizar antes de enviar ao modelo? (masking, redaction)\n4. **Política de dados:** O que PODE e o que NÃO PODE ser enviado a modelos externos? Quem aprova?',
        expertTip: 'Regra #1: NUNCA envie dados sensíveis para apps gratuitos (ChatGPT Free, Gemini App). Use APIs com contratos (DPA). Ferramentas como Presidio (Microsoft) automatizam masking de PII.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Concept/Prototype',
    label: 'Concept & Prototype',
    deliverables: [
      {
        id: 'context_engineering',
        label: 'Context Engineering',
        description: 'O que entra no contexto do modelo — a nova spec técnica.',
        suggestion: '### Projete o contexto:\n1. **System Prompt:** Qual a personalidade, regras e limites do agente? O que ele DEVE e NÃO DEVE fazer?\n2. **RAG (dados de referência):** Que documentos, FAQs ou dados o modelo consulta antes de responder?\n3. **Tools (ferramentas):** Quais ações o agente pode executar? (consultar banco, chamar API, enviar e-mail)\n4. **Memória:** O agente lembra do histórico? Por quanto tempo? O que é descartado?',
        expertTip: 'Context Engineering é a nova UX. Você não controla o output — controla as condições para que o output seja bom. Comece pelo system prompt e itere.',
        status: 'pending'
      },
      {
        id: 'agent_experience',
        label: 'Experiência do Agente',
        description: 'Como o usuário interage com a IA e onde o humano intervém.',
        suggestion: '### Defina a experiência:\n1. **Interface:** Chat, formulário, copilot inline, agente autônomo? Como o usuário vê o resultado?\n2. **Controle do usuário:** Pode editar, rejeitar ou refinar a resposta da IA? Como?\n3. **Guardrails de Input:** O que o sistema bloqueia antes de chegar ao modelo? (prompt injection, PII, conteúdo tóxico)\n4. **Guardrails de Output:** O que o sistema valida antes de mostrar ao usuário? (alucinações, formato, tom)\n5. **Fallback:** Se a IA não sabe ou erra, o que acontece? Encaminha para humano?',
        expertTip: 'Guardrails não são "set and forget". Eles precisam de métricas, alertas e ajustes conforme novos padrões de uso aparecem. Planeje o monitoramento desde o início.',
        status: 'pending'
      },
      {
        id: 'model_cost',
        label: 'Modelo & Custo',
        description: 'Qual modelo usar e quanto custa cada resposta.',
        suggestion: '### Escolha e estime:\n1. **Modelo escolhido:** Qual e por quê? (GPT-4o, Claude Sonnet, Gemini Flash, etc.)\n2. **Reasoning vs. Non-Reasoning:** A tarefa exige raciocínio profundo (reasoning, mais lento/caro) ou resposta direta (non-reasoning, rápido/barato)?\n3. **Custo por resposta:** Calcule: tokens de input × preço + tokens de output × preço. Ex: 1000 tokens in + 500 out no GPT-4o ≈ $0.007 por request.\n4. **Estratégia de roteamento:** Tarefas simples → modelo barato, tarefas complexas → modelo caro? Considere OpenRouter para fallback automático.',
        expertTip: 'Consulte openrouter.ai/models para preços atualizados. Gemini Flash e GPT-4.1 nano são ótimos para tarefas simples ($0.10/1M tokens). Reserve modelos caros para quando realmente precisa de raciocínio.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Testing & Analysis',
    label: 'Testing & Analysis',
    deliverables: [
      {
        id: 'four_layers',
        label: '4 Camadas de Métricas',
        description: 'Métricas de Modelo, Sistema, Experiência e Negócio.',
        suggestion: '### Defina métricas em cada camada:\n1. **Modelo:** O modelo está acertando? (Accuracy, Precision, Recall, F1, latência do modelo)\n2. **Sistema:** O sistema aguenta? (Uptime, Throughput, Error Rate, custo por inferência)\n3. **Experiência:** O usuário está satisfeito? (Task Success Rate, Time-to-value, NPS, CSAT)\n4. **Negócio:** O negócio cresce? (Revenue, Retention, Adoption Rate, CAC, LTV)\n\nPara cada camada, defina: qual métrica, qual meta, como medir.',
        expertTip: 'Medir apenas conversão não é suficiente. Se você não mede o modelo, não sabe por que o negócio está indo mal. As 4 camadas dão visibilidade completa.',
        status: 'pending'
      },
      {
        id: 'eval_plan',
        label: 'Plano de Evals',
        description: 'Como avaliar a qualidade da IA em escala.',
        suggestion: '### Monte seu plano:\n1. **Tipo de eval:** Code-driven (validações programáticas), LLM-as-Judge (um LLM avalia outro), Golden Sets (compare com respostas-referência) ou Feedback humano (usuários avaliam)?\n2. **Rubric (se LLM-as-Judge):** Escala 1-4. 1=Incorreta, 2=Parcialmente correta, 3=Correta e útil, 4=Excelente e acionável.\n3. **Critérios:** O que avaliar? Acurácia factual, relevância, completude, tom.\n4. **Frequência:** A cada deploy? Diariamente? Contínuo?',
        expertTip: 'Use escala 1-4 (par) para eliminar o "viés do meio". Dica: peça raciocínio ANTES da nota (chain-of-thought) — a consistência sobe de 65% para 77%.',
        status: 'pending'
      },
      {
        id: 'risks_guardrails',
        label: 'Riscos & Guardrails',
        description: 'Os 3 riscos principais e como mitigá-los.',
        suggestion: '### Para cada risco, defina a mitigação:\n1. **Alucinações e Vieses:** O modelo inventa informações ou discrimina grupos. Mitigação: RAG com fontes verificáveis, guardrails de output, auditorias periódicas.\n2. **Falta de Controle:** Comportamento imprevisível em produção. Mitigação: fallback inteligente, lançamento faseado, circuit breakers.\n3. **Dependência de Dados:** Se dados degradam, modelo degrada. Mitigação: data quality checks, monitoramento contínuo, retreinamento agendado.',
        expertTip: 'Nenhum desses riscos é "resolvido" — eles são gerenciados continuamente. O plano de mitigação é um documento vivo.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Roll-out',
    label: 'Roll-out',
    deliverables: [
      {
        id: 'phased_rollout',
        label: 'Rollout Faseado',
        description: 'Lançamento progressivo: Canary → Beta → GA.',
        suggestion: '### Planeje cada estágio:\n1. **Canary (1-5% dos usuários):** Objetivo: estabilidade técnica e edge cases. O que monitorar: erros, latência, traces. Ferramenta: LangFuse traces + alertas.\n2. **Beta (10-25%):** Objetivo: métricas de produto e feedback qualitativo. O que monitorar: evals + entrevistas com usuários. Decisão: avançar, iterar ou voltar.\n3. **GA (50-100%):** Objetivo: escala com confiança. O que monitorar: dashboard 4 camadas + A/B testing. Plano de contingência: se a IA errar demais, como desligar?',
        expertTip: 'Nunca lance para 100% de uma vez. Especialmente com IA. O custo de um rollback é muito menor que o custo de uma experiência ruim em escala.',
        status: 'pending'
      },
      {
        id: 'onboarding_limits',
        label: 'Onboarding & Limitações',
        description: 'O que a IA faz, o que NÃO faz, e como o usuário pede ajuda.',
        suggestion: '### Defina:\n1. **O que a IA faz:** Em 1-2 frases, qual o valor principal entregue?\n2. **O que a IA NÃO faz:** Quais são os limites claros? (ex: "Não dá diagnósticos médicos", "Não garante precisão financeira")\n3. **Como usar melhor:** Dicas para o usuário obter melhores resultados (ex: "Seja específico", "Dê contexto").\n4. **Quando falha:** O que acontece? Para onde o usuário vai? (suporte humano, fallback, retry)',
        expertTip: 'Transparência gera confiança. Dizer o que a IA NÃO faz é tão importante quanto dizer o que ela faz. Isso reduz frustração e aumenta percepção de qualidade.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Monitoring',
    label: 'Monitoring',
    deliverables: [
      {
        id: 'observability',
        label: 'Observabilidade',
        description: 'O que monitorar e com qual ferramenta.',
        suggestion: '### Configure:\n1. **O que rastrear:** Para cada request: prompt enviado, resposta gerada, tools usadas, tempo, custo, feedback do usuário.\n2. **Ferramenta escolhida:** LangFuse (open-source), Helicone (analytics de custo), Grafana (infra). Qual faz sentido para você?\n3. **Alertas:** Quando disparar? (latência > 5s, erro rate > 5%, custo diário > X, feedback negativo acima de Y%)\n4. **Custo vs. Qualidade:** Quanto está custando por dia/mês? A qualidade justifica o custo?',
        expertTip: 'Tracing é o equivalente de logs para produtos de IA. Sem ele, você está voando cego. Configure no dia 1, não depois do primeiro incidente.',
        status: 'pending'
      },
      {
        id: 'improvement_cycle',
        label: 'Ciclo de Melhoria',
        description: 'Como o feedback do usuário volta para melhorar a IA.',
        suggestion: '### Desenhe o ciclo:\n1. **Coleta:** Como o feedback chega? (botão de like/dislike, formulário, análise de uso, tickets de suporte)\n2. **Análise:** Quem revisa? Com que frequência? O que é sinal vs. ruído?\n3. **Ação:** O que muda? Atualizar o prompt? Adicionar documentos ao RAG? Ajustar guardrails? Trocar de modelo?\n4. **Medição:** Como saber se a mudança melhorou? (A/B test, eval antes/depois)',
        expertTip: 'O ciclo mais rápido vence. Se você consegue ir de "feedback do usuário" a "prompt atualizado" em horas (não semanas), seu produto evolui mais rápido que qualquer concorrente.',
        status: 'pending'
      }
    ]
  }
];
