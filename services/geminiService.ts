
import { GoogleGenAI, Type } from "@google/genai";

export const processInvoiceOCR = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Analise esta nota fiscal de compras de alimentos. Extraia os itens, suas quantidades e preços unitários. Retorne APENAS um JSON no formato: { items: [{ nome: string, quantidade: number, unidade: string, preco_unitario: number }] }",
        },
      ],
    },
    config: {
      // responseMimeType is allowed when not using googleMaps tool
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING },
                quantidade: { type: Type.NUMBER },
                unidade: { type: Type.STRING },
                preco_unitario: { type: Type.NUMBER },
              },
              required: ["nome", "quantidade", "preco_unitario"]
            }
          }
        }
      }
    }
  });

  // Access .text as a property and handle potential undefined
  const text = response.text;
  if (!text) return [];

  try {
    const result = JSON.parse(text.trim());
    return result.items || [];
  } catch (e) {
    console.error("Erro ao processar OCR", e);
    return [];
  }
};
