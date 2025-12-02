import React, { useState, useRef } from 'react';
import type { UploadResult } from '../types';
import { mockStorage } from '../utils/mockStorage';

interface JobApplicationFormData {
  name: string;
  email: string;
  phone: string;
  availableFrom: string;
  files: File[];
}

const JobApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<JobApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    availableFrom: '',
    files: [],
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    availableFrom?: string;
    files?: string
  }>({});

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BUG FIX #7: Robust email validation regex
  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // BUG FIX #8: Improved phone validation (supports multiple formats)
  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it's a valid length (10-15 digits for international)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return false;
    }

    // Common patterns: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  // BUG FIX #11: Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // BUG FIX #6: File type validation
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
      // Validate file size
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, files: `File ${file.name} exceeds 25MB limit` }));
        continue;
      }

      // BUG FIX #6: Validate file type against allowed MIME types
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, availableFrom: e.target.value }));
    if (errors.availableFrom) {
      setErrors(prev => ({ ...prev, availableFrom: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      availableFrom?: string;
      files?: string
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // BUG FIX #7: Validate email with robust regex
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // BUG FIX #8: Validate phone with improved validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
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

  // BUG FIX #9 & #25: Reset form after submission and integrate with backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // BUG FIX #12: Disable submit button during submission
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Save files to mock storage (IndexedDB + localStorage)
      const uploadedFiles: UploadResult[] = [];

      for (const file of formData.files) {
        // Save file to mock storage
        const storedFile = await mockStorage.saveFile(file);
        
        // Get blob URL for the stored file
        const blobUrl = await mockStorage.getFileUrl(storedFile.id);
        
        uploadedFiles.push({
          url: blobUrl || URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }
      
      // Trigger custom event to update RecentFiles component
      window.dispatchEvent(new Event('fileUploaded'));

      // Prepare the complete form data
      const applicationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        availableFrom: formData.availableFrom,
        files: uploadedFiles,
      };

      // TODO: Replace with actual API call when backend is available
      // Example:
      // const response = await fetch('http://localhost:3001/api/application', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(applicationData),
      // });
      // if (!response.ok) throw new Error('Submission failed');

      console.log('Application submitted successfully:', applicationData);

      // BUG FIX #9: Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        availableFrom: '',
        files: [],
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setErrors({});
      setSubmitSuccess(true);

      // Show success message for 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({
        ...prev,
        files: error instanceof Error ? error.message : 'Submission failed. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
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
      {/* Success Message */}
      {submitSuccess && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.9375rem',
            fontWeight: '500',
          }}
        >
          Application submitted successfully! Thank you for applying.
        </div>
      )}

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
        {/* BUG FIX #3: Form with responsive breakpoints */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
        }}>
          {/* Name Field */}
          <div>
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
              disabled={isSubmitting}
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
                if (!isSubmitting) e.currentTarget.style.borderColor = '#8b5cf6';
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

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleEmailChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${errors.email ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                boxSizing: 'border-box',
                color: '#1f2937',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                if (!isSubmitting) e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.email ? '#dc2626' : '#d1d5db';
              }}
            />
            {errors.email && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#dc2626',
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Phone <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={isSubmitting}
              placeholder="(123) 456-7890"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${errors.phone ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                boxSizing: 'border-box',
                color: '#1f2937',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                if (!isSubmitting) e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.phone ? '#dc2626' : '#d1d5db';
              }}
            />
            {errors.phone && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#dc2626',
              }}>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Available From Field */}
          <div>
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
                disabled={isSubmitting}
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
                  if (!isSubmitting) e.currentTarget.style.borderColor = '#8b5cf6';
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
        </div>

        {/* Upload Section */}
        <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.9375rem',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Upload your resume and cover letter <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isSubmitting}
            style={{ display: 'none' }}
          />
          {/* BUG FIX #4: Distinct drag state visual feedback */}
          <div
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            onDragOver={(e) => {
              if (!isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              if (!isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }
            }}
            style={{
              border: `2px dashed ${isDragging ? '#8b5cf6' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: isDragging ? '#f5f3ff' : '#ffffff',
              transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: isDragging ? '#8b5cf6' : '#1f2937',
              margin: '0 0 0.5rem 0',
              transition: 'color 0.2s',
            }}>
              {isDragging ? 'Drop files here!' : 'Drag and drop files here or'}{' '}
              {!isDragging && (
                <span
                  style={{
                    color: '#8b5cf6',
                    textDecoration: 'underline',
                  }}
                >
                  browse
                </span>
              )}
              {!isDragging && ' to upload.'}
            </p>
            <p style={{
              fontSize: '0.8125rem',
              color: '#6b7280',
              margin: 0,
            }}>
              (DOC, DOCX, PDF) max. 2 files max. file size 25MB
            </p>
          </div>
          {/* BUG FIX #11: Display file sizes */}
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
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {file.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}>
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({
                        ...prev,
                        files: prev.files.filter((_, i) => i !== index),
                      }));
                    }}
                    disabled={isSubmitting}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
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

        {/* BUG FIX #12: Submit Button disabled during submission */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: isSubmitting ? '#9ca3af' : '#dc2626',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s, transform 0.1s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }
          }}
          onMouseDown={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'scale(0.98)';
            }
          }}
          onMouseUp={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {isSubmitting ? 'SUBMITTING...' : 'APPLY'}
        </button>
      </form>

      {/* BUG FIX #3: Responsive breakpoints for mobile */}
      <style>{`
        @media (max-width: 640px) {
          div[style*="padding: 2rem 1.5rem"] {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApplicationForm;
