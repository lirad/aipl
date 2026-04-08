import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Phase, Deliverable } from "../types";
import { PHASE_DETAILS } from "../data/phases";
import { MAX_MESSAGES_CONTEXT } from "../data/constants";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function reformatDeliverableContent(content: string, label: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: content }] }],
      config: {
        systemInstruction: `Você é um formatador de documentos. Receba o conteúdo bruto de um entregável chamado "${label}" e reformate-o em Markdown limpo e bem estruturado.

Regras:
- Use **negrito** para rótulos/seções (ex: **Contexto:**, **A Dor:**)
- Cada seção em linha separada com linha em branco entre elas
- Preserve TODO o conteúdo original — não adicione, remova ou altere informações
- Se o conteúdo já estiver bem formatado, retorne-o como está
- Retorne APENAS o conteúdo formatado, sem explicações`,
      },
    });
    return response.text?.trim() || content;
  } catch (error) {
    console.error("Error reformatting content:", error);
    return content;
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
  } catch (error) {
    console.error("Error generating speech:", error);
  }
  return null;
}

export async function getChatResponse(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  currentPhase: Phase,
  allDeliverables: Record<Phase, Deliverable[]>,
  highQuality: boolean = false
) {
  // Using Flash for both modes to ensure speed and avoid timeouts as requested
  const model = "gemini-3-flash-preview";
  
  const limitedMessages = messages.slice(-MAX_MESSAGES_CONTEXT);
  
  const phaseInfo = PHASE_DETAILS.find(p => p.id === currentPhase);
  const currentDeliverablesList = phaseInfo?.deliverables.map(d => `- **${d.id}** (${d.label}): ${d.description}\n  *Sugestão:* ${d.suggestion.replace(/### .*\n/, '')}\n  *Dica de Especialista:* ${d.expertTip}`).join('\n\n') || '';
  
  // Build context from other phases
  const otherPhasesContext = Object.entries(allDeliverables)
    .filter(([phase]) => phase !== currentPhase)
    .map(([phase, deliverables]) => {
      const completed = deliverables.filter(d => d.status === 'completed');
      if (completed.length === 0) return null;
      return `### Contexto da Fase: ${phase}\n${completed.map(d => `- **${d.label}**: ${d.content}`).join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');

  // Identify which deliverables are still pending
  const pendingDeliverables = phaseInfo?.deliverables.filter(d => {
    const current = allDeliverables[currentPhase]?.find(ad => ad.id === d.id);
    return !current || current.status === 'pending';
  }) || [];
  const nextDeliverable = pendingDeliverables[0];
  const completedDeliverables = phaseInfo?.deliverables.filter(d => {
    const current = allDeliverables[currentPhase]?.find(ad => ad.id === d.id);
    return current && current.status === 'completed';
  }) || [];

  const systemInstruction = `Você é um PM de IA de fronteira guiando um aluno pelo AIPL (AI Product Development Lifecycle).
Fase atual: ${currentPhase}.

${otherPhasesContext ? `---
CONTEXTO DAS FASES ANTERIORES:
${otherPhasesContext}
---` : ''}

## ENTREGÁVEIS DESTA FASE
${currentDeliverablesList}

## STATUS
- Concluídos: ${completedDeliverables.map(d => d.label).join(', ') || 'nenhum'}
- Pendentes: ${pendingDeliverables.map(d => d.label).join(', ') || 'nenhum'}
${nextDeliverable ? `- **PRÓXIMO FOCO:** ${nextDeliverable.id} (${nextDeliverable.label})` : '- Todos concluídos!'}

## COMO SE COMPORTAR

### 1. UM ENTREGÁVEL POR VEZ
- Foque no PRÓXIMO FOCO. Faça **UMA pergunta curta por vez**.
- Valide a resposta, aprofunde se necessário, preencha o deliverableUpdates quando tiver info suficiente.
- Anuncie a conclusão e passe para o próximo.

### 2. TOM E FORMATO
- Seja direto, prático, sem jargão acadêmico. Fale como um PM sênior mentorando.
- Respostas curtas (máximo 3-4 parágrafos). Use **negrito** e listas.
- Termine com UMA pergunta. Nunca faça dump de informação.

### 3. TRANSIÇÃO ENTRE FASES
- Primeira interação: resuma o que foi definido antes (1-2 frases) → objetivo da fase → primeira pergunta.

### 4. FRAMEWORKS DE REFERÊNCIA (use quando relevante, não force)
- **Canvas de Oportunidade:** 4 quadrantes — Dor, Dados, Viabilidade, Valor
- **Espectro Reforge:** Feature → Core → Plataforma → Agêntica
- **Human-in-the-Loop:** Confidence Threshold, Sampling, Exception Handling, Feedback Loop
- **4 Riscos de Cagan:** Valor, Usabilidade, Viabilidade, Negócio
- **Context Engineering:** System prompt + RAG + Tools + Memória
- **4 Camadas de Métricas:** Modelo, Sistema, Experiência, Negócio
- **Evals:** Code-driven, LLM-as-Judge (rubric 1-4), Golden Sets, Feedback humano
- **Rollout Faseado:** Canary (1-5%) → Beta (10-25%) → GA (50-100%)
- **Guardrails:** Input guards + Output guards + circuit breakers

### 5. GOOGLE SEARCH
Use APENAS quando precisar de dados reais de mercado ou concorrentes.

### 6. SAÍDA
- Responda em Português (PT-BR).
- Retorne JSON: { "text": "sua resposta", "deliverableUpdates": [{ "id": "...", "content": "..." }] }
- Máximo 1 deliverable por resposta, salvo quando o aluno dá info para múltiplos.

### 7. FORMATAÇÃO DO CONTEÚDO (deliverableUpdates)
O campo 'content' DEVE usar Markdown bem formatado:
- **Negrito** para rótulos de seção
- Cada seção em LINHA SEPARADA (use \\n\\n)
- Use listas com marcadores
- NUNCA tudo numa linha só

Exemplo:
"**Dor do Usuário:** Proprietários perdem tempo.\\n\\n**Dados:** Logs de orçamentos disponíveis.\\n\\n**Viabilidade:** API do GPT-4o resolve.\\n\\n**Valor:** Economia de 15% no orçamento."`;


  try {
    const response = await ai.models.generateContent({
      model,
      contents: limitedMessages,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            deliverableUpdates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["id", "content"]
              }
            }
          },
          required: ["text"]
        }
      },
    });

    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch {
      // Attempt to extract JSON if wrapped in markdown
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      throw new Error("Failed to parse Gemini response as JSON");
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error("[Gemini]", error);
    // Fallback to a simple response if JSON parsing fails or API fails
    return { 
      text: "Desculpe, tive um problema técnico. Poderia repetir o que disse?",
      deliverableUpdates: []
    };
  }
}
