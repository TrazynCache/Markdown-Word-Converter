
import React, { useState, useCallback, useRef, Fragment, useEffect } from 'react';
import { FileInput } from './FileInput';
import { TextAreaInput } from './TextAreaInput';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { IconClipboardCopy, IconUpload, IconTrash, IconFileCheck, IconXCircle, IconFileTypeDoc, IconDownload, IconAlertTriangle } from './Icons';

interface BatchFileStatus {
  id: string; // Unique ID for key prop
  fileName: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  data?: string; // Markdown content
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

type HeadingStyle = 'setext' | 'atx';
type BulletListMarker = '*' | '-' | '+';

const LS_PREFIX_WTM = 'docuMorph_wordToMd_';
const LS_HEADING_STYLE = LS_PREFIX_WTM + 'headingStyle';
const LS_BULLET_MARKER = LS_PREFIX_WTM + 'bulletListMarker';

const DEFAULT_HEADING_STYLE: HeadingStyle = 'atx';
const DEFAULT_BULLET_MARKER: BulletListMarker = '*';

export const WordToMarkdownConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(''); // For single file mode
  const [fileName, setFileName] = useState<string | null>(null); // For single file mode
  const [isLoading, setIsLoading] = useState<boolean>(false); // For single file mode
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // For single file mode

