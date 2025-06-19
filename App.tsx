
import React, { useState, useCallback, useEffect } from 'react';
import { ToggleSwitch } from './components/ToggleSwitch';
import { ConversionMode } from './types';
import { IconDocumentText, IconFileTypeDoc } from './components/Icons'; 
import { BuyMeACoffeeButton } from './components/BuyMeACoffeeButton';
import { MarkdownToWordConverter } from './components/MarkdownToWordConverter';
import { WordToMarkdownConverter } from './components/WordToMarkdownConverter';

const App: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>(() => {
    const saved = localStorage.getItem('mdWord_mode') as ConversionMode;
    return saved || ConversionMode.MARKDOWN_TO_WORD;
  });

  useEffect(() => {
    localStorage.setItem('mdWord_mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === ConversionMode.MARKDOWN_TO_WORD 
      ? ConversionMode.WORD_TO_MARKDOWN 
      : ConversionMode.MARKDOWN_TO_WORD);
  }, []);


  return (
    <div className="min-h-screen bg-black text-neutral-300 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
          MDWord
        </h1>
        <p className="mt-2 text-lg text-neutral-400">
          Seamlessly convert between Markdown and Word documents.
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/50">
          <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-emerald-300 font-medium">
            100% Local Processing - Your documents never leave your device
          </span>
        </div>
      </header>

      <main className="w-full max-w-2xl bg-neutral-900 shadow-2xl shadow-emerald-500/10 rounded-xl p-6 md:p-8 border border-emerald-700">
        <div className="mb-6">
          <ToggleSwitch
            labelLeft="Markdown to Word"
            labelRight="Word to Markdown"
            iconLeft={<IconDocumentText className="w-5 h-5" />}
            iconRight={<IconFileTypeDoc className="w-5 h-5" />}
            isChecked={mode === ConversionMode.WORD_TO_MARKDOWN}
            onChange={toggleMode}
            titleLeft="Switch to Markdown to Word converter"
            titleRight="Switch to Word to Markdown converter"
          />
        </div>
        
        {mode === ConversionMode.MARKDOWN_TO_WORD ? (
          <MarkdownToWordConverter />
        ) : (
          <WordToMarkdownConverter />
        )}
        
      </main>

      <footer className="mt-12 text-center text-neutral-400 text-sm space-y-2">
        <BuyMeACoffeeButton />
        <p>Created by IronAdamant, assisted by AI.</p>
        <p>&copy; {new Date().getFullYear()} MDWord. All rights reserved.</p>
        <p className="text-xs text-neutral-500">Powered by React, Tailwind CSS, and awesome open-source libraries.</p>
      </footer>
    </div>
  );
};

export default App;
