import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(model: string) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Hello",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING }
          }
        }
      }
    });
    console.log(`[SUCCESS] ${model}:`, response.text);
  } catch (e: any) {
    console.error(`[ERROR] ${model}:`, e.message);
  }
}

async function run() {
  await testModel('gemini-3-flash-preview');
  await testModel('gemini-3.1-pro-preview');
  await testModel('gemini-3.1-flash-lite-preview');
  await testModel('gemini-3-pro-image-preview');
  await testModel('gemini-3.1-flash-live-preview');
}

run();
