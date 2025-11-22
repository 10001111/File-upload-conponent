# File Upload Component

A modern, responsive file upload component built with React and TypeScript. Features a beautiful purple-themed UI with drag-and-drop support, progress tracking, and comprehensive file validation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)

## Features

- **Drag & Drop Support** - Intuitive drag-and-drop interface with visual feedback
- **File Validation** - Built-in validation for file types and sizes
- **Progress Tracking** - Real-time upload progress with percentage display
- **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- **TypeScript Support** - Full type safety with comprehensive type definitions
- **MIME Type Constants** - Pre-defined constants for common file types
- **Customizable** - Flexible props for different use cases
- **Error Handling** - User-friendly error messages
- **Modern UI** - Beautiful purple-themed design with smooth animations

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/file-upload-component.git

# Navigate to project directory
cd file-upload-component

# Install dependencies
npm install

# Start development server
npm run dev
```

## Quick Start

```tsx
import FileUpload from './component/FileUpload';
import type { UploadResult } from './types';

function App() {
  const handleUpload = async (file: File): Promise<UploadResult> => {
    // Your upload logic here
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      acceptedTypes={['image/*', 'application/pdf']}
      maxFileSize={10 * 1024 * 1024} // 10MB
    />
  );
}
```

## Usage with Type Constants

The component exports helpful constants for file types and sizes:

```tsx
import FileUpload from './component/FileUpload';
import { ACCEPT_TYPES, FILE_SIZE_LIMITS, MIME_TYPES } from './types';

function App() {
  return (
    <FileUpload
      onUpload={handleUpload}
      acceptedTypes={ACCEPT_TYPES.IMAGES}
      maxFileSize={FILE_SIZE_LIMITS.LARGE}
    />
  );
}
```

## API Reference

### FileUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | `(file: File) => Promise<UploadResult>` | **Required** | Upload handler function |
| `acceptedTypes` | `string[]` | `[]` | Array of accepted MIME types |
| `maxFileSize` | `number` | `10485760` (10MB) | Maximum file size in bytes |
| `maxFiles` | `number` | `1` | Maximum number of files |
| `disabled` | `boolean` | `false` | Disable the upload component |

### UploadResult Interface

```typescript
interface UploadResult {
  url: string;      // URL of the uploaded file
  name: string;     // File name
  size: number;     // File size in bytes
}
```

## Type Exports

### MIME_TYPES

Pre-defined MIME type constants:

```typescript
import { MIME_TYPES } from './types';

// Images
MIME_TYPES.IMAGE_JPEG    // 'image/jpeg'
MIME_TYPES.IMAGE_PNG     // 'image/png'
MIME_TYPES.IMAGE_GIF     // 'image/gif'
MIME_TYPES.IMAGE_WEBP    // 'image/webp'
MIME_TYPES.IMAGE_SVG     // 'image/svg+xml'
MIME_TYPES.IMAGE_ALL     // 'image/*'

// Documents
MIME_TYPES.PDF           // 'application/pdf'
MIME_TYPES.DOC           // 'application/msword'
MIME_TYPES.DOCX          // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
MIME_TYPES.XLS           // 'application/vnd.ms-excel'
MIME_TYPES.XLSX          // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// And more...
```

### ACCEPT_TYPES

Common file type combinations:

```typescript
import { ACCEPT_TYPES } from './types';

ACCEPT_TYPES.IMAGES          // [JPEG, PNG, GIF, WebP]
ACCEPT_TYPES.DOCUMENTS       // [PDF, DOC, DOCX]
ACCEPT_TYPES.SPREADSHEETS    // [XLS, XLSX, CSV]
ACCEPT_TYPES.PRESENTATIONS   // [PPT, PPTX]
ACCEPT_TYPES.ARCHIVES        // [ZIP, RAR, 7z]
ACCEPT_TYPES.ALL_IMAGES      // ['image/*']
ACCEPT_TYPES.ALL_AUDIO       // ['audio/*']
ACCEPT_TYPES.ALL_VIDEO       // ['video/*']
```

### FILE_SIZE Constants

```typescript
import { FILE_SIZE, FILE_SIZE_LIMITS } from './types';

// Size units
FILE_SIZE.KB        // 1024
FILE_SIZE.MB        // 1048576
FILE_SIZE.GB        // 1073741824

// Common limits
FILE_SIZE_LIMITS.SMALL    // 2MB
FILE_SIZE_LIMITS.MEDIUM   // 10MB
FILE_SIZE_LIMITS.LARGE    // 50MB
FILE_SIZE_LIMITS.XLARGE   // 100MB
```

## Examples

### Accept Only Images

```tsx
import { ACCEPT_TYPES, FILE_SIZE_LIMITS } from './types';

<FileUpload
  onUpload={handleUpload}
  acceptedTypes={ACCEPT_TYPES.IMAGES}
  maxFileSize={FILE_SIZE_LIMITS.MEDIUM}
/>
```

### Accept Documents Only

```tsx
import { ACCEPT_TYPES } from './types';

<FileUpload
  onUpload={handleUpload}
  acceptedTypes={ACCEPT_TYPES.DOCUMENTS}
  maxFileSize={5 * 1024 * 1024} // 5MB
/>
```

### Custom File Types

```tsx
import { MIME_TYPES } from './types';

<FileUpload
  onUpload={handleUpload}
  acceptedTypes={[
    MIME_TYPES.PDF,
    MIME_TYPES.DOCX,
    MIME_TYPES.IMAGE_PNG
  ]}
  maxFileSize={20 * 1024 * 1024} // 20MB
/>
```

### Multiple Files (Future Enhancement)

```tsx
<FileUpload
  onUpload={handleUpload}
  acceptedTypes={ACCEPT_TYPES.ALL_IMAGES}
  maxFiles={5}
  maxFileSize={FILE_SIZE_LIMITS.LARGE}
/>
```

## Component Features

### Responsive Design

The component automatically adapts to different screen sizes:

- **Mobile (≤640px)**: Full-width layout with optimized spacing
- **Tablet (641-1024px)**: 90% width with comfortable padding
- **Desktop (>1024px)**: Maximum 600px width, centered

### File Validation

Automatic validation for:
- File type checking against accepted types
- File size validation with user-friendly error messages
- Visual error feedback

### Upload States

The component handles multiple states:
- **Idle**: Ready to accept files
- **Selected**: File selected, ready to upload
- **Uploading**: Active upload with progress
- **Success**: Upload completed successfully
- **Error**: Upload failed with error message

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Tech Stack

- **React** 18.3+
- **TypeScript** 5.6+
- **Vite** 6.0+
- **CSS3** with responsive design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Project Structure

```
src/
├── component/
│   └── FileUpload.tsx      # Main upload component
├── types/
│   └── index.ts            # TypeScript definitions & constants
├── App.tsx                 # Demo application
├── App.css                 # Application styles
└── index.css               # Global styles
```

## Customization

The component uses inline styles for consistency but can be customized by:

1. Modifying the component's inline styles
2. Adjusting the color scheme (currently purple-themed)
3. Changing responsive breakpoints
4. Adding custom validation logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this component in your projects.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React and TypeScript
