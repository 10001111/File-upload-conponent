import './App.css'
import JobApplicationForm from './component/JobApplicationForm'

function App() {
  return (
    <div className="app" style={{
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '2rem 1rem',
    }}>
      <main className="app-main">
        <JobApplicationForm />
      </main>
    </div>
  )
}

export default App
