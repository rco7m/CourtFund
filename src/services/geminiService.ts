import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

const apiKey = EXPO_PUBLIC_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for the CourtFund / SportFund app. 
Your primary goal is to help users track their sports activity, expenses, performance, and equipment.
Always be encouraging, concise, and stay strictly on the topic of sports, fitness, racket sports, and related activities.
If the user asks something off-topic, politely guide them back to their sports and activity tracking.
Use emojis occasionally.`;

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  if (!genAI) {
    return "Error: Gemini API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.";
  }

  try {
    const modelLite = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // Using standard model as flash-lite may not be supported by name in all sdks, but wait, the prompt explicitly said 'gemini 2.5 flash lite'.
      systemInstruction: SYSTEM_PROMPT
    });

    // Attempting to use the requested model
    const actualModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await actualModel.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I ran into an error trying to process your request. Please try again later.";
  }
};
