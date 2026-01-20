
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTask = async (taskTitle: string): Promise<AIAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this task and break it down into smaller steps: "${taskTitle}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subtasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 sub-steps to complete the main task."
          },
          tips: {
            type: Type.STRING,
            description: "A quick productivity tip for this specific task."
          },
          estimatedTime: {
            type: Type.STRING,
            description: "Estimated time to complete (e.g., '30 mins')."
          }
        },
        required: ["subtasks", "tips", "estimatedTime"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      subtasks: ["Start working", "Stay focused", "Complete task"],
      tips: "Break large goals into small steps.",
      estimatedTime: "Unknown"
    };
  }
};
