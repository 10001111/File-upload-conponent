"""
Secure File Upload Server - Python/Flask Implementation

This server implements comprehensive security measures for file uploads:
- Server-side file type validation (MIME type + magic number verification)
- File size limits enforced server-side
- Path traversal prevention
- Virus scanning integration points
- Secure file storage with sanitized filenames
- Proper error handling and logging
"""

import os
import hashlib
import mimetypes
import secrets
import logging
from datetime import datetime
from pathlib import Path
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import magic  # python-magic for MIME type detection

# ============================================================================
# Configuration
# ============================================================================

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'}

# MIME type validation mapping
ALLOWED_MIME_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif']
}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# CORS configuration - restrict to specific origins in production
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
CORS(app, origins=ALLOWED_ORIGINS, methods=['GET', 'POST', 'OPTIONS'])

# ============================================================================
# Security Utilities
# ============================================================================

def get_file_magic_type(file_path):
    """
    Detect file type using magic numbers (file signature)
    This prevents file type spoofing via extension changes
    """
    try:
        mime = magic.Magic(mime=True)
        detected_mime = mime.from_file(file_path)
        return detected_mime
    except Exception as e:
        logger.error(f"Error detecting file type: {e}")
        return None


def is_allowed_file_type(filename, detected_mime):
    """
    Validate file type against allowed types
    Checks both extension and MIME type for security
    """
    ext = os.path.splitext(filename)[1].lower()

    # Check extension
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Extension {ext} not allowed"

    # Check MIME type
    if detected_mime not in ALLOWED_MIME_TYPES:
        return False, f"MIME type {detected_mime} not allowed"

    # Verify extension matches MIME type
    if ext not in ALLOWED_MIME_TYPES[detected_mime]:
        return False, f"Extension {ext} does not match detected MIME type {detected_mime}"

    return True, None


def generate_secure_filename(original_filename):
    """
    Generate a secure filename to prevent:
    - Path traversal attacks
    - Filename collisions
    - Special character issues
    """
    # Sanitize the original filename
    safe_name = secure_filename(original_filename)

    # Get extension
    name, ext = os.path.splitext(safe_name)

    # Generate unique identifier
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    random_hash = secrets.token_hex(8)

    # Limit name length
    name = name[:50] if name else 'file'

    # Construct secure filename
    secure_name = f"{name}_{timestamp}_{random_hash}{ext}"

    return secure_name


def is_path_safe(file_path, base_directory):
    """
    Prevent path traversal attacks
    Ensures file path is within the allowed directory
    """
    try:
        abs_base = os.path.abspath(base_directory)
        abs_file = os.path.abspath(file_path)
        return abs_file.startswith(abs_base)
    except Exception as e:
        logger.error(f"Path safety check failed: {e}")
        return False


def calculate_file_hash(file_path, algorithm='sha256'):
    """
    Calculate file hash for integrity verification
    """
    hash_obj = hashlib.new(algorithm)

    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            hash_obj.update(chunk)

    return hash_obj.hexdigest()


def scan_file_for_viruses(file_path):
    """
    Virus scanning placeholder
    In production, integrate with:
    - ClamAV (python-clamd)
    - VirusTotal API
    - AWS GuardDuty
    """
    logger.info(f"[SECURITY] Virus scan needed for: {file_path}")

    # TODO: Integrate with actual antivirus solution
    # Example with ClamAV:
    # import clamd
    # cd = clamd.ClamdUnixSocket()
    # scan_result = cd.scan(file_path)

    # For now, return clean
    return {'clean': True, 'threats': []}


def validate_file_size(file_path, max_size):
    """
    Verify file size (server-side double-check)
    """
    try:
        file_size = os.path.getsize(file_path)
        return file_size <= max_size, file_size
    except Exception as e:
        logger.error(f"Error checking file size: {e}")
        return False, 0


# ============================================================================
# Helper Functions
# ============================================================================

def ensure_upload_directory():
    """Create upload directory if it doesn't exist"""
    Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)


