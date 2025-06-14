
import React, { useState, useCallback, useEffect } from 'react';
import { ToggleSwitch } from './components/ToggleSwitch';
import { ConversionMode } from './types';
import { IconDocumentText, IconFileTypeDoc } from './components/Icons'; 
import { BuyMeACoffeeButton } from './components/BuyMeACoffeeButton';

// Static import for components
import { MarkdownToWordConverter } from './components/MarkdownToWordConverter';
import { WordToMarkdownConverter } from './components/WordToMarkdownConverter';

const LS_CONVERSION_MODE_KEY = 'docuMorph_conversionMode';

const App: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>(() => {
    const savedMode = localStorage.getItem(LS_CONVERSION_MODE_KEY) as ConversionMode;
    return savedMode || ConversionMode.MARKDOWN_TO_WORD;
  });

  useEffect(() => {
    localStorage.setItem(LS_CONVERSION_MODE_KEY, mode);
  }, [mode]);

  const handleToggleMode = useCallback(() => {
    setMode(prev => 
      prev === ConversionMode.MARKDOWN_TO_WORD 
        ? ConversionMode.WORD_TO_MARKDOWN 
        : ConversionMode.MARKDOWN_TO_WORD
    );
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-300 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
          DocuMorph
        </h1>
        <p className="mt-2 text-lg text-neutral-400">
          Seamlessly convert between Markdown and Word documents.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-neutral-900 shadow-2xl shadow-emerald-500/10 rounded-xl p-6 md:p-8 border border-emerald-700">
        <div className="mb-6">
          <ToggleSwitch
            labelLeft="Markdown to Word"
            labelRight="Word to Markdown"
            iconLeft={<IconDocumentText className="w-5 h-5" />}
            iconRight={<IconFileTypeDoc className="w-5 h-5" />}
            isChecked={mode === ConversionMode.WORD_TO_MARKDOWN}
            onChange={handleToggleMode}
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
        <p>Created by TrazynCache, with help of Gemini.</p>
        <p>&copy; {new Date().getFullYear()} DocuMorph. All rights reserved.</p>
        <p className="text-xs text-neutral-500">Powered by React, Tailwind CSS, and awesome open-source libraries.</p>
      </footer>
    </div>
  );
};

export default App;
