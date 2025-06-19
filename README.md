# MDWord - Markdown & Word Converter

MDWord is a web-based application that seamlessly converts between Markdown and Word documents. Built with React and TypeScript, it offers both single file conversion and batch processing capabilities.

![MDWord Screenshot](images/MDWord_IronAdamant_screenshot_cropped.PNG)

## Features

- **Bidirectional Conversion**: Convert Markdown to Word (.docx) and Word to Markdown
- **Batch Processing**: Convert multiple files at once with ZIP download
- **Customizable Formatting**: Choose fonts, sizes, and header styles for Word output
- **Real-time Preview**: Live character and word count for Markdown input
- **Sample Content**: Load sample Markdown to test the converter
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern dark interface with emerald accents

## Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Conversion Libraries**: 
  - `marked` - Markdown parsing
  - `html-docx-js` - HTML to Word conversion
  - `mammoth` - Word to HTML conversion
  - `turndown` - HTML to Markdown conversion
- **File Handling**: FileSaver.js, JSZip
- **Security**: DOMPurify for HTML sanitization

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IronAdamant/Markdown-Word-Converter
   cd markdown-word-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Markdown to Word Conversion

1. Select "Markdown to Word" mode (default)
2. Paste your Markdown content or load sample content
3. Customize formatting options (font, size, header styles)
4. Click "Convert to Word & Download" to get your .docx file

### Word to Markdown Conversion

1. Toggle to "Word to Markdown" mode
2. Upload a .docx file
3. Choose conversion options (preserve formatting, handle images)
4. Download the converted Markdown file

### Batch Processing

1. Switch to "Batch Processing" mode
2. Upload multiple .md files (for Markdown to Word) or .docx files (for Word to Markdown)
3. Configure formatting options
4. Process all files and download as a ZIP archive

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
├── components/           # React components
│   ├── Button.tsx
│   ├── FileInput.tsx
│   ├── Icons.tsx
│   ├── LoadingSpinner.tsx
│   ├── MarkdownToWordConverter.tsx
│   ├── TextAreaInput.tsx
│   ├── ToggleSwitch.tsx
│   └── WordToMarkdownConverter.tsx
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── types.ts             # TypeScript type definitions
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── index.html           # HTML template
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Created by IronAdamant
- Assisted by AI
- Built with modern web technologies and open-source libraries
