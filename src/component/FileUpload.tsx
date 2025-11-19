import { useState, DragEvent, ChangeEvent, FC } from 'react';
import type { FileUploadProps, UploadState } from '../types';

const FileUpload: FC<FileUploadProps> = ({
  onUpload,
  acceptedTypes = [],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
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
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize) {
      return `File size exceeds maximum of ${formatFileSize(maxFileSize)}`;
    }

    if (acceptedTypes.length > 0) {
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop();
      const isAccepted = acceptedTypes.some(
        (type) => type === fileType || type === fileExtension || type === '*'
      );
      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFile = async (file: File) => {
    if (disabled) return;

    const error = validateFile(file);
    if (error) {
      setState((prev) => ({ ...prev, error, selectedFile: null }));
      return;
    }

    setState({
      selectedFile: file,
      isUploading: true,
      uploadProgress: 0,
      uploadedFile: null,
      error: null,
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90),
        }));
      }, 100);

      const result = await onUpload(file);

      clearInterval(progressInterval);

      setState({
        selectedFile: file,
        isUploading: false,
        uploadProgress: 100,
        uploadedFile: result,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !state.isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && !state.isUploading && e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setState({
      selectedFile: null,
      isUploading: false,
      uploadProgress: 0,
      uploadedFile: null,
      error: null,
    });
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {!state.uploadedFile && (
        <div
          className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${
            disabled || state.isUploading ? 'disabled' : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !state.isUploading && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled || state.isUploading}
            style={{ display: 'none' }}
          />

          <div className="upload-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="upload-text">
            <p className="upload-title">
              {state.isUploading
                ? 'Uploading...'
                : isDragging
                ? 'Drop file here'
                : 'Drag & drop a file here'}
            </p>
            <p className="upload-subtitle">or click to browse</p>
            <p className="upload-info">
              {maxFileSize && `Maximum file size: ${formatFileSize(maxFileSize)}`}
              {acceptedTypes.length > 0 && ` • Accepted: ${acceptedTypes.join(', ')}`}
            </p>
          </div>
        </div>
      )}

      {state.isUploading && (
        <div className="upload-progress">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${state.uploadProgress}%` }} />
          </div>
          <p className="progress-text">{state.uploadProgress}%</p>
        </div>
      )}

      {state.error && (
        <div className="upload-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
          <button onClick={handleReset} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {state.uploadedFile && (
        <div className="upload-success">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3>Upload Successful!</h3>
          <div className="file-details">
            <p className="file-name">{state.uploadedFile.name}</p>
            <p className="file-size">{formatFileSize(state.uploadedFile.size)}</p>
            <p className="file-url">
              <a href={state.uploadedFile.url} target="_blank" rel="noopener noreferrer">
                View File
              </a>
            </p>
          </div>
          <button onClick={handleReset} className="upload-another-button">
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
