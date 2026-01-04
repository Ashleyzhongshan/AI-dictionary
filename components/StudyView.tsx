import React, { useState } from 'react';
import { DictionaryEntry } from '../types';
import { AudioButton } from './AudioButton';
import { RotateCw, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

interface Props {
  entries: DictionaryEntry[];
}

export const StudyView: React.FC<Props> = ({ entries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <GraduationCap size={64} className="mb-4 opacity-20" />
        <p className="text-xl">Nothing to study yet.</p>
        <p className="text-sm">Save some words to the notebook!</p>
      </div>
    );
  }

  const current = entries[currentIndex];

  const next = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % entries.length), 150);
  };
  
  const prev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + entries.length) % entries.length), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 pb-24">
      <div className="mb-6 flex items-center gap-2">
        <span className="font-mono text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {entries.length}
        </span>
      </div>

      <div 
        className="relative w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl border-2 border-indigo-50 flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 relative">
              {current.imageUrl ? (
                <img src={current.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
              ) : (
                <div className="text-slate-300">No Image</div>
              )}
               <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                Tap to flip
              </div>
            </div>
            <div className="h-1/3 flex flex-col items-center justify-center p-4 bg-white border-t border-slate-100">
              <h2 className="text-4xl font-black text-slate-800 text-center mb-2">{current.term}</h2>
              <div onClick={(e) => e.stopPropagation()}>
                <AudioButton text={current.term} />
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-3xl shadow-2xl flex flex-col p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{current.term}</h2>
              <div onClick={(e) => e.stopPropagation()}>
                <AudioButton text={current.term} className="bg-indigo-500 text-white hover:bg-indigo-400" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Definition</h3>
                <p className="text-xl font-medium leading-snug">{current.definition}</p>
              </div>

              <div>
                <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Example</h3>
                <p className="text-lg italic text-indigo-100">"{current.examples[0]?.text}"</p>
                <p className="text-sm text-indigo-300 mt-1">{current.examples[0]?.translation}</p>
                 <div onClick={(e) => e.stopPropagation()} className="mt-2">
                    <AudioButton text={current.examples[0]?.text || ""} size={16} className="bg-indigo-500 text-white hover:bg-indigo-400" />
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex justify-center text-indigo-300">
              <RotateCw size={24} />
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-8 mt-8">
        <button onClick={prev} className="p-4 rounded-full bg-white shadow-lg text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} className="p-4 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200 text-white hover:bg-indigo-700 active:scale-95 transition-all">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
