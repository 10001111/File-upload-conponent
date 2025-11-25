/**
 * Secure File Upload Server - Node.js/Express Implementation
 *
 * This server implements comprehensive security measures for file uploads:
 * - Server-side file type validation (MIME type + magic number verification)
 * - File size limits enforced server-side
 * - Path traversal prevention
 * - Virus scanning integration points
 * - Secure file storage with sanitized filenames
 * - Proper error handling and logging
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const fileType = require('file-type');
const sanitize = require('sanitize-filename');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Configuration Constants
// ============================================================================

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types with their MIME types and magic number signatures
const ALLOWED_FILE_TYPES = {
  'application/pdf': {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    magicNumbers: ['25504446'] // %PDF
  },
  'application/msword': {
    extensions: ['.doc'],
    mimeTypes: ['application/msword'],
    magicNumbers: ['D0CF11E0A1B11AE1'] // OLE2 format
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['.docx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    magicNumbers: ['504B0304'] // ZIP format (DOCX is zipped XML)
  },
  'text/plain': {
    extensions: ['.txt'],
    mimeTypes: ['text/plain'],
    magicNumbers: [] // Text files don't have magic numbers
  },
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
    magicNumbers: ['FFD8FFE0', 'FFD8FFE1', 'FFD8FFE2', 'FFD8FFE3', 'FFD8FFE8']
  },
  'image/png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
    magicNumbers: ['89504E47']
  },
  'image/gif': {
    extensions: ['.gif'],
    mimeTypes: ['image/gif'],
    magicNumbers: ['47494638']
  }
};

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Verify file type using magic numbers (first bytes of file)
 * This prevents file type spoofing via filename/extension changes
 */
async function verifyFileType(filePath) {
  try {
    const detectedType = await fileType.fromFile(filePath);

    if (!detectedType) {
      // For text files, check if it's valid UTF-8
      const buffer = await fs.readFile(filePath);
      const sample = buffer.slice(0, Math.min(1024, buffer.length)).toString('utf-8');

      // Basic check for text content
      if (/^[\x20-\x7E\s]*$/.test(sample)) {
        return { mime: 'text/plain', ext: 'txt' };
      }

      return null;
    }

    return detectedType;
  } catch (error) {
    console.error('Error verifying file type:', error);
    return null;
  }
}

/**
 * Validate file against allowed types
 */
function isAllowedFileType(mimeType, extension) {
  for (const [allowedMime, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.mimeTypes.includes(mimeType) && config.extensions.includes(extension.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Generate secure random filename to prevent overwriting and path traversal
 */
function generateSecureFilename(originalName) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const sanitizedName = sanitize(originalName);
  const ext = path.extname(sanitizedName);
  const nameWithoutExt = path.basename(sanitizedName, ext);

  // Limit filename length and remove any remaining special chars
  const safeName = nameWithoutExt
    .slice(0, 50)
    .replace(/[^a-zA-Z0-9-_]/g, '_');

  return `${safeName}_${timestamp}_${randomBytes}${ext}`;
}

/**
 * Prevent path traversal attacks
 */
function isPathSafe(filePath) {
  const resolvedPath = path.resolve(filePath);
  const uploadDirPath = path.resolve(UPLOAD_DIR);

  return resolvedPath.startsWith(uploadDirPath);
}

/**
 * Virus scanning placeholder
 * In production, integrate with ClamAV, VirusTotal API, or similar
 */
async function scanFileForViruses(filePath) {
  // TODO: Integrate with actual antivirus solution
  // Example integrations:
  // - ClamAV: https://www.npmjs.com/package/clamscan
  // - VirusTotal API: https://www.npmjs.com/package/virustotal-api

  console.log(`[SECURITY] Virus scan needed for: ${filePath}`);

  // For now, return clean
  // In production, this should call actual virus scanning service
  return { clean: true, threats: [] };
}

// ============================================================================
// Multer Configuration
// ============================================================================

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Ensure upload directory exists
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// File filter for initial validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  // Check if file type is allowed
  if (!isAllowedFileType(mimeType, ext)) {
    return cb(new Error(`File type not allowed. Allowed types: .pdf, .doc, .docx, .txt, .jpg, .jpeg, .png, .gif`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: fileFilter
});

// ============================================================================
// Middleware
// ============================================================================

// Enable CORS with restrictions
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Parse JSON bodies
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * File Upload Endpoint
 * POST /api/upload
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const uploadedFile = req.file;
    const filePath = uploadedFile.path;

    // CRITICAL SECURITY CHECK #1: Verify path safety
    if (!isPathSafe(filePath)) {
      await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({
        success: false,
        error: 'Invalid file path detected'
      });
    }

    // CRITICAL SECURITY CHECK #2: Verify file type using magic numbers
    const detectedType = await verifyFileType(filePath);

    if (!detectedType) {
      await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({
        success: false,
        error: 'Could not verify file type'
      });
    }

    const ext = path.extname(uploadedFile.originalname).toLowerCase();
    if (!isAllowedFileType(detectedType.mime, ext)) {
      await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({
        success: false,
        error: `File type mismatch. Detected: ${detectedType.mime}, Expected extension: ${ext}`
      });
    }

    // CRITICAL SECURITY CHECK #3: Verify file size (double-check)
    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      await fs.unlink(filePath).catch(console.error);
      return res.status(400).json({
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    // CRITICAL SECURITY CHECK #4: Virus scanning
    const scanResult = await scanFileForViruses(filePath);
    if (!scanResult.clean) {
      await fs.unlink(filePath).catch(console.error);
      console.error(`[SECURITY ALERT] Malicious file detected: ${uploadedFile.originalname}`, scanResult.threats);
      return res.status(400).json({
        success: false,
        error: 'File failed security scan'
      });
    }

    // Log successful upload
    console.log(`[SUCCESS] File uploaded: ${uploadedFile.filename} (${stats.size} bytes, ${detectedType.mime})`);

    // Return success response
    res.json({
      success: true,
      data: {
        url: `/uploads/${uploadedFile.filename}`,
        name: uploadedFile.originalname,
        size: stats.size,
        mimeType: detectedType.mime,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    // Handle specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    allowedTypes: Object.keys(ALLOWED_FILE_TYPES)
  });
});

/**
 * Serve uploaded files (with security considerations)
 */
app.get('/uploads/:filename', async (req, res) => {
  try {
    const filename = sanitize(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    // Verify path safety
    if (!isPathSafe(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Frame-Options', 'DENY');

    res.sendFile(filePath);

  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ============================================================================
// Server Initialization
// ============================================================================

async function startServer() {
  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ready: ${UPLOAD_DIR}`);

    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Secure File Upload Server running on port ${PORT}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      console.log(`Upload directory: ${UPLOAD_DIR}`);
      console.log(`Allowed file types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`);
      console.log(`${'='.repeat(60)}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
