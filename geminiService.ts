
import { GoogleGenAI, Type } from "@google/genai";
import { CrowdLevel, PredictionResult } from "./types";

// Use import.meta.env for Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getCampusPrediction = async (
  module: string, 
  day: string, 
  time: string, 
  context: string = ""
): Promise<PredictionResult> => {
  // If API key is not available, return fallback prediction
  if (!ai) {
    return {
      crowdLevel: 'Medium',
      estimatedWaitMinutes: 15,
      confidence: 0.5,
      reasoning: "API key not configured. Using default prediction based on typical weekday patterns."
    };
  }

  try {
    // Use ai.models.generateContent to query GenAI.
    const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Predict the crowd and demand for ${module} at CMRIT campus on ${day} at ${time}. Context: ${context}. Return a JSON object with: crowdLevel (Low/Medium/High), estimatedWaitMinutes (number), confidence (0-1 float), and reasoning (short string).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          crowdLevel: { type: Type.STRING },
          estimatedWaitMinutes: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
        },
        required: ["crowdLevel", "estimatedWaitMinutes", "confidence", "reasoning"]
      }
    }
    });

    // response.text is a property, not a function.
    const text = response.text || "{}";
    return JSON.parse(text) as PredictionResult;
  } catch (e) {
    // Fallback if AI fails or formatting is off
    return {
      crowdLevel: 'Medium',
      estimatedWaitMinutes: 15,
      confidence: 0.5,
      reasoning: "Based on typical weekday patterns."
    };
  }
};

export const getDemandForecast = async (day: string): Promise<string[]> => {
  if (!ai) {
    // Return default items if API is not available
    return ['South Indian Thali', 'Hyderabadi Biryani', 'Butter Masala Dosa', 'Filtered Coffee', 'Fresh Fruit Bowl'];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `List 5 high-demand food items for a university canteen on ${day} considering student preferences and typical college schedules. Return as a plain comma-separated list.`,
    });
    // response.text is a property, not a function.
    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (e) {
    // Return default items on error
    return ['South Indian Thali', 'Hyderabadi Biryani', 'Butter Masala Dosa', 'Filtered Coffee', 'Fresh Fruit Bowl'];
  }
};
