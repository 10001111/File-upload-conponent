import React, { useState, useRef } from 'react';
import type { UploadResult } from '../types';

interface JobApplicationFormData {
  name: string;
  availableFrom: string;
  files: File[];
}

const JobApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<JobApplicationFormData>({
    name: '',
    availableFrom: '',
    files: [],
  });

  const [errors, setErrors] = useState<{ name?: string; availableFrom?: string; files?: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    for (const file of fileArray) {
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, files: `File ${file.name} exceeds 25MB limit` }));
        continue;
      }
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(doc|docx|pdf)$/i)) {
        setErrors(prev => ({ ...prev, files: `File ${file.name} is not a valid format (DOC, DOCX, PDF)` }));
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length + formData.files.length > 2) {
      setErrors(prev => ({ ...prev, files: 'Maximum 2 files allowed' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles].slice(0, 2),
    }));
    setErrors(prev => ({ ...prev, files: undefined }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, availableFrom: e.target.value }));
    if (errors.availableFrom) {
      setErrors(prev => ({ ...prev, availableFrom: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; availableFrom?: string; files?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.availableFrom) {
      newErrors.availableFrom = 'Available from date is required';
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Please upload at least one file';
    } else if (formData.files.length > 2) {
      newErrors.files = 'Maximum 2 files allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle form submission
      console.log('Form submitted:', formData);
      alert('Application submitted successfully!');
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 0.5rem 0',
          lineHeight: '1.2',
        }}>
          Job Application Form Marketing Intern
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          color: '#4b5563',
          margin: 0,
        }}>
          Please complete this form to apply.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Name <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9375rem',
              border: `1px solid ${errors.name ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              boxSizing: 'border-box',
              color: '#1f2937',
              backgroundColor: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.name ? '#dc2626' : '#d1d5db';
            }}
          />
          {errors.name && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.875rem',
              color: '#dc2626',
            }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Available From Field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="availableFrom"
            style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Available from <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="date"
              id="availableFrom"
              value={formData.availableFrom}
              onChange={handleDateChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '2.5rem',
                fontSize: '0.9375rem',
                border: `1px solid ${errors.availableFrom ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                boxSizing: 'border-box',
                color: '#1f2937',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.availableFrom ? '#dc2626' : '#d1d5db';
              }}
            />
            <svg
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                pointerEvents: 'none',
                color: '#6b7280',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {errors.availableFrom && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.875rem',
              color: '#dc2626',
            }}>
              {errors.availableFrom}
            </p>
          )}
        </div>

        {/* Upload Section */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Upload your resume and cover letter
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            style={{
              border: `2px dashed ${isDragging ? '#8b5cf6' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: isDragging ? '#f5f3ff' : '#ffffff',
              transition: 'border-color 0.2s, background-color 0.2s',
              cursor: 'pointer',
            }}
          >
            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 0.5rem 0',
            }}>
              Drag and drop files here or{' '}
              <span
                style={{
                  color: '#8b5cf6',
                  textDecoration: 'underline',
                }}
              >
                browse
              </span>
              {' '}to upload.
            </p>
            <p style={{
              fontSize: '0.8125rem',
              color: '#6b7280',
              margin: 0,
            }}>
              (DOC, DOCX, PDF) max. 2 files max. file size 25MB
            </p>
          </div>
          {formData.files.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1f2937',
                margin: '0 0 0.5rem 0',
              }}>
                Selected files ({formData.files.length}/2):
              </p>
              {formData.files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: index < formData.files.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({
                        ...prev,
                        files: prev.files.filter((_, i) => i !== index),
                      }));
                    }}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.files && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.875rem',
              color: '#dc2626',
            }}>
              {errors.files}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, transform 0.1s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          APPLY
        </button>
      </form>
    </div>
  );
};

export default JobApplicationForm;

