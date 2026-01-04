import React, { useState, useEffect } from 'react';
import { Language, DictionaryEntry } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { ResultView } from './components/ResultView';
import { NotebookView } from './components/NotebookView';
import { StudyView } from './components/StudyView';
import { lookupTerm } from './services/gemini';
import { Search, Book, GraduationCap, Loader2, ArrowRight } from 'lucide-react';

type View = 'search' | 'notebook' | 'study';

const App: React.FC = () => {
  // --- State ---
  const [hasSetup, setHasSetup] = useState(false);
  const [nativeLang, setNativeLang] = useState<Language>(Language.English);
  const [targetLang, setTargetLang] = useState<Language>(Language.Spanish);
  
  const [currentView, setCurrentView] = useState<View>('search');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<DictionaryEntry | null>(null);
  
  const [notebook, setNotebook] = useState<DictionaryEntry[]>([]);

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchResult(null);
    try {
      const result = await lookupTerm(searchTerm, nativeLang, targetLang);
      setSearchResult(result);
    } catch (error) {
      console.error(error);
      alert("Oops! Something went wrong trying to fetch that word. Try again?");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleSave = (entry: DictionaryEntry) => {
    setNotebook(prev => {
      if (prev.find(e => e.term === entry.term)) {
        return prev.filter(e => e.term !== entry.term);
      }
      return [entry, ...prev];
    });
  };

  const deleteFromNotebook = (id: string) => {
    setNotebook(prev => prev.filter(e => e.id !== id));
  };

  // --- Rendering ---

  if (!hasSetup) {
    return (
      <LanguageSelector 
        nativeLang={nativeLang}
        targetLang={targetLang}
        setNativeLang={setNativeLang}
        setTargetLang={setTargetLang}
        onConfirm={() => setHasSetup(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header (Sticky) */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          PopLingo
        </h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          <span>{targetLang}</span>
          <ArrowRight size={12} />
          <span>{nativeLang}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen">
        
        {currentView === 'search' && (
          <div className="p-4 pt-6 pb-24">
             {/* Search Input */}
             <form onSubmit={handleSearch} className="mb-8 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Type a word in ${targetLang}...`}
                className="w-full p-4 pr-12 rounded-2xl bg-white shadow-lg border-2 border-transparent focus:border-indigo-500 outline-none text-lg font-medium transition-all"
              />
              <button 
                type="submit"
                disabled={searchLoading}
                className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
              >
                {searchLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>
            </form>

            {/* Results or Empty State */}
            {searchResult && (
              <ResultView 
                entry={searchResult} 
                onSave={toggleSave}
                isSaved={!!notebook.find(e => e.term === searchResult.term)}
              />
            )}

            {!searchResult && !searchLoading && (
              <div className="text-center mt-12 opacity-50">
                <Search size={48} className="mx-auto mb-2 text-slate-300" />
                <p>Search for a word, phrase, or sentence!</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'notebook' && (
          <NotebookView 
            entries={notebook} 
            nativeLang={nativeLang}
            targetLang={targetLang}
            onDelete={deleteFromNotebook}
          />
        )}

        {currentView === 'study' && (
          <StudyView entries={notebook} />
        )}
        
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-around items-center h-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'search' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Search size={24} strokeWidth={currentView === 'search' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Search</span>
        </button>

        <button 
          onClick={() => setCurrentView('notebook')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'notebook' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <div className="relative">
            <Book size={24} strokeWidth={currentView === 'notebook' ? 3 : 2} />
            {notebook.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {notebook.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide">Notebook</span>
        </button>

        <button 
          onClick={() => setCurrentView('study')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'study' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <GraduationCap size={24} strokeWidth={currentView === 'study' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Study</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
