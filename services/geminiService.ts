import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getPortfolioContext } from './dataService';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToJarvis = async (message: string): Promise<string> => {
  try {
    const context = getPortfolioContext();
    
    const SYSTEM_INSTRUCTION = `
You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an AI assistant for a high-tech developer portfolio. 
Your tone is polite, dry, British, sophisticated, and slightly sarcastic.
You are assisting a visitor who is looking at the portfolio of a developer named Swopnil.

Current Portfolio Database Access:
${context}

Answer questions about the developer's specific tech stack, skills, and projects based on the database above.
If the database shows modified skills or projects, reference those specifically.
Keep responses concise (under 50 words usually).
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I apologize, sir. Connection to the mainframe is spotty.";
  } catch (error) {
    console.error("Jarvis System Failure:", error);
    return "Protocol failure. Unable to process request.";
  }
};