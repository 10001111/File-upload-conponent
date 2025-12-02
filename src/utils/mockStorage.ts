// Mock storage utility for client-side file storage
// Uses IndexedDB for file blobs and localStorage for metadata

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  blobUrl?: string;
}

class MockStorage {
  private dbName = 'FileUploadDB';
  private storeName = 'files';
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      console.warn('IndexedDB is not available. File storage will be limited.');
      return;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        // Don't reject, just continue without IndexedDB
        resolve();
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  // Ensure DB is initialized
  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  // Save file to IndexedDB and metadata to localStorage
  async saveFile(file: File): Promise<StoredFile> {
    await this.ensureDB();

    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedFile: StoredFile = {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    // Store file blob in IndexedDB if available
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const fileData = {
          id,
          blob: file,
          metadata: storedFile,
        };

        const request = store.put(fileData);

        request.onsuccess = () => {
          // Store metadata in localStorage for quick access
          const metadataList = this.getMetadataList();
          metadataList.unshift(storedFile);
          // Keep only last 50 files
          const limitedList = metadataList.slice(0, 50);
          localStorage.setItem('fileMetadata', JSON.stringify(limitedList));
          
          resolve(storedFile);
        };

        request.onerror = () => {
          console.error('Error saving file to IndexedDB:', request.error);
          // Fallback: just save metadata
          const metadataList = this.getMetadataList();
          metadataList.unshift(storedFile);
          const limitedList = metadataList.slice(0, 50);
          localStorage.setItem('fileMetadata', JSON.stringify(limitedList));
          resolve(storedFile);
        };
      });
    } else {
      // Fallback: only save metadata if IndexedDB is not available
      const metadataList = this.getMetadataList();
      metadataList.unshift(storedFile);
      const limitedList = metadataList.slice(0, 50);
      localStorage.setItem('fileMetadata', JSON.stringify(limitedList));
      return storedFile;
    }
  }

  // Get file blob from IndexedDB
  async getFile(id: string): Promise<File | null> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get metadata list from localStorage
  getMetadataList(): StoredFile[] {
    try {
      const stored = localStorage.getItem('fileMetadata');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get recent files (from localStorage metadata)
  getRecentFiles(limit: number = 10): StoredFile[] {
    const metadataList = this.getMetadataList();
    return metadataList.slice(0, limit);
  }

  // Delete file from both IndexedDB and localStorage
  async deleteFile(id: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        // Remove from localStorage metadata
        const metadataList = this.getMetadataList();
        const filtered = metadataList.filter(f => f.id !== id);
        localStorage.setItem('fileMetadata', JSON.stringify(filtered));
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get blob URL for a file
  async getFileUrl(id: string): Promise<string | null> {
    const file = await this.getFile(id);
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const mockStorage = new MockStorage();

// Initialize on import
mockStorage.init().catch(console.error);

