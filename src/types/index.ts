// ============================================================================
// Core Interfaces
// ============================================================================

export interface UploadResult {
  url: string;
  name: string;
  size: number;
}

export interface FileUploadProps {
  onUpload: (file: File) => Promise<UploadResult>;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  disabled?: boolean;
}

export interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  result?: UploadResult;
  error?: string;
}

export interface UploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadedFile: UploadResult | null;
  error: string | null;
}

// ============================================================================
// MIME Type Constants
// ============================================================================

export const MIME_TYPES = {
  // Images
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
  IMAGE_SVG: 'image/svg+xml',
  IMAGE_ALL: 'image/*',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  TEXT_CSS: 'text/css',
  TEXT_CSV: 'text/csv',

  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  SEVEN_ZIP: 'application/x-7z-compressed',

  // Audio
  AUDIO_MP3: 'audio/mpeg',
  AUDIO_WAV: 'audio/wav',
  AUDIO_OGG: 'audio/ogg',
  AUDIO_ALL: 'audio/*',

  // Video
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  VIDEO_OGG: 'video/ogg',
  VIDEO_ALL: 'video/*',

  // Application
  JSON: 'application/json',
  XML: 'application/xml',
} as const;

// ============================================================================
// File Size Constants
// ============================================================================

export const FILE_SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

// Common file size limits
export const FILE_SIZE_LIMITS = {
  SMALL: 2 * FILE_SIZE.MB,      // 2MB
  MEDIUM: 10 * FILE_SIZE.MB,    // 10MB
  LARGE: 50 * FILE_SIZE.MB,     // 50MB
  XLARGE: 100 * FILE_SIZE.MB,   // 100MB
} as const;

// ============================================================================
// Common Accept Type Presets
// ============================================================================

export const ACCEPT_TYPES = {
  IMAGES: [MIME_TYPES.IMAGE_JPEG, MIME_TYPES.IMAGE_PNG, MIME_TYPES.IMAGE_GIF, MIME_TYPES.IMAGE_WEBP],
  DOCUMENTS: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX],
  SPREADSHEETS: [MIME_TYPES.XLS, MIME_TYPES.XLSX, MIME_TYPES.TEXT_CSV],
  PRESENTATIONS: [MIME_TYPES.PPT, MIME_TYPES.PPTX],
  ARCHIVES: [MIME_TYPES.ZIP, MIME_TYPES.RAR, MIME_TYPES.SEVEN_ZIP],
  ALL_IMAGES: [MIME_TYPES.IMAGE_ALL],
  ALL_AUDIO: [MIME_TYPES.AUDIO_ALL],
  ALL_VIDEO: [MIME_TYPES.VIDEO_ALL],
} as const;

// ============================================================================
// Type Utilities
// ============================================================================

export type UploadStatus = FileUploadItem['status'];
export type AcceptedFileTypes = string[];
export type FileSize = number;

// Helper type for MIME type values
export type MimeType = typeof MIME_TYPES[keyof typeof MIME_TYPES];