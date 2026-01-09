import React, { useState } from 'react';
import { DictionaryEntry, Language } from '../types';
import { generateStory } from '../services/gemini';
import { Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface Props {
  entries: DictionaryEntry[];
  nativeLang: Language;
  targetLang: Language;
  onDelete: (id: string) => void;//源代码在app.tsx，在这里它只是接收了这个指令，并在用户点击垃圾桶图标时触发它。
  isDark: boolean;
}

export const NotebookView: React.FC<Props> = ({ entries, nativeLang, targetLang, onDelete, isDark }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const handleGenerateStory = async () => {
    setLoadingStory(true);
    try {
      const terms = entries.map(e => e.term);
      const result = await generateStory(terms, nativeLang, targetLang);
      setStory(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStory(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <BookOpen size={64} className="mb-4 opacity-20" />
        <p className="text-xl">Your notebook is empty.</p>
        <p className="text-sm">Search and save words to review them here.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 p-4 max-w-2xl mx-auto transition-colors duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800">My Notebook</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
          {entries.length} words
        </span>
      </div>

      {/* Story Mode */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-yellow-300" />
          <h3 className="font-bold text-xl">AI Story Time</h3>
        </div>
        <p className="text-indigo-100 text-sm mb-4">
          Generate a funny story using all your saved words to help you memorize them!
        </p>
        
        {!story && (
          <button 
            onClick={handleGenerateStory}
            disabled={loadingStory}
            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loadingStory ? <span className="animate-spin">✨</span> : <Sparkles size={18} />}
            {loadingStory ? 'Weaving Magic...' : 'Make a Story'}
          </button>
        )}

        {story && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4 border border-white/20">
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{story}</p>
            </div>
            <button 
              onClick={() => setStory(null)}
              className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-200 hover:text-white"
            >
              Close Story
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className={`p-4 rounded-2xl shadow-sm border transition-all ${ isDark 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-100'} flex items-center justify-between group`}
          >
            <div className="flex items-center gap-4">
              {entry.imageUrl && (
                <img src={entry.imageUrl} alt="" className={`w-12 h-12 rounded-lg object-cover ${isDark ? 'opacity-80' : 'bg-slate-100'}`} />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{entry.term}</h4>
                  <AudioButton text={entry.term} size={16} isDark={isDark}/>
                </div>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm line-clamp-1`}>{entry.definition}</p>
              </div>
            </div>
            <button 
              onClick={() => onDelete(entry.id)}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
