import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transforms raw webhook JSON into a structured flat object based on user instructions.
 */
export const transformWebhookData = async (
  rawJson: string, 
  instructions: string
): Promise<Record<string, any>> => {
  try {
    const modelId = 'gemini-2.5-flash';

    const systemPrompt = `
      Você é um especialista em Integração de Dados e Webhooks (ETL).
      Sua tarefa é receber um JSON bruto de um webhook e transformá-lo em um objeto JSON plano (flat key-value pairs) para ser inserido em uma planilha.
      
      Regras:
      1. Analise o JSON de entrada.
      2. Siga estritamente as instruções de transformação do usuário. Se o usuário não der instruções específicas, extraia os campos mais importantes e nivele objetos aninhados (ex: 'customer.address.city' vira 'customer_city').
      3. O output DEVE ser apenas um objeto JSON válido. Sem blocos de código markdown (\`\`\`), sem texto extra.
      4. Normalize datas para formato ISO 8601 ou YYYY-MM-DD HH:mm se possível.
      5. Todos os valores devem ser primitivos (string, number, boolean, null). Não retorne arrays ou objetos aninhados como valores. Converta arrays em strings separadas por vírgula se necessário.
    `;

    const userPrompt = `
      DADOS DO WEBHOOK (JSON):
      ${rawJson}

      INSTRUÇÕES DE TRANSFORMAÇÃO:
      ${instructions}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for consistent formatting
      }
    });

    const textResult = response.text;
    
    if (!textResult) {
      throw new Error("A resposta da IA veio vazia.");
    }

    return JSON.parse(textResult);

  } catch (error) {
    console.error("Erro ao transformar dados com Gemini:", error);
    throw error;
  }
};