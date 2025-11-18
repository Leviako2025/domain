
import { GoogleGenAI, Type } from "@google/genai";
import { IdentityIdea, IdentityAnalysis } from '../types';

// Initialize the client - Create a new one for each request to ensure fresh state/key.
// Access process.env.API_KEY lazily to prevent runtime errors if process is not immediately defined during module load.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateIdentities = async (description: string): Promise<IdentityIdea[]> => {
  const ai = getAIClient();
  
  const prompt = `
    You are a domain name and branding expert.
    The user wants to launch a website for: "${description}".
    
    Generate 8 unique, high-value domain names complete with extensions (TLDs).
    
    Rules:
    1. Analyze the intent:
       - Selling/Shop -> Use .shop, .store, .com, .co
       - Tech/SaaS -> Use .io, .ai, .app, .dev
       - Creative/Portfolio -> Use .studio, .design, .me
       - General -> Use .com, .net, .org
    2. The 'handle' MUST include the extension (e.g., 'UrbanFlow.shop', 'CodeStream.io').
    3. Be creative. Avoid generic names. Use compounding, blending, or evocative words.
    
    For each idea, classify it into a category: 
    'Commerce', 'Gaming', 'Tech', 'Creative', 'Personal', 'Other'.

    For each, provide:
    - handle (The full domain with extension)
    - style (e.g., "Modern Retail", "SaaS", "Minimalist")
    - category (The strict category from above)
    - explanation (One short sentence on why this domain works for the brand)
    - vibe (The brand personality)
    - availabilityScore (1-10)
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
            handle: { type: Type.STRING, description: "The full domain name (e.g. 'PixelMarket.shop')" },
            style: { type: Type.STRING, description: "The brand style" },
            category: { type: Type.STRING, description: "Category: Commerce, Gaming, Tech, Creative, Personal, Other" },
            explanation: { type: Type.STRING, description: "Why this domain works" },
            vibe: { type: Type.STRING, description: "The personality" },
            availabilityScore: { type: Type.INTEGER, description: "Uniqueness score 1-10" }
          },
          required: ["handle", "style", "category", "explanation", "vibe", "availabilityScore"]
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
  
  const domainParts = handle.split('.');
  const nameOnly = domainParts[0]; // e.g. "urbanflow" from "urbanflow.shop"
  
  const platforms = ["twitter.com", "instagram.com", "tiktok.com", "facebook.com"];
  const tldsToCheck = [".com", ".io", ".ai", ".co", ".app"];
  
  // Construct a search query that looks for the specific generated handle, common TLD variations, and social profiles
  const searchQuery = [
    `site:${handle}`, // Check the specific domain generated
    ...tldsToCheck.map(tld => `site:${nameOnly}${tld}`), // Check variations
    ...platforms.map(p => `site:${p}/${nameOnly}`) // Check socials
  ].join(" OR ");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Perform a comprehensive availability check for the brand name "${nameOnly}" and the specific domain "${handle}".
      
      Google Search Query used:
      ${searchQuery}

      Analyze the search results to determine:
      1. Is ${nameOnly}.com taken (active website)?
      2. Is ${nameOnly}.io taken?
      3. Is ${nameOnly}.ai taken?
      4. Is ${nameOnly}.co taken?
      5. Is ${nameOnly}.app taken?
      6. Are there existing social media profiles for "${nameOnly}"?

      If a website is found, extract its title and a brief description.
      
      Return a JSON object.
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          socialsFound: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of social platforms where the name is found (e.g. ['Twitter', 'Instagram'])"
          },
          tldStatus: {
            type: Type.OBJECT,
            properties: {
              ".com": { type: Type.STRING, enum: ["AVAILABLE", "TAKEN", "UNKNOWN"] },
              ".io": { type: Type.STRING, enum: ["AVAILABLE", "TAKEN", "UNKNOWN"] },
              ".ai": { type: Type.STRING, enum: ["AVAILABLE", "TAKEN", "UNKNOWN"] },
              ".co": { type: Type.STRING, enum: ["AVAILABLE", "TAKEN", "UNKNOWN"] },
              ".app": { type: Type.STRING, enum: ["AVAILABLE", "TAKEN", "UNKNOWN"] }
            },
            required: [".com", ".io", ".ai", ".co", ".app"]
          },
          summary: { type: Type.STRING, description: "A brief text summary of the availability." },
          websiteTitle: { type: Type.STRING, description: "Title of the main conflicting website if found, else N/A" },
          websiteDescription: { type: Type.STRING, description: "Description of the main conflicting website if found, else N/A" }
        },
        required: ["socialsFound", "tldStatus", "summary"]
      }
    },
  });

  if (response.text) {
    try {
      const data = JSON.parse(response.text);
      return {
        handle,
        takenOn: data.socialsFound || [],
        summary: data.summary || "Analysis complete.",
        profileTitle: data.websiteTitle !== "N/A" ? data.websiteTitle : undefined,
        profileDescription: data.websiteDescription !== "N/A" ? data.websiteDescription : undefined,
        tldStatus: data.tldStatus
      };
    } catch (e) {
      console.error("Failed to parse analysis JSON", e);
    }
  }

  // Fallback if JSON parsing fails (should rarely happen with structured output)
  return {
    handle,
    takenOn: [],
    summary: "Could not verify availability details.",
    tldStatus: {}
  };
};

export const generateAvatar = async (handle: string, vibe: string, category: string = 'Other'): Promise<string> => {
  const ai = getAIClient();
  
  let visualContext = "";
  // Generate Website Mocks / Landing Page Hero Sections
  switch (category.toLowerCase()) {
    case 'commerce':
      visualContext = "Modern E-commerce website homepage mockup, displaying trendy products, 'Shop Now' button, clean UI, bright and inviting.";
      break;
    case 'gaming':
      visualContext = "Esports team website landing page, dark mode, neon accents, roster showcase, aggressive typography.";
      break;
    case 'tech':
      visualContext = "SaaS startup landing page hero section, isometric 3D illustrations, dashboard preview, blue and white color scheme, modern.";
      break;
    case 'creative':
      visualContext = "Design portfolio website header, bold typography, masonry grid layout of art, minimalist, artistic.";
      break;
    case 'personal':
      visualContext = "Personal brand website, professional headshot placeholder, biography text, clean serif fonts, elegant.";
      break;
    default:
      visualContext = "Professional small business website landing page, hero image, clear value proposition, modern web design.";
  }

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `High-fidelity website UI design mockup for a brand named "${handle}". 
             Category: ${category}.
             Visual Context: ${visualContext}.
             Vibe: ${vibe}.
             Style: Professional web design, Dribbble trending, high resolution, photorealistic UI. 
             The image should look like a screenshot of a browser window showing the website.`,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9', // Widescreen for website preview
      outputMimeType: 'image/jpeg',
    },
  });

  const base64 = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64) throw new Error("Failed to generate website preview");
  
  return `data:image/jpeg;base64,${base64}`;
};
