import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DictionaryEntry, Language, RawGeminiResponse } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches definition, examples, usage note, and generates an image in parallel.
 */
export const lookupTerm = async (
  term: string, 
  nativeLang: Language, 
  targetLang: Language
): Promise<DictionaryEntry> => {
  
  // 1. Text Generation (Definition, Examples, Usage)
  const textPromise = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate and define the term "${term}" from ${targetLang} to ${nativeLang}. 
    Provide a natural language definition in ${nativeLang}.
    Provide 2 example sentences in ${targetLang} with ${nativeLang} translations.
    Provide a "usageNote" in ${nativeLang} that explains cultural nuance, tone, or synonyms. 
    Make the usage note fun, lively, and casual (like a friend talking). Be concise. No greetings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                translation: { type: Type.STRING }
              }
            }
          },
          usageNote: { type: Type.STRING }
        }
      }
    }
  });

  // 2. Image Generation
  // Using gemini-2.5-flash-image for speed and efficiency
  const imagePromise = ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A simple, bright, fun, vector-art style illustration representing the concept of: "${term}". Do not include text in the image. colorful, flat design.` }
      ]
    }
  });

  const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

  // Parse Text
  const rawData = JSON.parse(textResponse.text || "{}") as RawGeminiResponse;

  // Extract Image
  let imageUrl = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    term: term,
    definition: rawData.definition,
    examples: rawData.examples,
    usageNote: rawData.usageNote,
    imageUrl: imageUrl,
    timestamp: Date.now()
  };
};

/**
 * Generates audio for a given text using Gemini TTS.
 */
export const generateAudio = async (text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Puck'): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decode Audio
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1
    );
    return audioBuffer;

  } catch (error) {
    console.error("Audio generation failed:", error);
    return null;
  }
};

/**
 * Generates a creative story using the list of terms.
 */
export const generateStory = async (terms: string[], nativeLang: Language, targetLang: Language): Promise<string> => {
  if (terms.length === 0) return "Add some words to your notebook first!";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, funny, and coherent story in ${targetLang} that incorporates the following words: ${terms.join(', ')}. 
    After the story, provide a brief summary in ${nativeLang}. 
    Highlight the keywords in the story by wrapping them in asterisks (*word*).`
  });

  return response.text || "Could not generate story.";
};


// --- Audio Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
