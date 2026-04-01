export type Phase = 
  | 'Ideation' 
  | 'Opportunity' 
  | 'Concept/Prototype' 
  | 'Testing & Analysis' 
  | 'Roll-out' 
  | 'Monitoring';

export interface Deliverable {
  id: string;
  label: string;
  description: string;
  suggestion: string;
  expertTip?: string;
  content?: string;
  status: 'pending' | 'completed';
}

export interface PhaseInfo {
  id: Phase;
  label: string;
  deliverables: Deliverable[];
}

export const PHASE_DETAILS: PhaseInfo[] = [
  {
    id: 'Ideation',
    label: 'Ideation',
    deliverables: [
      { 
        id: 'problem_stmt', 
        label: 'Problem Statement', 
        description: 'Definição clara do problema e proposta de valor da IA.',
        suggestion: '### Como preencher este documento:\n1. **Contexto:** Qual processo de negócio estamos otimizando?\n2. **A Dor:** Descreva o gargalo atual (ex: "Levamos 48h para triar tickets").\n3. **A Solução de IA:** Como a IA resolve isso? (ex: "Classificação automática de tickets em tempo real").\n4. **Métrica de Sucesso:** O que define a vitória? (ex: "Redução de 50% no tempo de resposta").',
        expertTip: 'Use ferramentas como OpenAI Whisper para transcrever entrevistas com stakeholders e BERT/DistilBERT para extrair sentimentos e temas-chave automaticamente.',
        status: 'pending' 
      },
      { 
        id: 'personas', 
        label: 'User Personas', 
        description: 'Identificação dos usuários-alvo e suas dores.',
        suggestion: '### Como preencher este documento:\n1. **Nome e Cargo:** Quem é o usuário principal?\n2. **Desafios Diários:** O que ele faz hoje que é manual ou cansativo?\n3. **Nível de Confiança em IA:** Ele é cético ou entusiasta? Como a interface deve lidar com isso?\n4. **Valor Entregue:** O que ele ganha ao usar esta ferramenta (ex: "Mais tempo para tarefas estratégicas").',
        expertTip: 'Utilize frameworks de Topic Modeling como BERTopic ou Top2Vec para identificar clusters dominantes em feedbacks qualitativos e segmentar personas baseadas em dados reais.',
        status: 'pending' 
      },
      { 
        id: 'use_cases', 
        label: 'AI Use Case Backlog', 
        description: 'Lista priorizada de funcionalidades baseadas em IA.',
        suggestion: '### Como preencher este documento:\nCrie uma tabela ou lista com:\n- **Funcionalidade:** O que a IA faz?\n- **Impacto (1-5):** Quanto valor gera para o negócio?\n- **Viabilidade (1-5):** Quão fácil é obter os dados e treinar o modelo?\n- **Prioridade:** Use a matriz Impacto x Viabilidade.',
        expertTip: 'Aplique o modelo "Replace, Reinforce, Reveal": a IA deve automatizar tarefas repetitivas, reforçar o trabalho cognitivo complexo ou revelar insights de dados opacos.',
        status: 'pending' 
      }
    ]
  },
  {
    id: 'Opportunity',
    label: 'Opportunity Discovery',
    deliverables: [
      {
        id: 'market_fit',
        label: 'Market Fit & ROI',
        description: 'Análise de mercado, identificação de gaps e caso de negócio com retorno esperado.',
        suggestion: '### Como preencher este documento:\n1. **Sumarização de Mercado:** Qual o tamanho do mercado endereçável? Quais tendências recentes impactam sua solução?\n2. **Gaps Identificados:** Quais necessidades de mercado não estão sendo atendidas? Use dados de fontes públicas, relatórios e pesquisas.\n3. **Análise de Custo vs. Valor:** Estimativa de custos de API/Infra vs. Ganhos de eficiência (horas-homem economizadas, redução de erros).\n4. **ROI Projetado:** Qual o retorno esperado em 6 e 12 meses?\n5. **Cenários Estratégicos:** Simule ao menos 2 cenários (otimista e conservador) para validar a oportunidade.',
        expertTip: 'Automatize a pesquisa de mercado com Perplexity AI para análise competitiva com fontes verificáveis. Use LLMs (Claude/GPT-4) com prompts estruturados para sumarizar gaps de mercado e gerar briefings semânticos.',
        status: 'pending'
      },
      {
        id: 'competitor_analysis',
        label: 'Competitor Analysis',
        description: 'Mapeamento competitivo e identificação de diferenciais usando análise semântica.',
        suggestion: '### Como preencher este documento:\n1. **Mapa de Concorrentes:** Liste os principais players (diretos e indiretos) e suas ofertas de IA.\n2. **Matriz Comparativa:** Para cada concorrente, avalie: funcionalidades, modelo de preço, experiência do usuário, maturidade de IA.\n3. **Segmentos Mal Atendidos:** Quais nichos ou funcionalidades os concorrentes ignoram?\n4. **Diferencial Único:** O que sua solução faz que nenhum concorrente oferece?\n5. **Avaliação de Viés:** As conclusões refletem perspectivas diversas e equilibradas?',
        expertTip: 'Use Perplexity AI e LangChain para identificar diferenciais-chave automaticamente. Matrizes comparativas geradas por IA revelam segmentos mal atendidos. Avalie viés com DeepEval para garantir conclusões equilibradas.',
        status: 'pending'
      },
      {
        id: 'data_audit',
        label: 'Data Strategy',
        description: 'Avaliação de disponibilidade, qualidade, privacidade e pipeline de dados para IA.',
        suggestion: '### Como preencher este documento:\n1. **Inventário de Dados:** Quais bases temos? (SQL, NoSQL, PDFs, Logs, APIs externas).\n2. **Qualidade e Representatividade:** Os dados são representativos do público-alvo? Estão rotulados? Qual o volume disponível?\n3. **Governança e Privacidade:** Como garantimos conformidade com LGPD/GDPR? Dados sensíveis estão anonimizados?\n4. **Pipeline de Dados:** Como os dados chegarão ao modelo em produção? Qual a latência aceitável?\n5. **Estratégia RAG:** Já existe um plano para Retrieval-Augmented Generation com dados históricos?',
        expertTip: 'Considere bases vetoriais (Pinecone, Weaviate, Chroma) para RAG desde o início. Use Hugging Face Datasets para curadoria de dados e LangChain para orquestrar pipelines de ingestão e busca semântica.',
        status: 'pending'
      },
      {
        id: 'tech_reqs',
        label: 'Technical Requirements',
        description: 'Especificações técnicas e arquitetura da solução de IA.',
        suggestion: '### Como preencher este documento:\n1. **Tipo de Modelo:** LLM (ex: Gemini, GPT-4, Claude), Visão Computacional, ou Preditivo? Justifique a escolha.\n2. **Latência e Performance:** Qual o tempo máximo de resposta aceitável? (ex: < 2s para interações em tempo real).\n3. **Escalabilidade:** Quantas requisições por segundo esperamos no pico?\n4. **Integração:** REST API, Webhook, SDK ou agentes autônomos?\n5. **Modelo Replace-Reinforce-Reveal:** Classifique cada funcionalidade de IA: ela vai Substituir tarefas repetitivas, Reforçar análises complexas, ou Revelar padrões ocultos?',
        expertTip: 'Aplique o modelo "Replace, Reinforce, Reveal" para classificar o papel da IA em cada funcionalidade. Use LangSmith para rastrear e avaliar requisitos. Agentes de simulação (CrewAI, LangGraph) podem testar cenários hipotéticos antes do desenvolvimento.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'Concept/Prototype',
    label: 'Concept/Prototype',
    deliverables: [
      { 
        id: 'poc', 
        label: 'Proof of Concept', 
        description: 'Protótipo funcional demonstrando a funcionalidade principal da IA.',
        suggestion: '### Como preencher este documento:\n1. **Escopo da PoC:** Qual a "Happy Path" que queremos validar?\n2. **Resultados Obtidos:** A IA conseguiu resolver o problema em ambiente controlado?\n3. **Aprendizados:** O que descobrimos sobre os dados ou o modelo durante o teste?',
        expertTip: 'Utilize CrewAI para simular cenários com agentes colaborativos. Para prototipagem rápida, use Claude Code, Cursor ou Bolt.new para ir do conceito ao código funcional em horas.',
        status: 'pending' 
      },
      { 
        id: 'ux_mockups', 
        label: 'UX/UI Mockups', 
        description: 'Design visual da interface do usuário.',
        suggestion: '### Como preencher este documento:\n1. **Exibição da IA:** Como o resultado é mostrado (Texto, Gráfico, Sugestão)?\n2. **Controle do Usuário:** Como ele edita ou rejeita a sugestão da IA?\n3. **Feedback Loop:** Onde estão os botões de "Joinha" ou "Reportar Erro"?',
        expertTip: 'Use v0 (Vercel) ou Lovable para gerar interfaces a partir de prompts. Claude Code e Cursor aceleram a iteração de UI com IA integrada ao fluxo de desenvolvimento.',
        status: 'pending' 
      },
      { 
        id: 'baseline', 
        label: 'Baseline Model', 
        description: 'Seleção inicial do modelo e baseline de performance.',
        suggestion: '### Como preencher este documento:\n1. **Modelo Escolhido:** Por que escolhemos este modelo/arquitetura?\n2. **Métricas Base:** Qual a performance sem nenhum ajuste fino (fine-tuning)?\n3. **Prompt Engineering:** Quais técnicas de prompt foram testadas?',
        expertTip: 'Avalie modelos usando Hugging Face Evaluate e Weights & Biases. Use LangSmith para rastrear a qualidade das respostas e comparar diferentes configurações de prompt.',
        status: 'pending' 
      }
    ]
  },
  {
    id: 'Testing & Analysis',
    label: 'Testing & Analysis',
    deliverables: [
      { 
        id: 'metrics', 
        label: 'Performance Metrics', 
        description: 'Avaliação detalhada do modelo (Acurácia, Precisão, etc.).',
        suggestion: '### Como preencher este documento:\n1. **Métricas Técnicas:** Acurácia, F1-Score, Perplexidade (se LLM).\n2. **Métricas de Negócio:** Taxa de aceitação das sugestões da IA.\n3. **Análise de Erros:** Em quais casos a IA mais falha? Por quê?',
        expertTip: 'Implemente Guardrails AI e LangSmith para validar e rastrear a saída do modelo em tempo real, garantindo completude e integridade lógica.',
        status: 'pending' 
      },
      { 
        id: 'uat', 
        label: 'User Testing Results', 
        description: 'Feedback de sessões de teste com usuários reais.',
        suggestion: '### Como preencher este documento:\n1. **Percepção de Valor:** O usuário sentiu que a IA ajudou?\n2. **Alucinações/Erros:** Quantas vezes o usuário percebeu erros da IA?\n3. **Facilidade de Uso:** A interface foi intuitiva?',
        expertTip: 'Use Claude ou GPT-4 para sumarizar feedback qualitativo de UAT. DeepEval automatiza testes de alucinação e relevância, identificando padrões que métricas quantitativas ignoram.',
        status: 'pending' 
      },
      { 
        id: 'bias_audit', 
        label: 'Bias & Fairness Audit', 
        description: 'Avaliação de considerações éticas do modelo.',
        suggestion: '### Como preencher este documento:\n1. **Grupos Testados:** Testamos o modelo com diferentes demografias?\n2. **Vieses Identificados:** O modelo favorece ou prejudica algum grupo?\n3. **Plano de Mitigação:** Como vamos corrigir esses vieses?',
        expertTip: 'Utilize DeepEval e Hugging Face Evaluate para auditar sistematicamente viés e fairness do modelo, com métricas de toxicidade e equilíbrio de perspectivas.',
        status: 'pending' 
      }
    ]
  },
  {
    id: 'Roll-out',
    label: 'Roll-out',
    deliverables: [
      { 
        id: 'deploy_plan', 
        label: 'Deployment Plan', 
        description: 'Estratégia para lançamento em produção e escala.',
        suggestion: '### Como preencher este documento:\n1. **Fases de Lançamento:** Alpha (interno), Beta (restrito), GA (público).\n2. **Monitoramento de Infra:** Como saberemos se a API caiu ou está lenta?\n3. **Plano de Contingência:** Se a IA começar a errar muito, como desligamos?',
        expertTip: 'Integre MLflow com GitHub Actions para deploy rastreável e reversível. Use Vercel AI SDK para streaming de respostas e LangGraph para orquestração de agentes.',
        status: 'pending' 
      },
      { 
        id: 'onboarding', 
        label: 'User Onboarding', 
        description: 'Materiais de treinamento e documentação para usuários.',
        suggestion: '### Como preencher este documento:\n1. **Guia de Uso:** Como o usuário deve interagir com a IA para ter melhores resultados?\n2. **Limitações:** Deixe claro o que a IA NÃO faz.\n3. **Suporte:** Onde o usuário pede ajuda se a IA falhar?',
        expertTip: 'Crie guias dinâmicos usando o próprio modelo para gerar documentação sob demanda. Use Claude Agent SDK para automatizar onboarding contextualizado por perfil técnico.',
        status: 'pending' 
      },
      { 
        id: 'infra_setup', 
        label: 'Infrastructure Setup', 
        description: 'Configuração final do ambiente de produção.',
        suggestion: '### Como preencher este documento:\n1. **Custos:** Qual o orçamento mensal para inferência?\n2. **Segurança:** Como as chaves de API e dados dos usuários estão protegidos?\n3. **Logging:** Onde estamos guardando os logs de entrada/saída (anonimizados)?',
        expertTip: 'Use Modal ou Docker para infraestrutura serverless com GPUs sob demanda. Configure LangFuse desde o início para capturar logs de uso que alimentem a melhoria contínua.',
        status: 'pending' 
      }
    ]
  },
  {
    id: 'Monitoring',
    label: 'Monitoring',
    deliverables: [
      { 
        id: 'dashboard', 
        label: 'Performance Dashboard', 
        description: 'Acompanhamento em tempo real da saúde do modelo e do sistema.',
        suggestion: '### Como preencher este documento:\n1. **KPIs de Saúde:** Uptime, Latência P95, Erros 5xx.\n2. **KPIs de Modelo:** Confiança média das respostas, taxa de feedback negativo.\n3. **Visualizações:** Quais gráficos são essenciais para o dia a dia?',
        expertTip: 'Configure Grafana + Prometheus para métricas de infra e LangFuse para métricas de LLM. Helicone complementa com analytics de custo e uso de APIs.',
        status: 'pending' 
      },
      { 
        id: 'drift_reports', 
        label: 'Drift Detection', 
        description: 'Sistema para identificar drift de dados e de modelo.',
        suggestion: '### Como preencher este documento:\n1. **Data Drift:** Os dados que os usuários enviam hoje são diferentes dos de treino?\n2. **Concept Drift:** O que era "certo" antes ainda é "certo" hoje?\n3. **Frequência de Checagem:** Semanal? Mensal?',
        expertTip: 'Use Arize AI ou W&B para detecção automática de drift com análise de embeddings. Phoenix (Arize) é open-source para depuração de RAG e agentes em produção.',
        status: 'pending' 
      },
      { 
        id: 'feedback_loop', 
        label: 'Feedback Loop', 
        description: 'Mecanismo para aprendizado contínuo e retreinamento.',
        suggestion: '### Como preencher este documento:\n1. **Coleta de Dados:** Como estamos salvando os feedbacks dos usuários?\n2. **Retreinamento:** Quando decidimos que é hora de uma nova versão do modelo?\n3. **Melhoria Contínua:** Qual o processo para atualizar o prompt ou o dataset?',
        expertTip: 'Use LangFuse para rastrear feedback dos usuários e Helicone para analytics de uso. LLMs como Claude podem gerar roadmaps priorizados baseados no valor real do feedback.',
        status: 'pending' 
      }
    ]
  }
];

export const PHASES: Phase[] = PHASE_DETAILS.map(p => p.id);

export interface PhaseTool {
  name: string;
  category: string;
  purpose: string;
  url: string;
}

export interface PhaseLiterature {
  tools: PhaseTool[];
}

export const PHASE_LITERATURE: Record<Phase, PhaseLiterature> = {
  'Ideation': {
    tools: [
      { name: 'ChatGPT (OpenAI)', category: 'Brainstorming / Pesquisa', purpose: 'Geração de ideias, exploração de conceitos e pesquisa assistida por IA conversacional', url: 'https://chat.openai.com' },
      { name: 'Claude (Anthropic)', category: 'Análise / Brainstorming', purpose: 'Análise profunda de textos longos, síntese de pesquisas e brainstorming estruturado', url: 'https://claude.ai' },
      { name: 'Gemini (Google)', category: 'Pesquisa Multimodal', purpose: 'Pesquisa combinando texto, imagem e vídeo para descoberta de insights e tendências', url: 'https://gemini.google.com' },
      { name: 'Whisper (OpenAI)', category: 'Transcrição', purpose: 'Transcrição automática de áudio e vídeo para captura de insights de entrevistas', url: 'https://platform.openai.com/docs/guides/speech-to-text' },
      { name: 'Miro AI', category: 'Brainstorming Visual', purpose: 'Colaboração visual com IA para mapeamento de ideias, clustering e priorização', url: 'https://miro.com/ai' },
      { name: 'NotebookLM (Google)', category: 'Síntese de Pesquisa', purpose: 'Síntese inteligente de documentos e fontes de pesquisa com conexões entre informações', url: 'https://notebooklm.google.com' },
      { name: 'n8n', category: 'Automação de Pesquisa', purpose: 'Automação de workflows de coleta de dados — scraping, formulários, integrações com APIs de pesquisa', url: 'https://n8n.io' },
    ]
  },
  'Opportunity': {
    tools: [
      { name: 'Perplexity AI', category: 'Pesquisa de Mercado', purpose: 'Pesquisa com citações verificáveis, análise competitiva e tendências em tempo real', url: 'https://perplexity.ai' },
      { name: 'Qdrant', category: 'Vector Database', purpose: 'Banco vetorial open-source de alta performance para busca semântica, filtragem e RAG em escala', url: 'https://qdrant.tech' },
      { name: 'Pinecone', category: 'Vector Database', purpose: 'Banco de dados vetorial serverless para busca semântica de embeddings em escala', url: 'https://pinecone.io' },
      { name: 'Weaviate', category: 'Vector Database', purpose: 'Banco vetorial open-source com busca híbrida (vetorial + keyword) para estratégia de dados', url: 'https://weaviate.io' },
      { name: 'LangChain', category: 'Orquestração de Dados', purpose: 'Orquestração de pipelines com integração a LLMs, APIs e fontes externas', url: 'https://langchain.com' },
      { name: 'n8n', category: 'Automação de Análise', purpose: 'Automação de pipelines de análise competitiva — scraping periódico, alertas e integração com LLMs', url: 'https://n8n.io' },
      { name: 'Hugging Face Datasets', category: 'Estratégia de Dados', purpose: 'Acesso a datasets abertos e ferramentas de curadoria para validação de oportunidades', url: 'https://huggingface.co/datasets' },
    ]
  },
  'Concept/Prototype': {
    tools: [
      { name: 'Cursor', category: 'Coding com IA', purpose: 'Editor de código com IA integrada para prototipagem rápida com autocompletar inteligente', url: 'https://cursor.com' },
      { name: 'v0 (Vercel)', category: 'Geração de UI', purpose: 'Geração de interfaces e componentes a partir de prompts em linguagem natural', url: 'https://v0.dev' },
      { name: 'Claude Code (Anthropic)', category: 'Coding Agêntico', purpose: 'Agente de código no terminal para construção e prototipagem de projetos completos', url: 'https://docs.anthropic.com/en/docs/claude-code' },
      { name: 'OpenAI Agents SDK (ChatKit)', category: 'Criação de Agentes', purpose: 'SDK para criar agentes de IA com tools, handoffs e guardrails — ideal para PoCs de agentes conversacionais', url: 'https://platform.openai.com/docs/guides/agents-sdk' },
      { name: 'Bolt.new (StackBlitz)', category: 'Prototipagem Full-Stack', purpose: 'Prototipagem full-stack no navegador com IA e deploy instantâneo', url: 'https://bolt.new' },
      { name: 'Railway', category: 'Deploy de Protótipo', purpose: 'Deploy instantâneo de backends e serviços — ideal para testar APIs e protótipos com banco de dados integrado', url: 'https://railway.app' },
      { name: 'n8n', category: 'Automação de Workflows', purpose: 'Prototipagem visual de workflows com IA — conectar LLMs, APIs e bancos sem código', url: 'https://n8n.io' },
      { name: 'Qdrant', category: 'Vector Database', purpose: 'Armazenamento e busca vetorial para protótipos de RAG e busca semântica', url: 'https://qdrant.tech' },
      { name: 'CrewAI', category: 'Simulação Multi-Agente', purpose: 'Criação de equipes de agentes de IA colaborativos com papéis e tarefas definidos', url: 'https://crewai.com' },
      { name: 'Lovable', category: 'Geração de Apps', purpose: 'Geração de aplicações web completas a partir de descrições em linguagem natural', url: 'https://lovable.dev' },
    ]
  },
  'Testing & Analysis': {
    tools: [
      { name: 'LangSmith (LangChain)', category: 'Validação / Tracing', purpose: 'Rastreamento e avaliação de saídas de LLMs com métricas de qualidade e datasets de teste', url: 'https://smith.langchain.com' },
      { name: 'Guardrails AI', category: 'Output Validation', purpose: 'Validação e estruturação de saídas de LLMs com regras de formato e conformidade', url: 'https://guardrailsai.com' },
      { name: 'DeepEval', category: 'Testes de LLM', purpose: 'Testes unitários para LLMs com métricas de alucinação, relevância e viés', url: 'https://deepeval.com' },
      { name: 'OpenAI Agents SDK (ChatKit)', category: 'Teste de Agentes', purpose: 'Testar fluxos de agentes com tools e handoffs em ambiente controlado antes do deploy', url: 'https://platform.openai.com/docs/guides/agents-sdk' },
      { name: 'Weights & Biases (W&B)', category: 'Experiment Tracking', purpose: 'Rastreamento de experimentos, comparação de modelos e análise de métricas', url: 'https://wandb.ai' },
      { name: 'Hugging Face Evaluate', category: 'Benchmarking', purpose: 'Métricas padronizadas para benchmarking incluindo bias, toxicidade e precisão', url: 'https://huggingface.co/evaluate' },
      { name: 'n8n', category: 'Automação de Testes', purpose: 'Automação de pipelines de teste — rodar suítes de avaliação periodicamente e notificar resultados', url: 'https://n8n.io' },
    ]
  },
  'Roll-out': {
    tools: [
      { name: 'Railway', category: 'Deploy de Servidores', purpose: 'Deploy de backends, APIs e workers com banco de dados integrado, scaling automático e logs em tempo real', url: 'https://railway.app' },
      { name: 'Vercel', category: 'Deploy de Frontend', purpose: 'Deploy de frontends e apps full-stack com edge functions, preview deployments e integração Git', url: 'https://vercel.com' },
      { name: 'Cloudflare Pages', category: 'Deploy Global', purpose: 'Deploy de sites e apps na edge global da Cloudflare — latência ultra-baixa, Workers para lógica serverless', url: 'https://pages.cloudflare.com' },
      { name: 'n8n', category: 'Orquestração de Deploy', purpose: 'Automação de workflows de deploy — CI/CD visual, notificações, rollback automático e integração com APIs', url: 'https://n8n.io' },
      { name: 'Vercel AI SDK', category: 'Streaming de IA', purpose: 'SDK para apps de IA com streaming, integração multi-provedor e edge functions', url: 'https://sdk.vercel.ai' },
      { name: 'Docker', category: 'Containerização', purpose: 'Containerização e distribuição de aplicações e modelos com ambientes reproduzíveis', url: 'https://docker.com' },
      { name: 'LangGraph (LangChain)', category: 'Orquestração de Agentes', purpose: 'Orquestração de agentes com grafos stateful, controle de fluxo e persistência', url: 'https://langchain-ai.github.io/langgraph' },
      { name: 'GitHub Actions', category: 'CI/CD', purpose: 'Automação de pipelines para revisão, testes e deploy contínuo', url: 'https://github.com/features/actions' },
    ]
  },
  'Monitoring': {
    tools: [
      { name: 'LangFuse', category: 'Observabilidade LLM', purpose: 'Observabilidade open-source para apps LLM com rastreamento de custo, latência e qualidade', url: 'https://langfuse.com' },
      { name: 'n8n', category: 'Automação de Monitoramento', purpose: 'Workflows automatizados de monitoramento — alertas, relatórios periódicos, escalação e integração com Slack/Email', url: 'https://n8n.io' },
      { name: 'Grafana + Prometheus', category: 'Dashboards / Time Series', purpose: 'Dashboards em tempo real e análise de séries temporais para métricas de IA', url: 'https://grafana.com' },
      { name: 'Railway', category: 'Observabilidade de Infra', purpose: 'Logs em tempo real, métricas de uso, alertas de saúde e scaling automático dos serviços', url: 'https://railway.app' },
      { name: 'Helicone', category: 'Analytics de LLM', purpose: 'Analytics e monitoramento de uso de APIs de LLM com cache e controle de custos', url: 'https://helicone.ai' },
      { name: 'Cloudflare Analytics', category: 'Analytics de Edge', purpose: 'Métricas de tráfego, performance e segurança para apps na edge da Cloudflare', url: 'https://cloudflare.com/analytics' },
      { name: 'Arize AI', category: 'Detecção de Drift', purpose: 'Observabilidade de ML com detecção automática de drift e análise de embeddings', url: 'https://arize.com' },
      { name: 'Weights & Biases (W&B)', category: 'Drift Detection', purpose: 'Monitoramento contínuo de modelos com detecção de drift, alertas e dashboards', url: 'https://wandb.ai' },
    ]
  }
};

export interface Message {
  role: 'user' | 'model';
  content: string;
  phase: Phase;
}

export interface AppState {
  currentPhase: Phase;
  messages: Record<Phase, Message[]>;
  deliverables: Record<Phase, Deliverable[]>;
}
