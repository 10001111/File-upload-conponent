import './App.css'
import JobApplicationForm from './component/JobApplicationForm'
import RecentFiles from './component/RecentFiles'

function App() {
  return (
    <div className="app" style={{
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '2rem 1rem',
    }}>
      <main className="app-main">
        <RecentFiles />
        <JobApplicationForm />
      </main>
    </div>
  )
}

export default App
