export enum ConversionMode {
  MARKDOWN_TO_WORD = 'md-to-word',
  WORD_TO_MARKDOWN = 'word-to-md',
}

// Type definitions for global libraries loaded via CDN
declare global {
  interface Window {
    mammoth: {
      convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: Array<{ type: string; message: string }> }>;
    };
    TurndownService: new (options?: {
      headingStyle?: 'setext' | 'atx';
      hr?: string;
      bulletListMarker?: '*' | '-' | '+';
      codeBlockStyle?: 'fenced' | 'indented';
      emDelimiter?: '_' | '*';
    }) => {
      turndown: (html: string) => string;
    };
    saveAs: (blob: Blob, filename: string) => void;
    htmlDocx: {
      asBlob: (html: string, options?: { orientation?: 'portrait' | 'landscape'; margins?: object }) => Blob;
    };
    marked: {
      parse: (markdownString: string, options?: { gfm?: boolean; breaks?: boolean; sanitize?: boolean }) => string;
    };
    JSZip: new () => {
      file: (name: string, data: Blob | string) => void;
      generateAsync: (options: { type: 'blob' | 'arraybuffer' | 'uint8array' | 'binarystring' | 'base64' }) => Promise<Blob>;
    }; 
    DOMPurify: {
      sanitize: (html: string, options?: { 
        USE_PROFILES?: { html?: boolean }; 
        ALLOWED_TAGS?: string[];
        ALLOWED_ATTR?: string[];
        FORBID_TAGS?: string[];
        FORBID_ATTR?: string[];
      }) => string;
    };
  }
}

// File size limits for security
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_BATCH_FILES = 20;

// Validation helpers
export const validateFileSize = (file: File): boolean => file.size <= MAX_FILE_SIZE;
export const validateFileType = (file: File, allowedExtensions: string[]): boolean => 
  allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));
