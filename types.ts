export enum ConversionMode {
  MARKDOWN_TO_WORD = 'md-to-word',
  WORD_TO_MARKDOWN = 'word-to-md',
}

// Ensure mammoth, TurndownService, saveAs, htmlDocx, marked, JSZip, and DOMPurify are available globally
// These are typically added via <script> tags in index.html
declare global {
  interface Window {
    mammoth: any;
    TurndownService: any;
    saveAs: (blob: Blob, filename: string) => void;
    htmlDocx: {
      asBlob: (html: string, options?: any) => Blob;
    };
    marked: {
      parse: (markdownString: string, options?: any) => string;
    };
    JSZip: any; 
    DOMPurify: {
      sanitize: (html: string, options?: object) => string;
    };
  }
}