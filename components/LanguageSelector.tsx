import React from 'react';
import { Language } from '../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  nativeLang: Language;
  targetLang: Language;
  setNativeLang: (l: Language) => void;
  setTargetLang: (l: Language) => void;
  onConfirm: () => void;
}

export const LanguageSelector: React.FC<Props> = ({ 
  nativeLang, 
  targetLang, 
  setNativeLang, 
  setTargetLang, 
  onConfirm 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
          PopLingo
        </h1>
        <p className="text-slate-500 text-center mb-8">Let's get your learning setup.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I speak</label>
            <select 
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value as Language)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
            >
              {Object.values(Language).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight size={24} className="transform rotate-90 md:rotate-90" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I want to learn</label>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-pink-500 outline-none text-lg transition-all"
            >
              {Object.values(Language).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={onConfirm}
            className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};
