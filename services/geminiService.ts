import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Safely retrieve API key to avoid "process is not defined" errors in browser environments
// if the build configuration is incomplete.
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env.API_KEY is not accessible.");
    return '';
  }
};

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const streamCodeAnalysis = async (
  code: string,
  promptPrefix: string,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!code.trim()) return;

  try {
    const fullPrompt = `
${promptPrefix}

\`\`\`
${code}
\`\`\`
    `;

    // Using gemini-3-flash-preview for balance of speed and reasoning
    const modelId = 'gemini-3-flash-preview';

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 4096 }, 
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const content = chunk as GenerateContentResponse;
      if (content.text) {
        onChunk(content.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};