
import React, { useState, useCallback } from 'react';
import { IconUpload, IconFileCheck, IconXCircle, IconCloudArrowUp } from './Icons'; // Added IconCloudArrowUp

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  fileName?: string | null;
  placeholder?: string; 
  title?: string; 
}

const FileInputComponent: React.FC<FileInputProps> = ({ 
  label, 
  id, 
  inputRef, 
  fileName, 
  className = '', 
  onChange, 
  placeholder = 'Choose a file or drag and drop...', 
  title, 
  multiple,
  ...props 
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const baseStyles = "relative block w-full text-sm border rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-emerald-500 focus-within:border-emerald-500";
  const defaultStyles = "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-emerald-600";
  const draggingStyles = "border-emerald-500 border-dashed bg-neutral-700/50 shadow-lg";

  const handleLabelClick = useCallback(() => {
    inputRef?.current?.click();
  }, [inputRef]);
  
  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (inputRef?.current) {
      inputRef.current.value = ""; 
      if (onChange) {
         onChange({ target: inputRef.current } as React.ChangeEvent<HTMLInputElement>);
      } else {
         const event = new Event('change', { bubbles: true });
         inputRef.current.dispatchEvent(event);
      }
    }
  }, [inputRef, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && inputRef?.current && onChange) {
      // Create a new FileList if needed or assign directly if supported
      // For controlled components, it's best to pass the FileList to the onChange handler
      inputRef.current.files = files; // This ensures the input element itself has the files
      onChange({ target: inputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [inputRef, onChange]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-400 mb-1">
        {label}
      </label>
      <div
        onClick={handleLabelClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${baseStyles} ${isDraggingOver ? draggingStyles : defaultStyles} ${className} transition-all duration-150 ease-in-out`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef?.current?.click(); }}
        role="button"
        aria-labelledby={id + "-label"}
        title={title || label} 
      >
        <span id={id + "-label"} className="sr-only">{fileName ? `Selected file: ${fileName}` : label }</span>
        <div className="flex items-center px-4 py-3 min-h-[50px]"> {/* Ensure minimum height */}
          {isDraggingOver ? (
            <IconCloudArrowUp className="w-8 h-8 text-emerald-400 mr-3 shrink-0 animate-pulse" />
          ) : fileName ? (
            <IconFileCheck className="w-6 h-6 text-green-400 mr-3 shrink-0" />
          ) : (
            <IconUpload className="w-6 h-6 text-emerald-500 mr-3 shrink-0" />
          )}
          <span className={`truncate flex-grow ${isDraggingOver ? 'text-emerald-300 font-semibold' : fileName ? 'text-neutral-200' : 'text-neutral-400'}`}>
            {isDraggingOver ? (multiple ? 'Drop files here' : 'Drop file here') : (fileName || placeholder)}
          </span>
          {fileName && !isDraggingOver && (
            <button 
              type="button" 
              onClick={handleReset} 
              className="ml-2 p-1 rounded-full hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Clear selected file"
              title="Clear selected file" 
            >
              <IconXCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        <input
          id={id}
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={onChange}
          multiple={multiple}
          {...props}
        />
      </div>
    </div>
  );
};

export const FileInput = React.memo(FileInputComponent);
