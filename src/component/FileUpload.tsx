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

  const [isDragging, setIsDragging] = useState(false);

  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL FIX #2: Cleanup interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  // CRITICAL FIX #1: Enhanced validation function to support file extensions like .doc/.docx
  const isValidFileType = (file: File): boolean => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;

    return acceptedTypes.some((type) => {
      if (type === '*') return true;

      // Handle wildcard MIME types (e.g., image/*)
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }

      // Handle file extensions (e.g., .doc, .docx)
      if (type.startsWith('.')) {
        const fileName = file.name.toLowerCase();
        return fileName.endsWith(type.toLowerCase());
      }

      // Handle exact MIME type match
      return file.type === type;
    });
  };

  // MEDIUM FIX #10: Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

  // HIGH FIX #5: Enhanced file selection with proper error handling
  const handleFileSelected = (file: File) => {
    try {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select file';
      setState((prev) => ({ ...prev, error: errorMessage, selectedFile: null }));
    }
  };

  // CRITICAL FIX #3: Click handler with keyboard accessibility
  const handleClickSelect = () => {
    fileInputRef.current?.click();
  };

  // CRITICAL FIX #3: Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClickSelect();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  // HIGH FIX #4: Drag-drop handlers with proper React state management
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    try {
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelected(file);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to handle dropped file';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  };

  // HIGH FIX #8: Reset handler for after successful upload
  const handleReset = () => {
    setState({
      selectedFile: null,
      isUploading: false,
      uploadProgress: 0,
      uploadedFile: null,
      error: null,
    });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CRITICAL FIX #2 & HIGH FIX #5: Handle upload with proper cleanup and error handling
  const handleUpload = async () => {
    if (!state.selectedFile) return;

    setState((prev) => ({ ...prev, isUploading: true, error: null, uploadProgress: 0 }));

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Simulate progress
    progressIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.uploadProgress >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return prev;
        }
        return { ...prev, uploadProgress: prev.uploadProgress + 10 };
      });
    }, 200);

    try {
      const result = await onUpload(state.selectedFile);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        uploadedFile: result,
      }));
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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
    <div
      style={{
        backgroundColor: '#1a1d2e',
        padding: isMobile ? '0.875rem' : isTablet ? '1.25rem' : '2rem',
        borderRadius: isMobile ? '12px' : isTablet ? '14px' : '16px',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'visible',
        wordWrap: 'break-word',
        position: 'relative',
      }}
      role="region"
      aria-label="File upload component"
    >
      {/* CRITICAL FIX #3: Hidden file input with accessibility labels */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={maxFiles > 1}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || state.isUploading}
        aria-label="File input"
        id="file-upload-input"
      />

      {/* CRITICAL FIX #3, HIGH FIX #4, HIGH FIX #7: Drop zone with accessibility and proper state */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickSelect}
        onKeyDown={handleKeyDown}
        tabIndex={disabled || state.isUploading ? -1 : 0}
        role="button"
        aria-label={`Upload file area. ${state.isUploading ? 'Upload in progress' : 'Click or drag and drop to upload'}`}
        aria-disabled={disabled || state.isUploading}
        style={{
          border: `${isMobile ? '2px' : isTablet ? '2.5px' : '3px'} dashed ${isDragging ? '#7c3aed' : '#8b5cf6'}`,
          borderRadius: isMobile ? '12px' : isTablet ? '14px' : '16px',
          padding: isMobile ? '2rem 0.75rem' : isTablet ? '2.5rem 1.25rem' : '3rem 2rem',
          textAlign: 'center' as const,
          cursor: disabled || state.isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? '#f5f3ff' : '#ffffff',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
          opacity: disabled || state.isUploading ? 0.6 : 1,
          marginBottom: state.selectedFile && !state.error ? (isMobile ? '1rem' : '1.5rem') : '0',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          overflowY: 'visible',
          position: 'relative',
          outline: 'none',
        }}
      >
        {/* MEDIUM FIX #11: Upload Icon with loading state indicator */}
        <div
          style={{
            width: isMobile ? '60px' : isTablet ? '70px' : '80px',
            height: isMobile ? '60px' : isTablet ? '70px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: isMobile ? '0 auto 1rem' : isTablet ? '0 auto 1.25rem' : '0 auto 1.5rem',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg
            width={isMobile ? "32" : isTablet ? "36" : "40"}
            height={isMobile ? "32" : isTablet ? "36" : "40"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Text */}
        <p
          style={{
            fontSize: isMobile ? '1rem' : isTablet ? '1.125rem' : '1.25rem',
            fontWeight: '600',
            color: '#8b5cf6',
            margin: 0,
            letterSpacing: '0.5px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}
        >
          {state.isUploading ? 'Uploading...' : 'Upload File'}
        </p>
      </div>

      {/* CRITICAL FIX #3: Error message with accessibility */}
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            marginBottom: isMobile ? '1rem' : '1.5rem',
            marginTop: isMobile ? '1rem' : '1.5rem',
            padding: isMobile ? '0.75rem 0.875rem' : isTablet ? '1rem 1.25rem' : '1rem 1.5rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: isMobile ? '10px' : '12px',
            color: '#dc2626',
            fontSize: isMobile ? '0.875rem' : isTablet ? '0.9rem' : '0.95rem',
            width: '100%',
            boxSizing: 'border-box',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden',
          }}
        >
          {state.error}
        </div>
      )}

      {/* HIGH FIX #6, MEDIUM FIX #10: Selected file info with size and mobile overflow fixes */}
      {state.selectedFile && !state.error && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Selected file: ${state.selectedFile.name}`}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: isMobile ? '10px' : isTablet ? '11px' : '12px',
            padding: isMobile ? '0.75rem' : isTablet ? '1rem 1.25rem' : '1.25rem 1.5rem',
            marginBottom: isMobile ? '0.875rem' : '1rem',
            marginTop: isMobile ? '1rem' : '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.625rem' : isTablet ? '0.875rem' : '1rem',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {/* Document Icon */}
          <div
            style={{
              width: isMobile ? '36px' : isTablet ? '44px' : '48px',
              height: isMobile ? '36px' : isTablet ? '44px' : '48px',
              backgroundColor: '#f3f4f6',
              borderRadius: isMobile ? '6px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg
              width={isMobile ? "18" : isTablet ? "22" : "24"}
              height={isMobile ? "18" : isTablet ? "22" : "24"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          {/* File Info */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: '600',
                color: '#1f2937',
                fontSize: isMobile ? '0.8125rem' : isTablet ? '0.875rem' : '0.95rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              {state.selectedFile.name}
            </p>
            {/* MEDIUM FIX #10: Display file size */}
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: isMobile ? '0.75rem' : isTablet ? '0.8125rem' : '0.875rem',
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {formatFileSize(state.selectedFile.size)}
            </p>
            {state.isUploading && (
              <div style={{ marginTop: isMobile ? '0.375rem' : '0.5rem', width: '100%' }}>
                <div
                  role="progressbar"
                  aria-valuenow={state.uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  style={{
                    width: '100%',
                    height: isMobile ? '4px' : isTablet ? '5px' : '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#8b5cf6',
                      width: `${state.uploadProgress}%`,
                      transition: 'width 0.3s ease',
                      maxWidth: '100%',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progress percentage */}
          {state.isUploading && (
            <div
              aria-hidden="true"
              style={{
                fontSize: isMobile ? '0.6875rem' : isTablet ? '0.75rem' : '0.875rem',
                fontWeight: '600',
                color: '#8b5cf6',
                minWidth: isMobile ? '32px' : isTablet ? '38px' : '45px',
                textAlign: 'right' as const,
                flexShrink: 0,
              }}
            >
              {state.uploadProgress}%
            </div>
          )}
        </div>
      )}

      {/* HIGH FIX #7: Upload Button with proper hover implementation (no layout shifts) */}
      {state.selectedFile && !state.error && !state.uploadedFile && (
        <button
          onClick={handleUpload}
          disabled={state.isUploading}
          aria-label={state.isUploading ? 'Uploading file' : 'Upload selected file'}
          style={{
            width: '100%',
            padding: isMobile ? '0.8125rem' : isTablet ? '0.9375rem' : '1rem',
            backgroundColor: state.isUploading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: isMobile ? '10px' : isTablet ? '11px' : '12px',
            fontSize: isMobile ? '0.9375rem' : isTablet ? '1rem' : '1.1rem',
            fontWeight: '600',
            cursor: state.isUploading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!state.isUploading) {
              e.currentTarget.style.backgroundColor = '#7c3aed';
            }
          }}
          onMouseLeave={(e) => {
            if (!state.isUploading) {
              e.currentTarget.style.backgroundColor = '#8b5cf6';
            }
          }}
        >
          {state.isUploading ? 'Uploading...' : 'Upload'}
        </button>
      )}

      {/* HIGH FIX #8: Upload Success with Reset button */}
      {state.uploadedFile && (
        <div
          role="status"
          aria-live="polite"
          aria-label="File uploaded successfully"
          style={{
            backgroundColor: '#d1fae5',
            borderRadius: isMobile ? '10px' : isTablet ? '11px' : '12px',
            padding: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
            textAlign: 'center' as const,
            marginTop: isMobile ? '1rem' : '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            wordWrap: 'break-word',
          }}
        >
          <div
            style={{
              width: isMobile ? '48px' : isTablet ? '54px' : '60px',
              height: isMobile ? '48px' : isTablet ? '54px' : '60px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.875rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg
              width={isMobile ? "22" : isTablet ? "26" : "30"}
              height={isMobile ? "22" : isTablet ? "26" : "30"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p
            style={{
              margin: '0 0 0.875rem 0',
              fontWeight: '600',
              color: '#065f46',
              fontSize: isMobile ? '0.9375rem' : isTablet ? '1rem' : '1.1rem',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
            }}
          >
            Upload Successful!
          </p>
          <a
            href={state.uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#8b5cf6',
              textDecoration: 'none',
              fontSize: isMobile ? '0.8125rem' : isTablet ? '0.875rem' : '0.95rem',
              fontWeight: '500',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              display: 'inline-block',
              maxWidth: '100%',
              marginBottom: isMobile ? '0.75rem' : '1rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            View uploaded file →
          </a>
          {/* HIGH FIX #8: Reset button to upload another file */}
          <button
            onClick={handleReset}
            aria-label="Upload another file"
            style={{
              display: 'block',
              width: '100%',
              marginTop: isMobile ? '0.75rem' : '1rem',
              padding: isMobile ? '0.625rem' : isTablet ? '0.75rem' : '0.875rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: isMobile ? '8px' : isTablet ? '9px' : '10px',
              fontSize: isMobile ? '0.875rem' : isTablet ? '0.9375rem' : '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;