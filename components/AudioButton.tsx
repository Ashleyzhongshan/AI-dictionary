import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { generateAudio } from '../services/gemini';

interface Props {
  text: string;
  className?: string;
  size?: number;
}

export const AudioButton: React.FC<Props> = ({ text, className = "", size = 20 }) => {
  const [loading, setLoading] = useState(false);

  const play = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const buffer = await generateAudio(text);
      if (buffer) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        play();
      }}
      disabled={loading}
      className={`p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors flex items-center justify-center ${className}`}
      title="Play pronunciation"
    >
      {loading ? <Loader2 size={size} className="animate-spin" /> : <Volume2 size={size} />}
    </button>
  );
};
