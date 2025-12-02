import { GoogleGenAI, Type } from "@google/genai";
import { GrammarSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GRAMMAR_SYSTEM_INSTRUCTION = `
You are an expert academic editor and LaTeX specialist. 
Your task is to analyze the provided text (which may contain LaTeX syntax) for grammar, spelling, punctuation, and style errors.
- Ignore standard LaTeX commands (like \\documentclass, \\begin, \\section, labels, refs) unless the command itself is misspelled.
- Focus on the human-readable content.
- Provide constructive suggestions.
- Return the result strictly as a JSON object containing an array of suggestions.
`;

const CHAT_SYSTEM_INSTRUCTION = `
You are a helpful LaTeX assistant. You help users write LaTeX code, fix compilation errors, and format equations.
You are concise and provide code snippets directly.
`;

export const checkGrammar = async (text: string): Promise<GrammarSuggestion[] | null> => {
  try {
    if (!text || text.trim().length === 0) return [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: `Analyze the following text for grammar and style improvements:\n\n${text}`
        }]
      },
      config: {
        systemInstruction: GRAMMAR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "The incorrect segment of text" },
                  suggestion: { type: Type.STRING, description: "The corrected text" },
                  explanation: { type: Type.STRING, description: "Why this change is recommended" },
                  context: { type: Type.STRING, description: "A short snippet of surrounding text to help locate the error" }
                },
                required: ["original", "suggestion", "explanation", "context"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    if (response.text) {
      const json = JSON.parse(response.text);
      return json.suggestions || [];
    }
    return [];
  } catch (error) {
    console.error("Grammar check failed:", error);
    // Return null to indicate failure instead of empty array (which means no errors)
    return null; 
  }
};

export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
      history: history
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Chat failed:", error);
    onChunk("\n[Error: Failed to get response from AI. Please try again.]");
  }
};