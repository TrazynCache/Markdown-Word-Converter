
import React, { useState, useCallback, Fragment, useMemo, useEffect } from 'react';
import { TextAreaInput } from './TextAreaInput';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { IconDownload, IconTrash, IconDocumentText, IconFileCheck, IconXCircle, IconSparkles } from './Icons'; 
import { FileInput } from './FileInput'; 

interface BatchFileStatus {
  id: string; // Unique ID for key prop, can be file name + timestamp
  fileName: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  data?: Blob;
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const LS_PREFIX = 'docuMorph_mdToWord_';
const LS_FONT_FAMILY = LS_PREFIX + 'fontFamily';
const LS_FONT_SIZE = LS_PREFIX + 'fontSize';
const LS_BOLD_HEADERS = LS_PREFIX + 'boldHeaders';
const LS_ITALIC_HEADERS = LS_PREFIX + 'italicHeaders';

const DEFAULT_FONT_FAMILY = 'Arial';
const DEFAULT_FONT_SIZE = '11pt';
const DEFAULT_BOLD_HEADERS = false;
const DEFAULT_ITALIC_HEADERS = false;

const SAMPLE_MARKDOWN = `# Sample Markdown Document

This is a sample Markdown document to demonstrate various features.

## Text Formatting

You can have **bold text**, _italic text_, and even ***bold italic text***.
Strikethrough is also possible: ~~this is strikethrough~~.

## Headings

### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Lists

**Unordered List:**
* Item 1
* Item 2
  * Sub-item 2.1
  * Sub-item 2.2
* Item 3

**Ordered List:**
1. First item
2. Second item
3. Third item

## Links

Here's a link to [Google](https://www.google.com).

## Images (Note: Images are not embedded in .docx by this tool)

![Alt text for an image](https://via.placeholder.com/150 "Optional title")

## Code

Inline \`code\` is wrapped in backticks.

For code blocks:
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Horizontal Rule

---

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1.1 | Cell 1.2 | Cell 1.3 |
| Cell 2.1 | Cell 2.2 | Cell 2.3 |
| Cell 3.1 | Cell 3.2 | Cell 3.3 |

Enjoy using DocuMorph!
`;


export const MarkdownToWordConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFont, setSelectedFont] = useState<string>(() => localStorage.getItem(LS_FONT_FAMILY) || DEFAULT_FONT_FAMILY);
  const [bodyFontSize, setBodyFontSize] = useState<string>(() => localStorage.getItem(LS_FONT_SIZE) || DEFAULT_FONT_SIZE);
  const [boldHeaders, setBoldHeaders] = useState<boolean>(() => localStorage.getItem(LS_BOLD_HEADERS) === 'true' || DEFAULT_BOLD_HEADERS);
  const [italicHeaders, setItalicHeaders] = useState<boolean>(() => localStorage.getItem(LS_ITALIC_HEADERS) === 'true' || DEFAULT_ITALIC_HEADERS);

  const availableFonts: string[] = ['Arial', 'Times New Roman', 'Calibri', 'Verdana', 'Georgia', 'Helvetica', 'Courier New', 'Tahoma', 'Garamond', 'Palatino Linotype'];

  // Batch processing state
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchFileDetails, setBatchFileDetails] = useState<BatchFileStatus[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const batchFileInputRef = React.useRef<HTMLInputElement>(null);

  const charCount = useMemo(() => markdown.length, [markdown]);
  const wordCount = useMemo(() => markdown.trim() ? markdown.trim().split(/\s+/).length : 0, [markdown]);

  useEffect(() => {
    localStorage.setItem(LS_FONT_FAMILY, selectedFont);
  }, [selectedFont]);

  useEffect(() => {
    localStorage.setItem(LS_FONT_SIZE, bodyFontSize);
  }, [bodyFontSize]);

  useEffect(() => {
    localStorage.setItem(LS_BOLD_HEADERS, String(boldHeaders));
  }, [boldHeaders]);

  useEffect(() => {
    localStorage.setItem(LS_ITALIC_HEADERS, String(italicHeaders));
  }, [italicHeaders]);

  const handleResetFormatting = useCallback(() => {
    if (window.confirm("Are you sure you want to reset formatting options to their defaults? This will clear any saved preferences.")) {
      localStorage.removeItem(LS_FONT_FAMILY);
      localStorage.removeItem(LS_FONT_SIZE);
      localStorage.removeItem(LS_BOLD_HEADERS);
      localStorage.removeItem(LS_ITALIC_HEADERS);

      setSelectedFont(DEFAULT_FONT_FAMILY);
      setBodyFontSize(DEFAULT_FONT_SIZE);
      setBoldHeaders(DEFAULT_BOLD_HEADERS);
      setItalicHeaders(DEFAULT_ITALIC_HEADERS);
    }
  }, []);

  const generateStyles = useCallback(() => {
    return `
      <style>
        body {
          font-family: '${selectedFont.replace(/'/g, "\\'")}';
          font-size: ${bodyFontSize || '11pt'};
          line-height: 1.6;
          color: #333333; 
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: ${boldHeaders ? 'bold' : 'normal'};
          font-style: ${italicHeaders ? 'italic' : 'normal'};
          color: #1a1a1a; 
          margin-top: 1.2em; 
          margin-bottom: 0.6em;
        }
        p { margin-bottom: 0.8em; }
        ul, ol { margin-bottom: 0.8em; padding-left: 40px; }
        li { margin-bottom: 0.3em; }
        a { color: #0066cc; text-decoration: underline; } 
        pre { 
          font-family: 'Courier New', Courier, monospace;
          background-color: #f0f0f0; 
          padding: 1em; 
          overflow-x: auto; 
          border: 1px solid #e0e0e0; 
          border-radius: 4px; 
          font-size: 0.9em; 
          white-space: pre-wrap; /* Wrap long lines in code blocks */
          word-wrap: break-word; /* Ensure words break to wrap */
        }
        code { /* For inline code */
          font-family: 'Courier New', Courier, monospace;
          background-color: #f0f0f0; 
          padding: 0.2em 0.4em;
          border-radius: 4px; 
          font-size: 0.95em;
        }
        blockquote { border-left: 4px solid #cccccc; padding-left: 1em; margin-left: 0; font-style: italic; color: #555555; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    `;
  }, [selectedFont, bodyFontSize, boldHeaders, italicHeaders]);

  const handleConvert = useCallback(async () => {
    if (!markdown.trim()) {
      setError('Markdown input cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const rawHtmlContent = window.marked.parse(markdown, { gfm: true, breaks: true });
      // Ensure DOMPurify is configured to allow style tags if they are part of the generated HTML,
      // but here styles are added separately to the fullHtml.
      // For user-inputted markdown, ensure style tags within markdown are handled appropriately.
      // By default, DOMPurify might strip them.
      const sanitizedHtmlContent = window.DOMPurify.sanitize(rawHtmlContent, {USE_PROFILES: {html: true}});
      const styles = generateStyles();
      const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Document</title>${styles}</head><body>${sanitizedHtmlContent}</body></html>`;
      const docxBlob = window.htmlDocx.asBlob(fullHtml);
      window.saveAs(docxBlob, 'converted_document.docx');
    } catch (e: any) {
      console.error('Conversion error:', e);
      setError(`Failed to convert: ${e.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [markdown, generateStyles]);

  const handleClear = useCallback(() => {
    const isSingleModeContent = !isBatchMode && markdown.trim() !== '';
    const isBatchModeContent = isBatchMode && batchFiles.length > 0;

    if (isSingleModeContent || isBatchModeContent) {
      if (!window.confirm("Are you sure you want to clear all inputs and reset selections? This action cannot be undone.")) {
        return;
      }
    }
    setMarkdown('');
    setError(null);
    setBatchFiles([]);
    setBatchFileDetails([]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  }, [isBatchMode, markdown, batchFiles.length]);

  const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter(file => file.name.endsWith('.md'));
    const invalidFiles = files.filter(file => !file.name.endsWith('.md'));

    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only .md files are allowed.`);
    } else {
      setError(null);
    }
    
    setBatchFiles(validFiles); 
    setBatchFileDetails(validFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      fileName: file.name,
      status: 'pending',
    })));
  };

  const processSingleMdFile = useCallback(async (file: File): Promise<Omit<BatchFileStatus, 'id'>> => {
    try {
      const fileContent = await file.text();
      if (!fileContent.trim()) {
        return { fileName: file.name, status: 'error', error: 'File is empty' };
      }
      const rawHtmlContent = window.marked.parse(fileContent, { gfm: true, breaks: true });
      const sanitizedHtmlContent = window.DOMPurify.sanitize(rawHtmlContent, {USE_PROFILES: {html: true}});
      const styles = generateStyles();
      const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Document</title>${styles}</head><body>${sanitizedHtmlContent}</body></html>`;
      const docxBlob = window.htmlDocx.asBlob(fullHtml);
      return { fileName: file.name, status: 'success', data: docxBlob };
    } catch (e: any) {
      console.error(`Error converting ${file.name}:`, e);
      return { fileName: file.name, status: 'error', error: e.message || 'Conversion failed' };
    }
  }, [generateStyles]);

  const handleProcessBatchMdToWord = useCallback(async () => {
    if (batchFiles.length === 0) {
      setError('No .md files selected for batch processing.');
      return;
    }
    setIsBatchProcessing(true);
    setError(null);

    const initialDetails = batchFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      fileName: file.name,
      status: 'converting' as 'converting',
    }));
    setBatchFileDetails(initialDetails);

    const results: BatchFileStatus[] = [];
    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      const result = await processSingleMdFile(file); 
      const newDetail = { ...initialDetails[i], ...result };
      results.push(newDetail);
      setBatchFileDetails(prev => prev.map(fd => fd.id === newDetail.id ? newDetail : fd));
    }
    
    setIsBatchProcessing(false);

    const successfulConversions = results.filter(r => r.status === 'success' && r.data);
    if (successfulConversions.length > 0) {
      if (successfulConversions.length === 1 && successfulConversions[0].data) {
        window.saveAs(successfulConversions[0].data, successfulConversions[0].fileName.replace('.md', '.docx'));
      } else {
        const zip = new window.JSZip();
        successfulConversions.forEach(res => {
          if (res.data) {
            zip.file(res.fileName.replace('.md', '.docx'), res.data);
          }
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
          window.saveAs(content, 'batch_converted_word_documents.zip');
        });
      }
    } else if (results.every(r => r.status === 'error')) {
        setError("All files in the batch failed to convert.");
    }
  }, [batchFiles, processSingleMdFile]);
  
  const toggleBatchMode = useCallback(() => {
    setIsBatchMode(prevIsBatchMode => !prevIsBatchMode);
    setError(null); 
    setMarkdown(''); 
    setBatchFiles([]); 
    setBatchFileDetails([]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  }, []);

  const handleLoadSampleMarkdown = useCallback(() => {
    if (markdown.trim() !== '' && !window.confirm("This will replace the current Markdown content. Are you sure?")) {
      return;
    }
    setMarkdown(SAMPLE_MARKDOWN);
    setError(null);
  }, [markdown]);

  const formattingOptionsPanel = (isBatch: boolean) => (
    <div className="p-4 border border-emerald-700 rounded-lg bg-neutral-800/60 space-y-4">
      <h3 className="text-md font-semibold text-emerald-400 mb-3 border-b border-neutral-700 pb-2">
        Word Document Formatting Options {isBatch ? "(for Batch)" : ""}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`font-family-select${isBatch ? '-batch' : ''}`} className="block text-xs font-medium text-neutral-400 mb-1">
            Font Family
          </label>
          <select
            id={`font-family-select${isBatch ? '-batch' : ''}`}
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label={`Select font family${isBatch ? ' for batch' : ''}`}
            title={`Choose the font family for the Word document body${isBatch ? ' (applies to all in batch)' : ''}`}
          >
            {availableFonts.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
          <div 
            className="mt-2 p-2 rounded bg-neutral-700/50 text-neutral-300 text-sm"
            style={{ fontFamily: selectedFont }}
            aria-label="Font preview"
          >
            Aa Bb Cc - Sample Text 123
          </div>
        </div>

        <div>
          <label htmlFor={`body-font-size${isBatch ? '-batch' : ''}`} className="block text-xs font-medium text-neutral-400 mb-1">
            Body Font Size
          </label>
          <input
            type="text"
            id={`body-font-size${isBatch ? '-batch' : ''}`}
            value={bodyFontSize}
            onChange={(e) => setBodyFontSize(e.target.value)}
            placeholder="e.g., 11pt"
            className="block w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-neutral-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-neutral-500"
            aria-label={`Body font size input${isBatch ? ' for batch' : ''}`}
            title={`Set the font size for the Word document body (e.g., 12pt, 10px)${isBatch ? ' (applies to all in batch)' : ''}`}
          />
        </div>
      </div>
      <div>
        <p className="block text-xs font-medium text-neutral-400 mb-2">Header Styling {isBatch ? "(for Batch)" : ""}</p>
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              id={`bold-headers${isBatch ? '-batch' : ''}`}
              name={`bold-headers${isBatch ? '-batch' : ''}`}
              type="checkbox"
              checked={boldHeaders}
              onChange={(e) => setBoldHeaders(e.target.checked)}
              className="h-4 w-4 text-emerald-500 border-neutral-500 rounded bg-neutral-700 focus:ring-emerald-500 focus:ring-offset-neutral-800"
              aria-labelledby={`bold-headers-label${isBatch ? '-batch' : ''}`}
              title={`Make all headings bold in the Word document${isBatch ? ' (applies to all in batch)' : ''}`}
            />
            <label htmlFor={`bold-headers${isBatch ? '-batch' : ''}`} id={`bold-headers-label${isBatch ? '-batch' : ''}`} className="ml-2 block text-sm text-neutral-300">
              Bold Headers
            </label>
          </div>
          <div className="flex items-center">
            <input
              id={`italic-headers${isBatch ? '-batch' : ''}`}
              name={`italic-headers${isBatch ? '-batch' : ''}`}
              type="checkbox"
              checked={italicHeaders}
              onChange={(e) => setItalicHeaders(e.target.checked)}
              className="h-4 w-4 text-emerald-500 border-neutral-500 rounded bg-neutral-700 focus:ring-emerald-500 focus:ring-offset-neutral-800"
              aria-labelledby={`italic-headers-label${isBatch ? '-batch' : ''}`}
              title={`Make all headings italic in the Word document${isBatch ? ' (applies to all in batch)' : ''}`}
            />
            <label htmlFor={`italic-headers${isBatch ? '-batch' : ''}`} id={`italic-headers-label${isBatch ? '-batch' : ''}`} className="ml-2 block text-sm text-neutral-300">
              Italicize Headers
            </label>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <Button
          onClick={handleResetFormatting}
          variant="secondary"
          className="text-xs py-1.5 px-3 border-neutral-600 hover:border-amber-500 text-amber-400 hover:bg-amber-700/20"
          title="Reset all formatting options to their default values and clear saved preferences"
        >
          Reset Formatting to Defaults
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {!isBatchMode && (
          <Button 
            onClick={handleLoadSampleMarkdown} 
            variant="secondary" 
            className="text-xs py-1.5 px-3 border-neutral-600 hover:border-sky-500 text-sky-400 hover:bg-sky-700/20"
            title="Load sample Markdown content into the editor"
          >
            <IconSparkles className="w-4 h-4 mr-1.5" />
            Load Sample
          </Button>
        )}
         <div className={isBatchMode ? "w-full flex justify-end" : ""}> {/* Ensure button is on the right */}
          <Button 
            onClick={toggleBatchMode} 
            variant="secondary" 
            className="text-xs py-1.5 px-3"
            title={isBatchMode ? 'Switch to single file conversion mode' : 'Switch to batch processing mode for multiple files'}
          >
            {isBatchMode ? 'Switch to Single File Mode' : 'Switch to Batch Processing'}
          </Button>
        </div>
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
              aria-label="Markdown Input Area"
            />
             <div className="mt-2 text-xs text-neutral-400 flex justify-end space-x-4">
              <span>Characters: {charCount}</span>
              <span>Words: {wordCount}</span>
            </div>
          </div>
          {formattingOptionsPanel(false)}
        </Fragment>
      ) : (
        // Batch Mode UI
        <div className="space-y-4">
          <FileInput
            id="batch-md-input"
            label="Upload .md Files for Batch Processing"
            accept=".md"
            multiple 
            onChange={handleBatchFileChange}
            inputRef={batchFileInputRef}
            fileName={batchFiles.length > 0 ? `${batchFiles.length} file(s) selected` : null}
            placeholder="Choose .md file(s) or drag and drop..."
            title="Select multiple .md files for batch conversion"
          />
          {batchFiles.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto p-2 bg-neutral-800/60 rounded-md border border-emerald-700">
              <p className="text-xs text-neutral-400 mb-1">Selected files:</p>
              {batchFiles.map(file => (
                <div key={`${file.name}-${file.lastModified}`} className="text-xs text-neutral-300 bg-neutral-700/50 p-1.5 rounded flex justify-between items-center">
                  <span className="truncate flex items-center">
                    <IconDocumentText className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400 shrink-0" />
                    {file.name}
                  </span>
                  <span className="text-neutral-400 ml-2 shrink-0">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          )}
          {formattingOptionsPanel(true)}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-900/40 p-3 rounded-md border border-red-700 flex items-center">
          <IconXCircle className="w-5 h-5 mr-2 shrink-0" />
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
          {batchFileDetails.some(d => d.status === 'error') && (
            <p className="text-xs text-amber-400 mt-2">Some files had errors. Check details above. Successfully converted files (if any) are in the ZIP.</p>
          )}
        </div>
      )}
       {isBatchProcessing && (
        <div className="flex items-center justify-center text-neutral-400 p-4">
          <LoadingSpinner className="w-6 h-6 mr-3" />
          Processing batch... ({batchFileDetails.filter(f=>f.status === 'success' || f.status === 'error').length}/{batchFiles.length})
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
        <Button 
          onClick={handleClear} 
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isLoading || isBatchProcessing || (markdown.trim() === '' && batchFiles.length === 0)}
          aria-label="Clear input and reset options"
          title="Clear all inputs, selections, and formatting options"
        >
          <IconTrash className="w-5 h-5 mr-2" />
          Clear
        </Button>
        {isBatchMode ? (
          <Button 
            onClick={handleProcessBatchMdToWord} 
            disabled={isBatchProcessing || batchFiles.length === 0}
            className="w-full sm:w-auto"
            aria-label="Process batch markdown to word and download zip"
            aria-live="polite"
            title={batchFiles.length === 0 ? "Select .md files to process" : "Convert all selected .md files to Word and download as ZIP"}
          >
            {isBatchProcessing ? (
              <LoadingSpinner className="w-5 h-5 mr-2" />
            ) : (
              <IconDownload className="w-5 h-5 mr-2" />
            )}
            {isBatchProcessing ? 'Processing Batch...' : 'Process Batch & Download ZIP'}
          </Button>
        ) : (
          <Button 
            onClick={handleConvert} 
            disabled={isLoading || !markdown.trim()}
            className="w-full sm:w-auto"
            aria-label="Convert markdown to word and download"
            aria-live="polite"
            title={!markdown.trim() ? "Enter Markdown content to convert" : "Convert current Markdown to Word and download"}
          >
            {isLoading ? (
              <LoadingSpinner className="w-5 h-5 mr-2" />
            ) : (
              <IconDownload className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Converting...' : 'Convert to Word & Download'}
          </Button>
        )}
      </div>
    </div>
  );
};
