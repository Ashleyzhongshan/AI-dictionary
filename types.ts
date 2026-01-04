export enum Language {
  English = 'English',
  Spanish = 'Spanish',
  Mandarin = 'Mandarin Chinese',
  Hindi = 'Hindi',
  Arabic = 'Arabic',
  Bengali = 'Bengali',
  Portuguese = 'Portuguese',
  Russian = 'Russian',
  Japanese = 'Japanese',
  French = 'French'
}

export interface ExampleSentence {
  text: string;
  translation: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  examples: ExampleSentence[];
  usageNote: string;
  imageUrl?: string; // base64 string
  timestamp: number;
}

// For Gemini JSON Schema
export interface RawGeminiResponse {
  definition: string;
  examples: ExampleSentence[];
  usageNote: string;
}
