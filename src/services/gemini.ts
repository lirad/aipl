import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Phase, PHASE_DETAILS, Deliverable } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
  
  // Limit history to last 10 messages to keep it fast and avoid context bloat
  const limitedMessages = messages.slice(-10);
  
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

  const systemInstruction = `You are an expert AI Product Manager helping a user build an AI product following the AIPL (AI Product Lifecycle).
The current phase is: ${currentPhase}.

${otherPhasesContext ? `---
CONTEXTO DE FASES ANTERIORES/OUTRAS (use para manter consistência):
${otherPhasesContext}
---` : ''}

## ENTREGÁVEIS DESTA FASE (${currentPhase})
${currentDeliverablesList}

## STATUS DOS ENTREGÁVEIS
- Concluídos: ${completedDeliverables.map(d => d.label).join(', ') || 'nenhum'}
- Pendentes: ${pendingDeliverables.map(d => d.label).join(', ') || 'nenhum'}
${nextDeliverable ? `- **PRÓXIMO FOCO:** ${nextDeliverable.id} (${nextDeliverable.label})` : '- Todos concluídos!'}

## REGRAS FUNDAMENTAIS DE COMPORTAMENTO

### 1. GUIA PASSO A PASSO (OBRIGATÓRIO)
**NUNCA tente preencher múltiplos entregáveis de uma vez.** Trabalhe UM entregável por vez, na ordem listada acima.
- Foque no entregável marcado como PRÓXIMO FOCO.
- Para cada entregável, faça **UMA pergunta curta por vez** (máximo 2 frases).
- Após a resposta do usuário, valide o que entendeu e faça a próxima pergunta.
- Só preencha o deliverableUpdates quando tiver informação SUFICIENTE para aquele entregável específico.
- Após preencher um entregável, anuncie a conclusão e apresente o PRÓXIMO.

### 2. FORMATO DE RESPOSTA
- Respostas devem ser **CURTAS e FOCADAS** (máximo 3-4 parágrafos).
- Use **quebras de linha** entre parágrafos para facilitar a leitura.
- Use **negrito** para termos-chave e conceitos importantes.
- Quando listar itens, use listas com marcadores (- ou •) para clareza.
- Deixe espaçamento entre seções diferentes da resposta.
- Sempre termine com UMA pergunta clara para guiar o próximo passo.
- NÃO faça dumps de informação. NÃO liste todas as perguntas de um entregável de uma vez.

### 3. TRANSIÇÃO ENTRE FASES
- Se esta é a primeira interação da fase, comece fazendo um BREVE resumo do que foi definido nas fases anteriores (1-2 frases baseadas no CONTEXTO acima).
- Em seguida, explique o OBJETIVO da fase atual em 1 frase.
- Depois, apresente o PRIMEIRO entregável pendente e faça a primeira pergunta.

### 4. DEPENDÊNCIA DE FASES
Se entregáveis de fases anteriores não estiverem preenchidos:
1. Verifique se as informações necessárias já foram fornecidas no histórico do chat.
2. Se sim, preencha-os usando deliverableUpdates.
3. Se não, peça educadamente as informações básicas antes de prosseguir.

### 5. FRAMEWORK PRÁTICO
Aplique estes conceitos quando relevante:
- **Modelo Replace-Reinforce-Reveal:** Classifique funcionalidades — a IA vai Substituir tarefas repetitivas, Reforçar análises complexas ou Revelar padrões ocultos.
- **Análise Competitiva Semântica:** Guie comparações estruturadas.
- **Simulação de Cenários:** Incentive cenários otimista/conservador.

### 6. GOOGLE SEARCH
Use APENAS quando precisar de informações externas reais. Se puder responder com base no contexto, seja rápido.

### 7. IDIOMA E FORMATO DE SAÍDA
- Respond in Portuguese (PT-BR).
- Return a JSON object with 'text' (your response) and 'deliverableUpdates' (an array of { id: string, content: string }).
- deliverableUpdates deve conter NO MÁXIMO 1 entregável por resposta, a menos que o usuário forneça informações para múltiplos de uma vez.

### 8. FORMATAÇÃO DO CONTEÚDO DOS ENTREGÁVEIS (CRÍTICO)
O campo 'content' dentro de deliverableUpdates DEVE usar Markdown bem formatado:
- Use **negrito** para rótulos de seção (ex: **Contexto:**, **A Dor:**)
- Cada item/seção DEVE estar em uma LINHA SEPARADA (use \\n para quebra de linha)
- Use listas com marcadores (- ou 1. 2. 3.) quando houver múltiplos itens
- NUNCA coloque tudo em uma única linha corrida

Exemplo CORRETO de content:
"**Contexto:** Pequenas reformas residenciais.\\n\\n**A Dor:** Proprietários perdem tempo e dinheiro.\\n\\n**Solução IA:** Assistente que gera listas de compras.\\n\\n**Métrica de Sucesso:** Redução de 15% no orçamento."

Exemplo ERRADO:
"Contexto: Reformas. 2. A Dor: Perdem tempo. 3. Solução: Assistente. 4. Métrica: 15%."`;


  console.log("--- Gemini API Call Start ---");
  console.log("Model:", model);
  console.log("Phase:", currentPhase);
  console.log("History Length:", limitedMessages.length);
  console.log("System Instruction Length:", systemInstruction.length);
  
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

    console.log("Gemini raw response text:", response.text);
    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      console.log("--- Gemini API Call Success ---", parsed);
      return parsed;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw text:", text);
      // Attempt to extract JSON if it's wrapped in markdown
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log("--- Gemini API Call Success (Extracted) ---", extracted);
        return extracted;
      }
      throw parseError;
    }
  } catch (error) {
    console.error("--- Gemini API Call Error ---", error);
    // Fallback to a simple response if JSON parsing fails or API fails
    return { 
      text: "Desculpe, tive um problema técnico. Poderia repetir o que disse?",
      deliverableUpdates: []
    };
  }
}
