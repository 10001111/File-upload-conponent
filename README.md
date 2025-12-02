# File Upload Component - Job Application Form

A modern, production-ready job application form built with React and TypeScript. Features a beautiful UI with drag-and-drop file uploads, client-side storage using IndexedDB, and comprehensive form validation. Deployed on Vercel with full responsive design.

🌐 **Live Demo**: [https://file-upload-conponent.vercel.app/](https://file-upload-conponent.vercel.app/)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg)

## ✨ Features

### 🎯 Core Functionality
- **📋 Job Application Form** - Complete form with Name, Email, Phone, and Available Date fields
- **📤 Drag & Drop File Upload** - Intuitive drag-and-drop interface with visual feedback
- **💾 Client-Side Storage** - Files stored locally using IndexedDB and localStorage (no backend required)
- **📁 Recent Files Display** - View, download, and manage recently uploaded files
- **🔄 Minimizable Section** - Collapsible recent files panel to save screen space

### 🛡️ Validation & Security
- **✅ Form Validation** - Comprehensive validation for all form fields
- **📄 File Type Validation** - Accepts only DOC, DOCX, and PDF files
- **📏 File Size Limits** - Maximum 25MB per file, up to 2 files total
- **📧 Email Validation** - RFC 5322 compliant email validation
- **📱 Phone Validation** - Supports multiple phone number formats

### 🎨 User Experience
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop devices
- **⚡ Real-time Updates** - Files appear instantly in recent files section
- **🎭 Smooth Animations** - Beautiful transitions and hover effects
- **🔍 Error Handling** - User-friendly error messages with inline validation
- **💡 Visual Feedback** - Loading states, success messages, and progress indicators

### 🛠️ Technical Features
- **🔷 TypeScript** - Full type safety with comprehensive type definitions
- **💾 IndexedDB Integration** - Efficient client-side file storage for large files
- **🔄 State Management** - React hooks for efficient state handling
- **♿ Accessibility** - ARIA labels and keyboard navigation support
- **🚀 Performance Optimized** - Fast load times and efficient rendering

## 🚀 Live Demo

**Visit the deployed application**: [https://file-upload-conponent.vercel.app/](https://file-upload-conponent.vercel.app/)

The application is fully functional with:
- ✅ File upload and storage
- ✅ Form validation
- ✅ Recent files management
- ✅ Responsive design
- ✅ All features working in production

## 📦 Installation

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

The application will be available at `http://localhost:5173`

## 🎯 Project Highlights

### What Makes This Project Special

1. **No Backend Required** - Fully client-side application using IndexedDB for file storage
2. **Production Ready** - Deployed and working on Vercel
3. **User-Specific Storage** - Files stored locally per browser/device (privacy-focused)
4. **Complete Job Application Form** - Real-world use case implementation
5. **Modern React Patterns** - Uses latest React 19 features and best practices
6. **Type-Safe** - Comprehensive TypeScript implementation
7. **Responsive Design** - Works seamlessly on all devices

### Key Components

- **JobApplicationForm** - Main form component with validation
- **RecentFiles** - Displays and manages uploaded files
- **MockStorage** - Client-side storage utility (IndexedDB + localStorage)
- **FileUpload** - Reusable file upload component

## 💻 Usage Example

The project includes a complete job application form:

```tsx
import JobApplicationForm from './component/JobApplicationForm';

function App() {
  return (
    <div>
      <RecentFiles />
      <JobApplicationForm />
    </div>
  );
}
```

Files are automatically stored in IndexedDB and can be viewed, downloaded, or deleted from the Recent Files section.

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

## 🛠️ Tech Stack & Skills Demonstrated

### Frontend Technologies
- **React 19.2** - Latest React with hooks and modern patterns
- **TypeScript 5.9** - Full type safety and advanced type features
- **Vite 7.2** - Lightning-fast build tool and dev server
- **CSS3** - Custom responsive design with modern CSS features

### Storage & State Management
- **IndexedDB** - Client-side database for file blob storage
- **localStorage** - Metadata storage for quick access
- **React Hooks** - useState, useEffect, useRef for state management

### Development Tools
- **ESLint** - Code quality and linting
- **TypeScript Compiler** - Type checking and compilation
- **Git** - Version control

### Deployment & DevOps
- **Vercel** - Production deployment and hosting
- **GitHub** - Source code management and CI/CD integration

### Skills Showcased
- ✅ **React Development** - Component architecture, hooks, state management
- ✅ **TypeScript** - Type definitions, interfaces, type safety
- ✅ **Responsive Design** - Mobile-first approach with breakpoints
- ✅ **Client-Side Storage** - IndexedDB and localStorage implementation
- ✅ **Form Handling** - Validation, error handling, user feedback
- ✅ **File Management** - Upload, download, view, delete operations
- ✅ **UI/UX Design** - Modern, clean interface with smooth animations
- ✅ **Performance Optimization** - Efficient rendering and storage management
- ✅ **Deployment** - Production deployment on Vercel
- ✅ **Code Quality** - Clean code, error handling, accessibility

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Note**: IndexedDB is required for file storage. All modern browsers support it.

## 🚀 Deployment

This project is deployed on **Vercel**:
- **Live URL**: [https://file-upload-conponent.vercel.app/](https://file-upload-conponent.vercel.app/)
- **Deployment**: Automatic via GitHub integration
- **Build**: `npm run build`
- **Framework**: Vite + React

See `DEPLOYMENT.md` for detailed deployment instructions.

## 📁 Project Structure

```
src/
├── component/
│   ├── FileUpload.tsx          # Reusable file upload component
│   ├── JobApplicationForm.tsx  # Main job application form
│   └── RecentFiles.tsx         # Recent files display component
├── utils/
│   └── mockStorage.ts          # IndexedDB & localStorage utility
├── types/
│   └── index.ts                # TypeScript definitions & constants
├── App.tsx                     # Main application component
├── App.css                     # Application styles
├── index.css                   # Global styles
└── main.tsx                    # Application entry point
```

## 🎓 Learning Outcomes

This project demonstrates:

- **Advanced React Patterns** - Custom hooks, state management, component composition
- **TypeScript Mastery** - Interfaces, types, generics, type safety
- **Client-Side Storage** - IndexedDB API, localStorage, blob handling
- **Form Handling** - Validation, error states, user feedback
- **Responsive Design** - Mobile-first CSS, breakpoints, flexible layouts
- **Performance** - Efficient rendering, lazy loading, optimization
- **Deployment** - Vercel deployment, CI/CD, production optimization
- **Code Quality** - Clean code principles, error handling, accessibility

## Customization

The component uses inline styles for consistency but can be customized by:

1. Modifying the component's inline styles
2. Adjusting the color scheme (currently purple-themed)
3. Changing responsive breakpoints
4. Adding custom validation logic

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this component in your projects.

## 📧 Contact & Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Deployed on Vercel
- Uses IndexedDB for client-side storage

---

**🌐 Live Demo**: [https://file-upload-conponent.vercel.app/](https://file-upload-conponent.vercel.app/)

Built with ❤️ using React, TypeScript, and modern web technologies
