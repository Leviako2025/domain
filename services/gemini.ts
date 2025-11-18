import { GoogleGenAI, Type } from "@google/genai";
import { IdentityIdea, IdentityAnalysis } from '../types';

// Initialize the client - Create a new one for each request to ensure fresh state/key.
// Access process.env.API_KEY lazily to prevent runtime errors if process is not immediately defined during module load.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateIdentities = async (description: string): Promise<IdentityIdea[]> => {
  const ai = getAIClient();
  
  const prompt = `
    You are a creative naming expert for the internet era.
    The user describes their persona or content focus: "${description}".
    
    Generate 8 unique, catchy, and usable usernames/gamertags.
    Focus on:
    1. Handles suitable for Twitter, Instagram, Twitch, Discord, or Gaming.
    2. Clever wordplay, compounding, or stylistic spelling (e.g. removing vowels, using 'x' or 'z' if gamer style).
    3. Vibe can vary from "Professional" to "Edgy" to "Cute" based on the input.
    4. Avoid generic numbers like '123' unless stylistically relevant (e.g. '1337').
    
    For each, provide a "style" (e.g., "Minimal", "Gamer", "Tech") and a short explanation.
    Estimate an "availabilityScore" from 1-10 (10 being highly unique/abstract and likely available).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            handle: { type: Type.STRING, description: "The username (e.g. 'Ninja', 'CodeWiz')" },
            style: { type: Type.STRING, description: "The naming style category" },
            explanation: { type: Type.STRING, description: "Why this works" },
            vibe: { type: Type.STRING, description: "The personality" },
            availabilityScore: { type: Type.INTEGER, description: "Uniqueness score 1-10" }
          },
          required: ["handle", "style", "explanation", "vibe", "availabilityScore"]
        }
      }
    }
  });

  if (response.text) {
    try {
      const data = JSON.parse(response.text);
      return data as IdentityIdea[];
    } catch (e) {
      console.error("Failed to parse JSON", e);
      throw new Error("AI response was not valid JSON");
    }
  }
  
  throw new Error("No response from AI");
};

export const checkIdentityPresence = async (handle: string): Promise<IdentityAnalysis> => {
  const ai = getAIClient();
  
  // Check specifically for social media profiles
  const platforms = ["twitter.com", "instagram.com", "twitch.tv", "tiktok.com", "github.com", "youtube.com"];
  const searchQuery = platforms.map(p => `site:${p}/${handle}`).join(" OR ");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Search for exact profile matches for the username "${handle}" on major platforms using this query:
      ${searchQuery}

      Analyze the search results to see if a user profile specifically exists for "${handle}".
      Ignore searching for the handle inside post content, look for profile URLs.

      Return a summary of which platforms seem to have this handle TAKEN.
      Format:
      Taken: [List of platforms found, comma separated, e.g. Twitter, Twitch]
      Summary: [Brief sentence about availability]
      
      If none found, say:
      Taken: None
      Summary: Likely available on major platforms.
    `,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  
  // Simple parsing logic
  const takenMatch = text.match(/Taken:\s*(.+)/i);
  const summaryMatch = text.match(/Summary:\s*(.+)/i);

  let takenOn: string[] = [];
  if (takenMatch) {
    const takenStr = takenMatch[1].trim();
    if (takenStr.toLowerCase() !== 'none') {
      takenOn = takenStr.split(',').map(s => s.trim());
    }
  }

  return {
    handle,
    takenOn,
    summary: summaryMatch ? summaryMatch[1] : text,
  };
};

export const generateAvatar = async (handle: string, vibe: string): Promise<string> => {
  const ai = getAIClient();
  
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Design a cool, high-quality profile picture / avatar for a user named "${handle}". 
             The vibe is "${vibe}". 
             Style: Digital art, esports mascot, or minimalist vector depending on the vibe.
             Center the design. No complex text, maybe just the initial letter or a symbol.`,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/jpeg',
    },
  });

  const base64 = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64) throw new Error("Failed to generate avatar");
  
  return `data:image/jpeg;base64,${base64}`;
};