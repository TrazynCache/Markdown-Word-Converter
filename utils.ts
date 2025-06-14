// Shared utilities for MDWord
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileExtensions = (file: File, extensions: string[]): boolean =>
  extensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));

export const createFileId = (fileName: string): string => `${fileName}-${Date.now()}`;

export const downloadBlob = (blob: Blob, filename: string): void => {
  window.saveAs(blob, filename);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Storage keys
export const STORAGE_KEYS = {
  MD_TO_WORD: {
    FONT_FAMILY: 'mdWord_fontFamily',
    FONT_SIZE: 'mdWord_fontSize',
    BOLD_HEADERS: 'mdWord_boldHeaders',
    ITALIC_HEADERS: 'mdWord_italicHeaders',
  },
  WORD_TO_MD: {
    HEADING_STYLE: 'mdWord_headingStyle',
    BULLET_MARKER: 'mdWord_bulletMarker',
  },
} as const;

// File processing constants
export const FILE_LIMITS = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_BATCH: 20,
} as const;

export const FILE_TYPES = {
  MARKDOWN: ['.md'],
  WORD: ['.docx', '.doc'],
} as const;
