import React, { useState, useRef, useEffect } from 'react';
import type { FileUploadProps, UploadState } from '../types';

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedTypes = [],
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 1,
  disabled = false,
}) => {
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    uploadedFile: null,
    error: null,
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    setState((prev) => ({ ...prev, isUploading: true, error: null, uploadProgress: 0 }));

    // Simulate progress
    const progressInterval = setInterval(() => {
      setState((prev) => {
        if (prev.uploadProgress >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, uploadProgress: prev.uploadProgress + 10 };
      });
    }, 200);

    try {
      const result = await onUpload(state.selectedFile);
      clearInterval(progressInterval);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        uploadedFile: result,
      }));
    } catch (err) {
      clearInterval(progressInterval);
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
    <div style={{
      backgroundColor: '#1a1d2e',
      padding: isMobile ? '1.25rem' : '2rem',
      borderRadius: isMobile ? '12px' : '16px',
      width: '100%',
      maxWidth: isMobile ? '100%' : '600px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={maxFiles > 1}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || state.isUploading}
      />

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickSelect}
        style={{
          border: isMobile ? '2px dashed #8b5cf6' : '3px dashed #8b5cf6',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '3rem 1.5rem' : '3rem 2rem',
          textAlign: 'center',
          cursor: disabled || state.isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: '#ffffff',
          transition: 'all 0.3s ease',
          opacity: disabled || state.isUploading ? 0.6 : 1,
          marginBottom: state.selectedFile && !state.error ? '1.5rem' : '0',
        }}
      >
        {/* Upload Icon */}
        <div style={{
          width: isMobile ? '70px' : '80px',
          height: isMobile ? '70px' : '80px',
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: isMobile ? '0 auto 1.25rem' : '0 auto 1.5rem',
        }}>
          <svg
            width={isMobile ? "36" : "40"}
            height={isMobile ? "36" : "40"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Text */}
        <p style={{
          fontSize: isMobile ? '1.125rem' : '1.25rem',
          fontWeight: '600',
          color: '#8b5cf6',
          margin: 0,
          letterSpacing: '0.5px'
        }}>
          Upload File
        </p>
      </div>

      {/* Error message */}
      {state.error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          color: '#dc2626',
          fontSize: '0.95rem'
        }}>
          {state.error}
        </div>
      )}

      {/* Selected file info */}
      {state.selectedFile && !state.error && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '10px' : '12px',
          padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          marginBottom: '1rem',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.75rem' : '1rem',
        }}>
          {/* Document Icon */}
          <div style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg
              width={isMobile ? "20" : "24"}
              height={isMobile ? "20" : "24"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          {/* File Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontWeight: '600',
              color: '#1f2937',
              fontSize: isMobile ? '0.875rem' : '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {state.selectedFile.name}
            </p>
            {state.isUploading && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  width: '100%',
                  height: isMobile ? '4px' : '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#8b5cf6',
                    width: `${state.uploadProgress}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Progress percentage */}
          {state.isUploading && (
            <div style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: '600',
              color: '#8b5cf6',
              minWidth: isMobile ? '35px' : '45px',
              textAlign: 'right',
            }}>
              {state.uploadProgress}%
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {state.selectedFile && !state.error && !state.uploadedFile && (
        <button
          onClick={handleUpload}
          disabled={state.isUploading}
          style={{
            width: '100%',
            padding: isMobile ? '0.875rem' : '1rem',
            backgroundColor: state.isUploading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '600',
            cursor: state.isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
          }}
          onMouseOver={(e) => !state.isUploading && (e.currentTarget.style.backgroundColor = '#7c3aed')}
          onMouseOut={(e) => !state.isUploading && (e.currentTarget.style.backgroundColor = '#8b5cf6')}
        >
          {state.isUploading ? 'Uploading...' : 'Upload'}
        </button>
      )}

      {/* Upload Success */}
      {state.uploadedFile && (
        <div style={{
          backgroundColor: '#d1fae5',
          borderRadius: isMobile ? '10px' : '12px',
          padding: isMobile ? '1.25rem' : '1.5rem',
          textAlign: 'center',
          marginTop: '1.5rem',
        }}>
          <div style={{
            width: isMobile ? '50px' : '60px',
            height: isMobile ? '50px' : '60px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg
              width={isMobile ? "24" : "30"}
              height={isMobile ? "24" : "30"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{
            margin: '0 0 1rem 0',
            fontWeight: '600',
            color: '#065f46',
            fontSize: isMobile ? '1rem' : '1.1rem'
          }}>
            Upload Successful!
          </p>
          <a
            href={state.uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#8b5cf6',
              textDecoration: 'none',
              fontSize: isMobile ? '0.875rem' : '0.95rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            View uploaded file →
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;