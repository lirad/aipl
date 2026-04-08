import type { Phase, PhaseLiterature } from '../types';

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