def cleanup_file(file_path):
    """Safely remove a file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up file: {file_path}")
    except Exception as e:
        logger.error(f"Error cleaning up file {file_path}: {e}")


# ============================================================================
# API Routes
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'max_file_size': f"{MAX_FILE_SIZE / 1024 / 1024}MB",
        'allowed_extensions': list(ALLOWED_EXTENSIONS),
        'allowed_mime_types': list(ALLOWED_MIME_TYPES.keys())
    }), 200


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Secure file upload endpoint
    Implements multiple layers of security validation
    """
    try:
        # VALIDATION #1: Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        # VALIDATION #2: Check if file has a filename
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # VALIDATION #3: Initial extension check
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Ensure upload directory exists
        ensure_upload_directory()

        # Generate secure filename
        secure_name = generate_secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_name)

        # SECURITY CHECK #1: Verify path safety
        if not is_path_safe(file_path, app.config['UPLOAD_FOLDER']):
            logger.warning(f"[SECURITY] Path traversal attempt detected: {file.filename}")
            return jsonify({
                'success': False,
                'error': 'Invalid file path'
            }), 400

        # Save file temporarily for validation
        file.save(file_path)
        logger.info(f"File temporarily saved: {secure_name}")

        try:
            # SECURITY CHECK #2: Verify file size
            size_valid, file_size = validate_file_size(file_path, MAX_FILE_SIZE)
            if not size_valid:
                cleanup_file(file_path)
                return jsonify({
                    'success': False,
                    'error': f'File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size ({MAX_FILE_SIZE / 1024 / 1024}MB)'
                }), 400

            # SECURITY CHECK #3: Verify file type using magic numbers
            detected_mime = get_file_magic_type(file_path)

            if not detected_mime:
                cleanup_file(file_path)
                return jsonify({
                    'success': False,
                    'error': 'Could not verify file type'
                }), 400

            # SECURITY CHECK #4: Validate file type against allowed types
            is_valid, error_msg = is_allowed_file_type(file.filename, detected_mime)
            if not is_valid:
                cleanup_file(file_path)
                logger.warning(f"[SECURITY] Invalid file type: {file.filename} - {error_msg}")
                return jsonify({
                    'success': False,
                    'error': error_msg
                }), 400

            # SECURITY CHECK #5: Virus scanning
            scan_result = scan_file_for_viruses(file_path)
            if not scan_result['clean']:
                cleanup_file(file_path)
                logger.error(f"[SECURITY ALERT] Malicious file detected: {file.filename} - {scan_result['threats']}")
                return jsonify({
                    'success': False,
                    'error': 'File failed security scan'
                }), 400

            # Calculate file hash for integrity
            file_hash = calculate_file_hash(file_path)

            # Log successful upload
            logger.info(f"[SUCCESS] File uploaded: {secure_name} ({file_size} bytes, {detected_mime}, SHA256: {file_hash[:16]}...)")

            # Return success response
            return jsonify({
                'success': True,
                'data': {
                    'url': f'/api/files/{secure_name}',
                    'name': file.filename,
                    'size': file_size,
                    'mime_type': detected_mime,
                    'hash': file_hash,
                    'uploaded_at': datetime.now().isoformat()
                }
            }), 200

        except Exception as e:
            # Clean up on error
            cleanup_file(file_path)
            raise e

    except RequestEntityTooLarge:
        return jsonify({
            'success': False,
            'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB'
        }), 413

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Upload failed. Please try again.'
        }), 500


@app.route('/api/files/<filename>', methods=['GET'])
def get_file(filename):
    """
    Serve uploaded files with security checks
    """
    try:
        # Sanitize filename
        safe_filename = secure_filename(filename)

        # Verify path safety
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        if not is_path_safe(file_path, app.config['UPLOAD_FOLDER']):
            logger.warning(f"[SECURITY] Path traversal attempt: {filename}")
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403

        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404

        # Send file with security headers
        response = send_from_directory(
            app.config['UPLOAD_FOLDER'],
            safe_filename,
            as_attachment=True
        )

        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Content-Security-Policy'] = "default-src 'none'"

        return response

    except Exception as e:
        logger.error(f"File serving error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve file'
        }), 500


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB'
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# ============================================================================
# Server Initialization
# ============================================================================

if __name__ == '__main__':
    # Ensure upload directory exists
    ensure_upload_directory()

    logger.info("=" * 60)
    logger.info(f"Secure File Upload Server Starting")
    logger.info("=" * 60)
    logger.info(f"Max file size: {MAX_FILE_SIZE / 1024 / 1024}MB")
    logger.info(f"Upload directory: {UPLOAD_FOLDER}")
    logger.info(f"Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}")
    logger.info(f"Allowed MIME types: {', '.join(ALLOWED_MIME_TYPES.keys())}")
    logger.info("=" * 60)

    # Run server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
