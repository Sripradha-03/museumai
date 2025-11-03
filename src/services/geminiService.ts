
import { GoogleGenAI, Type } from "@google/genai";
import { mockExhibits } from './mockData';

// FIX: Per coding guidelines, the API key must be obtained exclusively from process.env.API_KEY. This also fixes the TypeScript error.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // FIX: Updated warning message to reflect the change to process.env.API_KEY.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const knownArtworksForPrompt = mockExhibits.map(art => ({
  id: art.id,
  title: art.title,
  artist: art.artist
}));

export async function identifyArtwork(base64Image: string): Promise<string | null> {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const prompt = `
    You are a world-class art identification expert for a museum. Your task is to meticulously analyze the attached image of a painting or artifact.
    
    Your goal is to identify which of the following known artworks it is. Be precise and confident in your identification.
    
    List of known artworks:
    ${JSON.stringify(knownArtworksForPrompt)}
    
    Carefully compare the visual features in the image (style, subject, colors, details) against the provided list. Respond with the single, most likely match.
    
    If the image is not a clear match for any artwork in the list, or if you are not highly confident in the match, you must identify it as 'UNKNOWN'. Do not guess.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Upgraded to a more powerful model
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Image,
                    },
                },
                { text: prompt },
            ],
        },
        config: { // Enforce structured JSON output for reliability
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    artworkId: {
                        type: Type.STRING,
                        description: "The unique ID of the identified artwork from the provided list, or 'UNKNOWN' if it cannot be confidently identified."
                    }
                },
                required: ["artworkId"],
            },
        }
    });

    const resultText = response.text.trim();
    const resultJson = JSON.parse(resultText);
    const artworkId = resultJson.artworkId;
    
    if (artworkId === 'UNKNOWN') {
      console.warn(`Gemini could not identify the artwork.`);
      return null;
    }
    
    const isValidId = mockExhibits.some(exhibit => exhibit.id === artworkId);

    if (isValidId) {
      return artworkId;
    }

    console.warn(`Gemini returned an invalid ID that was not in the provided list: "${artworkId}"`);
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        // This can happen if the model fails to return valid JSON despite the schema.
        console.error("Failed to parse JSON response from Gemini.");
    }
    return null;
  }
}
