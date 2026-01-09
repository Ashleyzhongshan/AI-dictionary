//React 的连接主要靠两个机制：Import（导入） 和 Props（属性传递）。

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
  const [targetLang, setTargetLang] = useState<Language>(Language.Mandarin);
  
  const [currentView, setCurrentView] = useState<View>('search');//currentView: 这是一个字符串。它决定了在主应用中，你是在“搜索”、“生词本”还是“复习”页面。
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<DictionaryEntry | null>(null);
  
  const [notebook, setNotebook] = useState<DictionaryEntry[]>([]);
  const [isDark, setIsDark] = useState(false); //默认是浅色模式

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); //HTML 表单默认提交后会刷新整个页面。这行代码拦截了这个默认行为，让页面不刷新，实现丝滑的单页体验。
    if (!searchTerm.trim()) return; //如果用户只输入了空格或者啥也没输，直接结束函数，不浪费 API 额度。

    setSearchLoading(true); //开启加载状态：告诉大脑“开始干活了”，界面上对应的加载动画会因此转起来。
    setSearchResult(null); //清空旧结果：在展示新单词前，先把上一个单词的结果藏起来，避免画面混乱。
    //这是一个“保险箱”结构。try 里跑正常的逻辑，万一出事了（断网、API 挂了）就跳到 catch，无论成功还是失败，最后都会执行 finally。
    try { 
      const result = await lookupTerm(searchTerm, nativeLang, targetLang); //调用神经系统（Gemini）。await 表示：等到 AI 把结果送回来，再赋值给 result。
      setSearchResult(result); //把拿到的果实存进大脑状态，触发 React 重新渲染，把卡片显示出来。
    } catch (error) {
      console.error(error);
      alert("Oops! Something went wrong trying to fetch that word. Try again?");
    } finally {
      setSearchLoading(false); //关闭加载状态：无论结果如何，活干完了，让小圈圈停止转动。
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
  //
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
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Header (Sticky) */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          PopLingo
        </h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          <span>{targetLang}</span>
          <ArrowRight size={12} />
          <span>{nativeLang}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full px-4 mb-8">
        
        {currentView === 'search' && (
          <div className="space-y-8"> {/* 增加一个垂直间距容器 */}
            {/* 搜索框：直接让 form 成为那个带背景和边框的矩形 */}
            <form 
              onSubmit={handleSearch} 
              className={`flex items-center gap-2 p-2 rounded-2xl shadow-lg border transition-all duration-300 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Type a word in ${targetLang}...`}
                  className={`flex-1 px-4 py-3 bg-transparent outline-none text-xl font-medium ${
                    isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                />
      
                <button 
                  type="submit"
                  disabled={searchLoading}
                  className="flex-shrink-0 p-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                >
                  {searchLoading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                </button>
            </form>

            {/* Results or Empty State */}
            {searchResult && (
              <ResultView 
                entry={searchResult} 
                onSave={toggleSave}
                isSaved={!!notebook.find(e => e.term === searchResult.term)}
                isDark={isDark} //这一行是新加的，把状态传下去
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
          <Search size={24} strokeWidth={currentView === 'search' ? 3 : 2} /> {/*当你在 search 页面时，图标线条会变粗（3），不在时则变细（2），这种细节增加了 UI 的精致感。*/}
          <span className="text-[10px] font-bold uppercase tracking-wide">Search</span>
        </button>

        <button 
          onClick={() => setCurrentView('notebook')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'notebook' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          {/* 变色逻辑：代码会检查当前的 currentView 是否等于 'notebook'。 变成紫色 (Indigo)：如果判断为 真 (True)，则应用 text-indigo-600（一种深紫蓝色），让按钮看起来是"激活状态" */}
          <div className="relative">
            <Book size={24} strokeWidth={currentView === 'notebook' ? 3 : 2} />
            {notebook.length > 0 && ( //在 React 的 JSX 语法中，{condition && <Component />} 被称为 短路逻辑渲染。
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
