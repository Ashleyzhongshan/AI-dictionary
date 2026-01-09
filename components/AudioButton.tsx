import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { generateAudio } from '../services/gemini';

interface Props {
  text: string;
  className?: string;
  size?: number;
  isDark?: boolean;
}

export const AudioButton: React.FC<Props> = ({ text, className = "", size = 20, isDark }) => {
  const [loading, setLoading] = useState(false);

  const play = async () => {
    if (loading) return;
    setLoading(true);
    
    //AI 返回的不是文字，而是一串由 0 和 1 组成的二进制流（Binary Data）。这串数据代表了声音的频率、振幅等物理信息。
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
        e.stopPropagation();//这个按钮可能被放在一个“点击会翻转”的生词本卡片上。如果没有这一行，你点喇叭听声音时，整张卡片也会跟着翻转。加上这一行，点击就只会留在按钮本身。
        play();
      }}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
      } ${className}`}
      title="Play pronunciation"
    >
      {loading ? <Loader2 size={size} className="animate-spin" /> : <Volume2 size={size} />}
    </button>
  );
};
