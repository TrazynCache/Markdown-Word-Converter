import React, { useState, useCallback, Fragment, useMemo, useEffect } from 'react';
import { TextAreaInput } from './TextAreaInput';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { IconDownload, IconTrash, IconDocumentText, IconFileCheck, IconXCircle, IconSparkles } from './Icons'; 
import { FileInput } from './FileInput';
import { formatFileSize, validateFileExtensions, createFileId, downloadBlob, STORAGE_KEYS, FILE_TYPES } from '../utils';

interface BatchFileStatus {
  id: string;
  fileName: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  data?: Blob;
  error?: string;
}

const DEFAULTS = {
  FONT_FAMILY: 'Arial',
  FONT_SIZE: '11pt',
  BOLD_HEADERS: false,
  ITALIC_HEADERS: false,
} as const;

export const MarkdownToWordConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  // Batch processing
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchFileDetails, setBatchFileDetails] = useState<BatchFileStatus[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const batchFileInputRef = React.useRef<HTMLInputElement>(null);

  // Word formatting options with localStorage
  const [selectedFont, setSelectedFont] = useState<string>(() => 
    localStorage.getItem(STORAGE_KEYS.MD_TO_WORD.FONT_FAMILY) || DEFAULTS.FONT_FAMILY);
  const [bodyFontSize, setBodyFontSize] = useState<string>(() => 
    localStorage.getItem(STORAGE_KEYS.MD_TO_WORD.FONT_SIZE) || DEFAULTS.FONT_SIZE);
  const [boldHeaders, setBoldHeaders] = useState<boolean>(() => 
    localStorage.getItem(STORAGE_KEYS.MD_TO_WORD.BOLD_HEADERS) === 'true');
  const [italicHeaders, setItalicHeaders] = useState<boolean>(() => 
    localStorage.getItem(STORAGE_KEYS.MD_TO_WORD.ITALIC_HEADERS) === 'true');

  // Persist formatting options
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MD_TO_WORD.FONT_FAMILY, selectedFont), [selectedFont]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MD_TO_WORD.FONT_SIZE, bodyFontSize), [bodyFontSize]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MD_TO_WORD.BOLD_HEADERS, String(boldHeaders)), [boldHeaders]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MD_TO_WORD.ITALIC_HEADERS, String(italicHeaders)), [italicHeaders]);

  const resetFormattingOptions = useCallback(() => {
    if (window.confirm("Reset formatting options to defaults?")) {
      setSelectedFont(DEFAULTS.FONT_FAMILY);
      setBodyFontSize(DEFAULTS.FONT_SIZE);
      setBoldHeaders(DEFAULTS.BOLD_HEADERS);
      setItalicHeaders(DEFAULTS.ITALIC_HEADERS);
      Object.values(STORAGE_KEYS.MD_TO_WORD).forEach(key => localStorage.removeItem(key));
    }
  }, []);

  const fontOptions = useMemo(() => ([
    'Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia', 'Verdana'
  ]), []);

  const convertMarkdownToWord = useCallback(async (markdownText: string): Promise<Blob> => {
    // Pre-process markdown to prevent dash conversion issues
    // Replace em dashes and en dashes back to regular dashes to prevent encoding issues
    let processedMarkdown = markdownText;
    
    const html = window.marked.parse(processedMarkdown, {
      gfm: true,
      breaks: false
    });
    
    // Post-process HTML to fix any dash encoding issues
    let processedHTML = html
      .replace(/—/g, '-')  // Replace em dashes with regular dashes
      .replace(/–/g, '-')  // Replace en dashes with regular dashes
      .replace(/â€"/g, '-'); // Fix the specific encoding issue mentioned
    
    const purifiedHTML = window.DOMPurify.sanitize(processedHTML);
    
    const styledHTML = `
      <html>
        <head>
          <style>
            body { font-family: ${selectedFont}; font-size: ${bodyFontSize}; }
            h1, h2, h3, h4, h5, h6 { 
              ${boldHeaders ? 'font-weight: bold;' : ''} 
              ${italicHeaders ? 'font-style: italic;' : ''} 
            }
          </style>
        </head>
        <body>${purifiedHTML}</body>
      </html>
    `;
    
    return window.htmlDocx.asBlob(styledHTML);
  }, [selectedFont, bodyFontSize, boldHeaders, italicHeaders]);

  const handleConvertAndDownload = useCallback(async () => {
    if (!markdown.trim()) {
      setError('Please enter some Markdown content.');
      return;
    }
    
    setIsConverting(true);
    setError(null);
    
    try {
      const blob = await convertMarkdownToWord(markdown);
      downloadBlob(blob, 'converted-document.docx');
    } catch (e: any) {
      setError(`Conversion failed: ${e.message || 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  }, [markdown, convertMarkdownToWord]);

  const handleBatchFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter(file => validateFileExtensions(file, [...FILE_TYPES.MARKDOWN]));
    const invalidFiles = files.filter(file => !validateFileExtensions(file, [...FILE_TYPES.MARKDOWN]));

    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}. Only .md files allowed.`);
    } else {
      setError(null);
    }
    
    setBatchFiles(validFiles);
    setBatchFileDetails(validFiles.map(file => ({
      id: createFileId(file.name),
      fileName: file.name,
      status: 'pending',
    })));
  }, []);

  const processBatchFiles = useCallback(async () => {
    if (batchFiles.length === 0) return;
    
    setIsBatchProcessing(true);
    setError(null);

    const results: BatchFileStatus[] = [];
    
    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      const id = createFileId(file.name);
      
      setBatchFileDetails(prev => prev.map(fd => 
        fd.fileName === file.name ? { ...fd, status: 'converting' } : fd));

      try {
        const text = await file.text();
        const blob = await convertMarkdownToWord(text);
        results.push({ id, fileName: file.name, status: 'success', data: blob });
      } catch (e: any) {
        results.push({ id, fileName: file.name, status: 'error', error: e.message });
      }
      
      setBatchFileDetails(prev => prev.map(fd => {
        const result = results.find(r => r.fileName === fd.fileName);
        return result ? { ...fd, ...result } : fd;
      }));
    }

    setIsBatchProcessing(false);

    // Download results
    const successful = results.filter(r => r.status === 'success' && r.data);
    if (successful.length === 1) {
      downloadBlob(successful[0].data!, successful[0].fileName.replace('.md', '.docx'));
    } else if (successful.length > 1) {
      const zip = new window.JSZip();
      successful.forEach(result => {
        if (result.data) {
          zip.file(result.fileName.replace('.md', '.docx'), result.data);
        }
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'batch_converted_documents.zip');
    }
  }, [batchFiles, convertMarkdownToWord]);

  const handleClear = useCallback(() => {
    const hasContent = markdown.trim() || batchFiles.length > 0;
    if (hasContent && !window.confirm("Clear all content?")) return;
    
    setMarkdown('');
    setError(null);
    setBatchFiles([]);
    setBatchFileDetails([]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  }, [markdown, batchFiles.length]);

  const toggleBatchMode = useCallback(() => {
    setIsBatchMode(prev => !prev);
    setError(null);
    setMarkdown('');
    setBatchFiles([]);
    setBatchFileDetails([]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={toggleBatchMode} 
          variant="secondary" 
          className="text-xs py-1.5 px-3"
        >
          {isBatchMode ? 'Single File Mode' : 'Batch Processing'}
        </Button>
      </div>

      {/* Formatting Options */}
      <div className="p-4 border border-emerald-700 rounded-lg bg-neutral-800/60 space-y-4">
        <h3 className="text-md font-semibold text-emerald-400 mb-3 border-b border-neutral-700 pb-2">
          Word Document Formatting Options
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Font Family</label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-neutral-400" style={{ fontFamily: selectedFont }}>
              Aa Bb Cc - Sample Text 123
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Body Font Size</label>
            <input
              type="text"
              value={bodyFontSize}
              onChange={(e) => setBodyFontSize(e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., 12pt"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400">Header Styling</p>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={boldHeaders}
                onChange={(e) => setBoldHeaders(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border border-neutral-500 rounded ${boldHeaders ? 'bg-emerald-600' : 'bg-neutral-700'} flex items-center justify-center mr-2`}>
                {boldHeaders && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-xs text-neutral-300">Bold Headers</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={italicHeaders}
                onChange={(e) => setItalicHeaders(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border border-neutral-500 rounded ${italicHeaders ? 'bg-emerald-600' : 'bg-neutral-700'} flex items-center justify-center mr-2`}>
                {italicHeaders && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-xs text-neutral-300">Italicize Headers</span>
            </label>
          </div>
        </div>

        <Button
          onClick={resetFormattingOptions}
          variant="secondary"
          className="text-xs py-1.5 px-3"
        >
          Reset Formatting to Defaults
        </Button>
      </div>

      {!isBatchMode ? (
        <Fragment>
          <div>
            <label htmlFor="markdown-input" className="block text-sm font-medium text-neutral-400 mb-1">
              Enter Markdown
            </label>
            <TextAreaInput
              id="markdown-input"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste your Markdown here... e.g., # Hello World"
              rows={10}
            />
            <div className="flex justify-end text-xs text-neutral-400 mt-1">
              <span>Characters: {markdown.length}</span>
              <span className="ml-4">Words: {markdown.trim() ? markdown.trim().split(/\s+/).length : 0}</span>
            </div>
          </div>
        </Fragment>
      ) : (
        <div className="space-y-4">
          <FileInput
            id="batch-markdown-input"
            label="Upload .md Files for Batch Processing"
            accept=".md"
            multiple
            onChange={handleBatchFileChange}
            inputRef={batchFileInputRef}
            fileName={batchFiles.length > 0 ? `${batchFiles.length} file(s) selected` : null}
            placeholder="Choose .md file(s) or drag and drop... (Max: 50MB per file, 20 files)"
          />
          
          {batchFiles.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto p-2 bg-neutral-800/60 rounded-md border border-emerald-700">
              <p className="text-xs text-neutral-400 mb-1">Selected files:</p>
              {batchFiles.map(file => (
                <div key={createFileId(file.name)} className="text-xs text-neutral-300 bg-neutral-700/50 p-1.5 rounded flex justify-between items-center">
                  <span className="truncate flex items-center">
                    <IconDocumentText className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400 shrink-0" />
                    {file.name}
                  </span>
                  <span className="text-neutral-400 ml-2 shrink-0">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 bg-red-900/50 border border-red-700 p-3 rounded-md text-sm">
          {error}
        </p>
      )}

      {isBatchMode && batchFileDetails.length > 0 && (
        <div className="mt-4 p-3 border border-emerald-700 rounded-lg bg-neutral-800/60 space-y-2 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">Batch Processing Results:</h4>
          {batchFileDetails.map(detail => (
            <div key={detail.id} className={`text-xs p-2 rounded flex justify-between items-center ${
              detail.status === 'success' ? 'bg-green-800/60' : 
              detail.status === 'error' ? 'bg-red-800/60' : 'bg-neutral-700/60'
            }`}>
              <div className="truncate w-3/4">
                <span className="text-neutral-200">{detail.fileName}</span>
                {detail.status === 'error' && detail.error && (
                  <span className="block text-red-400 text-[0.7rem] italic truncate">{detail.error}</span>
                )}
              </div>
              {detail.status === 'success' && <IconFileCheck className="w-4 h-4 text-green-400" />}
              {detail.status === 'error' && <IconXCircle className="w-4 h-4 text-red-400" />}
              {detail.status === 'converting' && <LoadingSpinner className="w-4 h-4" />}
              {detail.status === 'pending' && <span className="text-neutral-400 text-xs">Pending</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
        <Button 
          onClick={handleClear} 
          variant="secondary"
          className="w-full sm:w-auto basis-1/3"
          disabled={isConverting || isBatchProcessing}
        >
          <IconTrash className="w-5 h-5 mr-2" />
          Clear
        </Button>
        
        {isBatchMode ? (
          <Button
            onClick={processBatchFiles}
            disabled={isBatchProcessing || batchFiles.length === 0}
            className="w-full sm:w-auto basis-2/3"
          >
            {isBatchProcessing ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <IconSparkles className="w-5 h-5 mr-2" />}
            {isBatchProcessing ? 'Processing...' : 'Convert Batch & Download'}
          </Button>
        ) : (
          <Button
            onClick={handleConvertAndDownload}
            disabled={!markdown.trim() || isConverting}
            className="w-full sm:w-auto basis-2/3"
          >
            {isConverting ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <IconDownload className="w-5 h-5 mr-2" />}
            {isConverting ? 'Converting...' : 'Convert to Word & Download'}
          </Button>
        )}
      </div>
    </div>
  );
};
