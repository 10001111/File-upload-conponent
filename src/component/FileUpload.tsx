import React, { useState, useRef } from 'react';
import type { FileUploadProps, UploadState } from '../types';

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedTypes = [],
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 1,
  disabled = false,
  className = '',
}) => {
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    uploadedFile: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Validation function
  const isValidFileType = (file: File): boolean => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;

    return acceptedTypes.some((type) => {
      if (type === '*') return true;
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
  };

  const validateFile = (file: File): string | null => {
    if (!isValidFileType(file)) {
      return `File type not allowed. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxFileSize) {
      const maxMB = (maxFileSize / 1024 / 1024).toFixed(1);
      return `File is too large. Maximum size: ${maxMB}MB`;
    }

    return null;
  };

  // Handle file selection (from input or drag-drop)
  const handleFileSelected = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setState((prev) => ({ ...prev, error, selectedFile: null }));
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedFile: file,
      error: null,
    }));
  };

  // Click to select file
  const handleClickSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  // Drag-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!state.selectedFile) return;

    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const result = await onUpload(state.selectedFile);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        uploadedFile: result,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage,
      }));
    }
  };

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={maxFiles > 1}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || state.isUploading}
      />

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickSelect}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <p className="text-gray-600">
          Drag and drop your file here, or click to select
        </p>
      </div>

      {/* Error message */}
      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {state.error}
        </div>
      )}

      {/* Selected file info */}
      {state.selectedFile && !state.error && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-medium">{state.selectedFile.name}</p>
          <p className="text-green-600 text-sm">
            {(state.selectedFile.size / 1024 / 1024).toFixed(2)}MB
          </p>
          {!state.uploadedFile && (
            <button
              onClick={handleUpload}
              disabled={state.isUploading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {state.isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          )}
        </div>
      )}

      {/* Uploaded file result */}
      {state.uploadedFile && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 font-medium">Upload successful!</p>
          <a
            href={state.uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;