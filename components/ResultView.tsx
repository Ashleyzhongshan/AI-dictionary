import React from 'react';
import { DictionaryEntry } from '../types';
import { AudioButton } from './AudioButton';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface Props {
  entry: DictionaryEntry;
  onSave: (entry: DictionaryEntry) => void;
  isSaved: boolean;
}

export const ResultView: React.FC<Props> = ({ entry, onSave, isSaved }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-24 animate-fade-in-up">
      {/* Image Header */}
      <div className="relative h-64 bg-slate-200 w-full overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt={entry.term} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No image available
          </div>
        )}
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => onSave(entry)}
            className="bg-white/90 backdrop-blur p-3 rounded-full shadow-lg text-pink-500 hover:scale-110 transition-transform"
          >
            {isSaved ? <BookmarkCheck size={24} fill="currentColor" /> : <Bookmark size={24} />}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-4xl font-extrabold text-slate-900">{entry.term}</h2>
          <AudioButton text={entry.term} size={28} className="bg-pink-100 text-pink-600 hover:bg-pink-200" />
        </div>
        
        <p className="text-xl text-slate-600 mb-6 font-medium">{entry.definition}</p>

        {/* Usage Note */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl mb-8">
          <h3 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-1">Pop Note</h3>
          <p className="text-amber-900 italic leading-relaxed">{entry.usageNote}</p>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Examples</h3>
          {entry.examples.map((ex, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <p className="text-indigo-900 font-medium text-lg leading-snug">{ex.text}</p>
                <AudioButton text={ex.text} size={18} />
              </div>
              <p className="text-slate-500 mt-1">{ex.translation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