  // Batch processing state
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchFileDetails, setBatchFileDetails] = useState<BatchFileStatus[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const batchFileInputRef = React.useRef<HTMLInputElement>(null);

  // Turndown options
  const [headingStyle, setHeadingStyle] = useState<HeadingStyle>(() => (localStorage.getItem(LS_HEADING_STYLE) as HeadingStyle) || DEFAULT_HEADING_STYLE);
  const [bulletListMarker, setBulletListMarker] = useState<BulletListMarker>(() => (localStorage.getItem(LS_BULLET_MARKER) as BulletListMarker) || DEFAULT_BULLET_MARKER);

  useEffect(() => {
    localStorage.setItem(LS_HEADING_STYLE, headingStyle);
  }, [headingStyle]);

  useEffect(() => {
    localStorage.setItem(LS_BULLET_MARKER, bulletListMarker);
  }, [bulletListMarker]);

  const getTurndownOptions = useCallback(() => {
    return {
      headingStyle: headingStyle,
      hr: '---',
      bulletListMarker: bulletListMarker,
      codeBlockStyle: 'fenced' as 'fenced' | 'indented', // Keep as 'fenced' for now, can be expanded
      emDelimiter: '_' as '_' | '*',
    };
  }, [headingStyle, bulletListMarker]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => { // Single file
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      setError(null);
      setMarkdown('');
      return;
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Invalid file type. Please upload a .docx or .doc file. PDF files are not supported.');
      setFileName(null);
      setMarkdown('');
      if(fileInputRef.current) fileInputRef.current.value = ""; 
      return;
    }
    if (file.name.endsWith('.doc')){
       setError('Note: .doc file support is limited. For best results, use .docx files.');
    } else {
      setError(null);
    }
    
    setFileName(file.name);
    setIsLoading(true);
    setMarkdown('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
      const html = result.value; 

      const turndownService = new window.TurndownService(getTurndownOptions());
      const mdOutput = turndownService.turndown(html);
      setMarkdown(mdOutput);
    } catch (e: any) {
      console.error('Conversion error:', e);
      setError(`Failed to convert: ${e.message || 'Unknown error'}`);
      setMarkdown('');
      setFileName(null);
      if(fileInputRef.current) fileInputRef.current.value = ""; 
    } finally {
      setIsLoading(false);
    }
  }, [getTurndownOptions]);

  const handleCopyToClipboard = useCallback(() => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard.');
    });
  }, [markdown]);

  const handleDownloadMarkdown = useCallback(() => {
    if (!markdown || !fileName) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const originalName = fileName.substring(0, fileName.lastIndexOf('.'));
    window.saveAs(blob, `${originalName || 'converted'}.md`);
  }, [markdown, fileName]);

  const handleClear = useCallback(() => {
    const isSingleModeContent = !isBatchMode && (markdown.trim() !== '' || fileName !== null);
    const isBatchModeContent = isBatchMode && batchFiles.length > 0;

    if (isSingleModeContent || isBatchModeContent) {
      if (!window.confirm("Are you sure you want to clear all inputs and reset selections? This action cannot be undone.")) {
        return;
      }
    }
    setMarkdown('');
    setError(null);
    setFileName(null);
    setIsCopied(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setBatchFiles([]);
    setBatchFileDetails([]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  }, [isBatchMode, markdown, fileName, batchFiles.length]);

  const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter(file => file.name.endsWith('.docx') || file.name.endsWith('.doc'));
    const invalidFiles = files.filter(file => !file.name.endsWith('.docx') && !file.name.endsWith('.doc'));

    let currentError: string | null = null;

    if (invalidFiles.length > 0) {
      currentError = `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only .docx or .doc files are allowed. PDFs are not supported.`;
    }
    
    if (validFiles.some(f => f.name.endsWith('.doc'))) {
        const docWarning = 'Note: .doc file support is limited. For best results, use .docx files.';
        currentError = currentError ? `${currentError} ${docWarning}` : docWarning;
    }
    setError(currentError);
    
    setBatchFiles(validFiles); 
    setBatchFileDetails(validFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      fileName: file.name,
      status: 'pending',
    })));
  };

  const processSingleWordFile = useCallback(async (file: File): Promise<Omit<BatchFileStatus, 'id'>> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
      const html = result.value;
      const turndownService = new window.TurndownService(getTurndownOptions());
      const mdOutput = turndownService.turndown(html);
      return { fileName: file.name, status: 'success', data: mdOutput };
    } catch (e: any) {
      console.error(`Error converting ${file.name}:`, e);
      return { fileName: file.name, status: 'error', error: e.message || 'Conversion failed' };
    }
  }, [getTurndownOptions]);

  const handleProcessBatchWordToMd = useCallback(async () => {
    if (batchFiles.length === 0) {
      setError('No .docx or .doc files selected for batch processing.');
      return;
    }
    setIsBatchProcessing(true);
    const currentErrorIsWarning = error && (error.includes("Note:") || error.includes("PDF"));
    if (!currentErrorIsWarning) setError(null);


    const initialDetails = batchFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      fileName: file.name,
      status: 'converting' as 'converting',
    }));
    setBatchFileDetails(initialDetails);

    const results: BatchFileStatus[] = [];
    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      const result = await processSingleWordFile(file); 
      const newDetail: BatchFileStatus = { ...initialDetails[i], ...result };
      results.push(newDetail);
      setBatchFileDetails(prev => prev.map(fd => fd.id === newDetail.id ? newDetail : fd));
    }
    
    setIsBatchProcessing(false);

    const successfulConversions = results.filter(r => r.status === 'success' && r.data !== undefined);
    if (successfulConversions.length > 0) {
      if (successfulConversions.length === 1 && successfulConversions[0].data !== undefined) {
         const blob = new Blob([successfulConversions[0].data], { type: 'text/markdown;charset=utf-8' });
         window.saveAs(blob, successfulConversions[0].fileName.replace(/\.(docx|doc)$/, '.md'));
      } else {
        const zip = new window.JSZip();
        successfulConversions.forEach(res => {
          if (res.data !== undefined) {
            zip.file(res.fileName.replace(/\.(docx|doc)$/, '.md'), res.data);
          }
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
          window.saveAs(content, 'batch_converted_markdown_files.zip');
        });
      }
    } else if (results.every(r => r.status === 'error') && !currentErrorIsWarning) {
        setError("All files in the batch failed to convert.");
    }
  }, [batchFiles, processSingleWordFile, error]);

  const toggleBatchMode = useCallback(() => {
    setIsBatchMode(prevIsBatchMode => !prevIsBatchMode);
    setError(null); 
    setMarkdown(''); 
    setFileName(null);
    setBatchFiles([]); 
    setBatchFileDetails([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  }, []);

  const handleResetTurndownOptions = useCallback(() => {
    if (window.confirm("Are you sure you want to reset Markdown conversion options to their defaults?")) {
      setHeadingStyle(DEFAULT_HEADING_STYLE);
      setBulletListMarker(DEFAULT_BULLET_MARKER);
      localStorage.removeItem(LS_HEADING_STYLE);
      localStorage.removeItem(LS_BULLET_MARKER);
    }
  }, []);

  const turndownOptionsPanel = () => (
    <div className="p-4 border border-emerald-700 rounded-lg bg-neutral-800/60 space-y-4">
      <h3 className="text-md font-semibold text-emerald-400 mb-3 border-b border-neutral-700 pb-2">
        Markdown Output Options
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="heading-style-select" className="block text-xs font-medium text-neutral-400 mb-1">
            Heading Style
          </label>
          <select
            id="heading-style-select"
            value={headingStyle}
            onChange={(e) => setHeadingStyle(e.target.value as HeadingStyle)}
            className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Select Markdown heading style"
          >
            <option value="atx">ATX (e.g. # Heading)</option>
            <option value="setext">Setext (e.g. Heading ===)</option>
          </select>
        </div>
        <div>
          <label htmlFor="bullet-marker-select" className="block text-xs font-medium text-neutral-400 mb-1">
            Bullet List Marker
          </label>
          <select
            id="bullet-marker-select"
            value={bulletListMarker}
            onChange={(e) => setBulletListMarker(e.target.value as BulletListMarker)}
            className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Select Markdown bullet list marker"
          >
            <option value="*">* (Asterisk)</option>
            <option value="-">- (Hyphen)</option>
            <option value="+">+ (Plus)</option>
          </select>
        </div>
      </div>
       <div className="pt-2">
        <Button
          onClick={handleResetTurndownOptions}
          variant="secondary"
          className="text-xs py-1.5 px-3 border-neutral-600 hover:border-amber-500 text-amber-400 hover:bg-amber-700/20"
          title="Reset Markdown conversion options to their default values"
        >
          Reset Output Options
        </Button>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={toggleBatchMode} 
          variant="secondary" 
          className="text-xs py-1.5 px-3"
          title={isBatchMode ? 'Switch to single file conversion mode' : 'Switch to batch processing mode for multiple files'}
        >
          {isBatchMode ? 'Switch to Single File Mode' : 'Switch to Batch Processing'}
        </Button>
      </div>

      <div className="p-3 bg-neutral-800/60 border border-emerald-700 rounded-md text-xs text-neutral-300 space-y-1">
        <p className="flex items-center text-neutral-300"> 
            <IconAlertTriangle className="w-4 h-4 mr-2 text-amber-400 shrink-0" />
            <strong className="text-amber-400">Important Notes for Word to Markdown:</strong>
        </p>
        <ul className="list-disc list-inside pl-6 space-y-0.5 text-neutral-400">
          <li>Only <strong>.docx</strong> and <strong>.doc</strong> files are supported.</li>
          <li><strong>PDF files cannot be processed.</strong></li>
          <li>Embedded images and complex formatting (e.g., tables, columns) may not be perfectly converted or may be omitted.</li>
          <li>For best results with formatting, use well-structured <strong>.docx</strong> files.</li>
        </ul>
      </div>
      
      {!isBatchMode ? turndownOptionsPanel() : null}


      {!isBatchMode ? (
        <Fragment>
          <div>
            <FileInput
              id="word-file-input"
              label="Upload .docx or .doc File"
              accept=".docx,.doc"
              onChange={handleFileChange}
              inputRef={fileInputRef}
              fileName={fileName}
              placeholder="Choose a .docx or .doc file or drag and drop... (Max: 50MB per file)"
              title="Select a .docx or .doc file to convert to Markdown"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center text-neutral-400 p-4">
              <LoadingSpinner className="w-6 h-6 mr-3" />
              Processing your document...
            </div>
          )}
          
          {markdown && !isLoading && (
            <div>
              <label htmlFor="markdown-output" className="block text-sm font-medium text-neutral-400 mb-1">
                Generated Markdown
              </label>
              <TextAreaInput
                id="markdown-output"
                value={markdown}
                readOnly
                rows={12}
                className="bg-neutral-800 border-neutral-700 text-neutral-300 focus:ring-0 focus:border-neutral-600"
                aria-label="Generated Markdown Output"
              />
            </div>
          )}
        </Fragment>
      ) : (
        // Batch Mode UI
        <div className="space-y-4">
           {turndownOptionsPanel()} {/* Show options in batch mode too */}
          <FileInput
            id="batch-word-input"
            label="Upload .docx or .doc Files for Batch Processing"
            accept=".docx,.doc"
            multiple 
            onChange={handleBatchFileChange}
            inputRef={batchFileInputRef}
            fileName={batchFiles.length > 0 ? `${batchFiles.length} file(s) selected` : null}
            placeholder="Choose .docx or .doc file(s) or drag and drop... (Max: 50MB per file, 20 files)"
            title="Select multiple .docx or .doc files for batch conversion"
          />
          {batchFiles.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto p-2 bg-neutral-800/60 rounded-md border border-emerald-700">
              <p className="text-xs text-neutral-400 mb-1">Selected files:</p>
              {batchFiles.map(file => (
                <div key={`${file.name}-${file.lastModified}`} className="text-xs text-neutral-300 bg-neutral-700/50 p-1.5 rounded flex justify-between items-center">
                  <span className="truncate flex items-center">
                    <IconFileTypeDoc className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400 shrink-0" />
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
        <p 
            role="alert" 
            className={`text-sm p-3 rounded-md border flex items-center ${
                error.includes("Note:") || error.includes("PDFs are not supported.") 
                ? 'text-amber-300 bg-amber-900/50 border-amber-700' 
                : 'text-red-400 bg-red-900/50 border-red-700'
            }`}
        >
            {error.includes("Note:") || error.includes("PDFs are not supported.") ? (
                <IconAlertTriangle className="w-5 h-5 mr-2 shrink-0 text-amber-400" />
            ) : (
                <IconXCircle className="w-5 h-5 mr-2 shrink-0" />
            )}
            {error}
        </p>
      )}
      
      {isBatchMode && batchFileDetails.length > 0 && !isBatchProcessing && (
        <div className="mt-4 p-3 border border-emerald-700 rounded-lg bg-neutral-800/60 space-y-2 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">Batch Processing Results:</h4>
          {batchFileDetails.map(detail => (
            <div key={detail.id} className={`text-xs p-2 rounded flex justify-between items-center ${detail.status === 'success' ? 'bg-green-800/60 border-green-700' : detail.status === 'error' ? 'bg-red-800/60 border-red-700' : 'bg-neutral-700/60 border-neutral-600'}`}>
              <div className="truncate w-3/4">
                <span className="text-neutral-200">{detail.fileName}</span>
                {detail.status === 'error' && detail.error && <span className="block text-red-400 text-[0.7rem] italic truncate" title={detail.error}>{detail.error}</span>}
              </div>
              {detail.status === 'success' && <IconFileCheck className="w-4 h-4 text-green-400 shrink-0" title="Conversion successful"/>}
              {detail.status === 'error' && <IconXCircle className="w-4 h-4 text-red-400 shrink-0" title="Conversion failed"/>}
              {detail.status === 'converting' && <LoadingSpinner className="w-4 h-4 shrink-0" />}
              {detail.status === 'pending' && <span className="text-neutral-400 text-xs shrink-0">Pending</span>}
            </div>
          ))}
          {batchFileDetails.some(d => d.status === 'error') && !error?.includes("Note:") && (
            <p className="text-xs text-amber-400 mt-2 flex items-center">
                <IconAlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-400" />
                Some files had errors. Check details above. Successfully converted files (if any) are in the ZIP.
            </p>
          )}
        </div>
      )}
      {isBatchProcessing && (
         <div className="flex items-center justify-center text-neutral-400 p-4">
          <LoadingSpinner className="w-6 h-6 mr-3" />
          Processing batch... ({batchFileDetails.filter(f=>f.status === 'success' || f.status === 'error').length}/{batchFiles.length})
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
         <Button 
            onClick={handleClear} 
            variant="secondary"
            className="w-full sm:w-auto basis-1/3"
            disabled={isLoading || isBatchProcessing || (!markdown && !fileName && batchFiles.length === 0)}
            aria-label="Clear inputs and results"
            title="Clear current file, selection, or batch results"
          >
          <IconTrash className="w-5 h-5 mr-2" />
          Clear
        </Button>
        {isBatchMode ? (
          <Button
            onClick={handleProcessBatchWordToMd}
            disabled={isBatchProcessing || batchFiles.length === 0}
            className="w-full sm:w-auto basis-2/3"
            aria-label="Process batch word to markdown and download zip"
            title={batchFiles.length === 0 ? "Select Word files to process" : "Convert all selected Word files to Markdown and download as ZIP"}
          >
            {isBatchProcessing ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <IconUpload className="w-5 h-5 mr-2" /> }
            {isBatchProcessing ? 'Processing Batch...' : 'Process Batch & Download ZIP'}
          </Button>
        ) : (
          <Fragment>
            <Button
              onClick={handleCopyToClipboard}
              disabled={!markdown || isLoading}
              className="w-full sm:w-auto basis-1/3"
              aria-label="Copy generated markdown to clipboard"
              title={!markdown ? "No Markdown to copy" : "Copy generated Markdown to clipboard"}
            >
              <IconClipboardCopy className="w-5 h-5 mr-2" />
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={handleDownloadMarkdown}
              disabled={!markdown || isLoading || !fileName}
              className="w-full sm:w-auto basis-1/3"
              aria-label="Download generated markdown as .md file"
              title={!markdown || !fileName ? "No Markdown to download" : "Download generated Markdown as a .md file"}
            >
              <IconDownload className="w-5 h-5 mr-2" />
              Download .md
            </Button>
          </Fragment>
        )}
      </div>
    </div>
  );
};
