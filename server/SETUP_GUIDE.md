# Backend Setup Guide

This guide will help you set up the secure backend for your file upload component.

## Choose Your Backend

You have two options:
1. **Node.js/Express** - Recommended for JavaScript/TypeScript projects
2. **Python/Flask** - Recommended for Python projects or if you prefer Python

---

## Option 1: Node.js/Express Setup

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Step-by-Step Setup

1. **Navigate to the Node.js server directory:**
   ```bash
   cd server/node-express
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - `express` - Web framework
   - `multer` - File upload handling
   - `file-type` - MIME type detection
   - `sanitize-filename` - Filename sanitization

3. **Create environment file:**
   ```bash
   # Windows
   copy .env.example .env

   # Linux/Mac
   cp .env.example .env
   ```

4. **Edit `.env` file** (optional - defaults work for development):
   ```env
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

   You should see:
   ```
   ============================================================
   Secure File Upload Server running on port 3001
   ============================================================
   Max file size: 10MB
   Upload directory: /path/to/uploads
   Allowed file types: application/pdf, image/jpeg, ...
   ============================================================
   ```

6. **Test the server:**
   ```bash
   # In a new terminal
   curl http://localhost:3001/api/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-25T...",
     "maxFileSize": "10MB",
     "allowedTypes": [...]
   }
   ```

---

## Option 2: Python/Flask Setup

### Prerequisites
- Python 3.8+ installed
- pip package manager

### Step-by-Step Setup

1. **Navigate to the Python server directory:**
   ```bash
   cd server/python-flask
   ```

2. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   **For Windows users**, also install:
   ```bash
   pip install python-magic-bin
   ```

   This installs:
   - `Flask` - Web framework
   - `Flask-CORS` - CORS handling
   - `python-magic` - MIME type detection
   - `Werkzeug` - File handling utilities

4. **Create environment file:**
   ```bash
   # Windows
   copy .env.example .env

   # Linux/Mac
   cp .env.example .env
   ```

5. **Edit `.env` file** (optional - defaults work for development):
   ```env
   PORT=5000
   FLASK_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

6. **Start the server:**
   ```bash
   # Development
   python app.py

   # Production (install gunicorn first)
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

   You should see:
   ```
   ============================================================
   Secure File Upload Server Starting
   ============================================================
   Max file size: 10MB
   Upload directory: /path/to/uploads
   Allowed extensions: .pdf, .doc, .docx, ...
   ============================================================
   ```

7. **Test the server:**
   ```bash
   # In a new terminal
   curl http://localhost:5000/api/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-25T...",
     "max_file_size": "10MB",
     "allowed_extensions": [...]
   }
   ```

---

## Update Frontend to Use Backend

### 1. Open `src/App.tsx`

### 2. Replace the mock upload handler:

**Current (mock) implementation:**
```typescript
const handleUpload = async (file: File): Promise<UploadResult> => {
  // Simulate API upload
  console.log('Uploading file:', file.name);

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate successful upload response
  return {
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
  };
};
```

**New (real backend) implementation:**

For **Node.js backend (port 3001)**:
```typescript
const handleUpload = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

For **Python backend (port 5000)**:
```typescript
const handleUpload = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### 3. Save the file

---

## Testing the Complete Setup

### 1. Start the backend server
```bash
# Node.js
cd server/node-express
npm run dev

# OR Python
cd server/python-flask
python app.py
```

### 2. Start the frontend (in a new terminal)
```bash
# From the project root
npm run dev
```

### 3. Open browser
```
http://localhost:5173
```

### 4. Test file upload
- Try uploading a valid PDF or image
- Try uploading an invalid file type (should be rejected)
- Try uploading an oversized file (should be rejected)
- Check the server console for security logs

---

## Security Testing

### Test Valid Upload
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test.pdf"
```

Expected: Success response with file URL

### Test Invalid File Type
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test.exe"
```

Expected: 400 error "File type not allowed"

### Test Oversized File
```bash
# Create a 20MB file
dd if=/dev/zero of=large.pdf bs=1M count=20

curl -X POST http://localhost:3001/api/upload \
  -F "file=@large.pdf"
```

Expected: 400 error "File too large"

### Test Path Traversal
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test.pdf;filename=../../../etc/passwd"
```

Expected: Should be sanitized and rejected

---

## Common Issues and Solutions

### Issue: "Port already in use"

**Solution:**
```bash
# Find and kill the process using the port
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Issue: "Cannot find module 'file-type'"

**Solution:**
```bash
# Make sure you're in the correct directory
cd server/node-express
npm install
```

### Issue: "python-magic not working on Windows"

**Solution:**
```bash
pip install python-magic-bin
```

### Issue: "CORS error in browser"

**Solution:**
Check that your frontend URL is in `ALLOWED_ORIGINS` in the `.env` file:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue: "Uploads directory not found"

**Solution:**
The server creates it automatically, but you can create it manually:
```bash
mkdir uploads
```

---

## Production Deployment

### Environment Variables for Production

**Node.js (.env):**
```env
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

**Python (.env):**
```env
PORT=5000
FLASK_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECRET_KEY=your-very-secure-random-key-here
```

### Important Production Considerations

1. **Use HTTPS** - Never use HTTP in production
2. **Set proper CORS origins** - Don't use wildcards
3. **Enable virus scanning** - Integrate ClamAV or similar
4. **Add authentication** - Require user login for uploads
5. **Implement rate limiting** - Prevent abuse
6. **Use cloud storage** - AWS S3, Google Cloud Storage, etc.
7. **Set up monitoring** - Track uploads, errors, security events
8. **Configure backups** - Regular automated backups
9. **Review logs regularly** - Watch for security issues
10. **Keep dependencies updated** - Run `npm audit` / `pip audit`

### Deployment Options

**Node.js:**
- **Heroku** - Easy deployment
- **AWS EC2/Elastic Beanstalk** - Full control
- **Google Cloud Run** - Serverless
- **DigitalOcean App Platform** - Simple deployment
- **Vercel/Netlify** - With serverless functions

**Python:**
- **Heroku** - Easy deployment
- **AWS EC2/Elastic Beanstalk** - Full control
- **Google Cloud Run** - Serverless
- **PythonAnywhere** - Python-specific hosting
- **DigitalOcean App Platform** - Simple deployment

---

## Next Steps

1. ✅ Backend server running
2. ✅ Frontend connected to backend
3. ⏳ Add virus scanning (see SECURITY_AUDIT_REPORT.md)
4. ⏳ Implement authentication
5. ⏳ Add rate limiting
6. ⏳ Set up monitoring
7. ⏳ Deploy to production

---

## Getting Help

If you encounter issues:

1. Check the server logs for error messages
2. Review the SECURITY_AUDIT_REPORT.md for detailed information
3. Ensure all dependencies are installed correctly
4. Verify environment variables are set correctly
5. Test with curl/Postman before testing with frontend

---

**Last Updated:** November 25, 2025
