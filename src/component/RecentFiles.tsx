import React, { useState, useEffect } from 'react';
import { mockStorage } from '../utils/mockStorage';
import type { StoredFile } from '../utils/mockStorage';

const RecentFiles: React.FC = () => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    loadFiles();
    
    // Listen for custom storage event to update when new files are added
    const handleStorageChange = () => {
      loadFiles();
    };
    
    // Listen for both storage events (other tabs) and custom events (same tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fileUploaded', handleStorageChange);
    
    // Also check periodically for changes
    const interval = setInterval(loadFiles, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fileUploaded', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadFiles = () => {
    try {
      const recentFiles = mockStorage.getRecentFiles(10);
      setFiles(recentFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: StoredFile) => {
    try {
      const fileBlob = await mockStorage.getFile(file.id);
      if (fileBlob) {
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await mockStorage.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleView = async (file: StoredFile) => {
    try {
      const fileBlob = await mockStorage.getFile(file.id);
      if (fileBlob) {
        const url = URL.createObjectURL(fileBlob);
        window.open(url, '_blank');
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to open file');
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
      }}>
        <p style={{ margin: 0, color: '#6b7280' }}>Loading recent files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9375rem' }}>
          No files uploaded yet. Upload files using the form below.
        </p>
      </div>
    );
  }

  const displayFiles = expanded ? files : files.slice(0, 3);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: minimized ? '1rem 1.5rem' : '1.5rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: minimized ? '0' : '1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
          }}>
            Recently Uploaded Files
          </h2>
          {!minimized && (
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '400',
            }}>
              ({files.length} file{files.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}>
          {!minimized && files.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: '#8b5cf6',
                backgroundColor: 'transparent',
                border: '1px solid #8b5cf6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f3ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {expanded ? 'Show Less' : `Show All (${files.length})`}
            </button>
          )}
          <button
            onClick={() => setMinimized(!minimized)}
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
              height: '32px',
              transition: 'all 0.2s',
            }}
            title={minimized ? 'Expand' : 'Minimize'}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: minimized ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            >
              {minimized ? (
                <path d="M18 15l-6-6-6 6" />
              ) : (
                <path d="M6 9l6 6 6-6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {!minimized && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: minimized ? '0' : 'none',
          overflow: minimized ? 'hidden' : 'visible',
          transition: 'max-height 0.3s ease',
        }}>
        {displayFiles.map((file) => (
          <div
            key={file.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: '#1f2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.8125rem',
                color: '#6b7280',
              }}>
                <span>{mockStorage.formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{mockStorage.formatDate(file.uploadedAt)}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginLeft: '1rem',
            }}>
              <button
                onClick={() => handleView(file)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#8b5cf6',
                  backgroundColor: 'transparent',
                  border: '1px solid #8b5cf6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
                title="View file"
              >
                View
              </button>
              <button
                onClick={() => handleDownload(file)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
                title="Download file"
              >
                Download
              </button>
              <button
                onClick={() => {
                  handleDelete(file.id);
                  // Trigger update after deletion
                  setTimeout(() => {
                    window.dispatchEvent(new Event('fileUploaded'));
                  }, 100);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
                title="Delete file"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default RecentFiles;

