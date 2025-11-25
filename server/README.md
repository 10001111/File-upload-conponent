# Secure File Upload Backend

This directory contains production-ready backend implementations for the file upload component with comprehensive security features.

## Quick Start

Choose one backend implementation:

### Node.js/Express (Recommended for JavaScript projects)
```bash
cd node-express
npm install
npm run dev
```
Server runs on: http://localhost:3001

### Python/Flask (Recommended for Python projects)
```bash
cd python-flask
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```
Server runs on: http://localhost:5000

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[SECURITY_AUDIT_REPORT.md](../SECURITY_AUDIT_REPORT.md)** - Complete security analysis and recommendations

## Security Features

Both implementations include:

✅ **Server-side file type validation** (MIME + magic numbers)
✅ **File size limits** enforced server-side
✅ **Path traversal prevention**
✅ **Secure filename generation**
✅ **Virus scanning integration points**
✅ **CORS configuration**
✅ **Comprehensive error handling**
✅ **Security headers**
✅ **Request logging**

## API Endpoints

### POST /api/upload
Upload a file with validation

**Request:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@document.pdf"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/document_20251125_143022_a7f3e9c2.pdf",
    "name": "document.pdf",
    "size": 1234567,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-11-25T14:30:22.123Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "File type not allowed. Allowed types: .pdf, .doc, ..."
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-25T14:30:22.123Z",
  "maxFileSize": "10MB",
  "allowedTypes": ["application/pdf", "image/jpeg", ...]
}
```

### GET /api/files/:filename
Retrieve uploaded file

## Allowed File Types

- **Documents:** .pdf, .doc, .docx, .txt
- **Images:** .jpg, .jpeg, .png, .gif

## Configuration

See `.env.example` in each implementation directory:

```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_FILE_SIZE=10485760
```

## Directory Structure

```
server/
├── README.md                    # This file
├── SETUP_GUIDE.md               # Detailed setup instructions
├── node-express/                # Node.js implementation
│   ├── server.js               # Main server file
│   ├── package.json            # Dependencies
│   ├── .env.example            # Environment template
│   └── uploads/                # Upload directory (auto-created)
└── python-flask/               # Python implementation
    ├── app.py                  # Main server file
    ├── requirements.txt        # Dependencies
    ├── .env.example            # Environment template
    └── uploads/                # Upload directory (auto-created)
```

## Production Checklist

Before deploying to production:

- [ ] Configure environment variables
- [ ] Enable HTTPS/TLS
- [ ] Set proper CORS origins
- [ ] Integrate virus scanning
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backups
- [ ] Perform security testing
- [ ] Review SECURITY_AUDIT_REPORT.md

## Support

For detailed information, see:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [SECURITY_AUDIT_REPORT.md](../SECURITY_AUDIT_REPORT.md)
