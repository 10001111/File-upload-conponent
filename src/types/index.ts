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