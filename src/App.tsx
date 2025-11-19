import './App.css'
import FileUpload from './component/FileUpload'
import type { UploadResult } from './types'

function App() {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>File Upload Component</h1>
        <p>Drag and drop a file or click to browse</p>
      </header>

      <main className="app-main">
        <FileUpload
          onUpload={handleUpload}
          acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']}
          maxFileSize={10 * 1024 * 1024} // 10MB
        />
      </main>
    </div>
  )
}

export default App
