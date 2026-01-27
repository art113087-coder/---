
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SHOP_ADDRESS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Provides fashion advice with maps and search grounding.
 */
export async function getFashionAdviceWithMaps(
  query: string, 
  availableProducts: string[], 
  location?: { latitude: number, longitude: number }, 
  lang: string = 'ru'
): Promise<{ text: string; grounding: any[] }> {
  const languageName = lang === 'kk' ? 'Kazakh' : lang === 'ky' ? 'Kyrgyz' : 'Russian';
  
  try {
    // googleMaps and googleSearch are used together for high-quality location-aware advice.
    // Maps grounding is only supported in Gemini 2.5 series.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a professional fashion stylist at "Zhumagul" boutique in Shymkent. 
      Respond ONLY in ${languageName}.
      
      Shop Address: ${SHOP_ADDRESS}.
      Available Products in Catalog: ${availableProducts.join(', ')}. 
      
      Use Google Search to find latest fashion trends in Kazakhstan/Shymkent if needed.
      If user asks for address, provide ${SHOP_ADDRESS} and use Google Maps links.
      Be elegant, welcoming, and expert.
      
      User Query: "${query}"`,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location
          }
        }
      }
    });

    return {
      text: response.text || "...",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Fashion advice error:", error);
    return { text: "Простите, возникла ошибка. Попробуйте еще раз.", grounding: [] };
  }
}

/**
 * Analyzes an image to generate keywords for product search.
 */
export async function analyzeImageForSearch(base64Image: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: "Analyze this clothing item. Describe its type, primary color, style (e.g., evening, casual), and key features. Return only a short comma-separated list of keywords in Russian." }
        ]
      }
    });
    return response.text || "";
  } catch (e) { 
    console.error("Image analysis error:", e);
    return ""; 
  }
}

/**
 * Edits an image based on a text prompt.
 */
export async function editImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { 
    console.error("Image editing error:", e);
    return null; 
  }
}

/**
 * Generates a video using Veo 3.1.
 */
export async function generateVeoVideo(prompt: string, baseImage?: string): Promise<string> {
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const config: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
  };
  if (baseImage) {
    const dataPart = baseImage.includes(',') ? baseImage.split(',')[1] : baseImage;
    config.image = { imageBytes: dataPart, mimeType: 'image/png' };
  }
  
  let operation = await veoAi.models.generateVideos(config);
  while (!operation.done) {
    await new Promise(res => setTimeout(res, 10000));
    operation = await veoAi.operations.getVideosOperation({ operation: operation });
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed: No download link");
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Generates a high-quality lifestyle image of a product.
 */
export async function generateLifestyleImage(productName: string, productDesc: string, moodPrompt: string): Promise<string | null> {
  try {
    const prompt = `High-end fashion photography of a woman wearing "${productName}". 
    Dress details: ${productDesc}. 
    Mood and Setting: ${moodPrompt}. 
    Professional editorial lighting, 8k resolution, photorealistic, elegant aesthetic.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "3:4" 
        } 
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { 
    console.error("Image generation failed:", e);
    return null; 
  }
}
