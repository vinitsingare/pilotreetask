import { useState, useEffect } from 'react'
import EnquiryList from './components/EnquiryList'
import EnquiryDetail from './components/EnquiryDetail'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [enquiries, setEnquiries] = useState([])
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/enquiries`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        setEnquiries(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load enquiries. Is the backend running?')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="center-message">Loading enquiries...</div>
  if (error) return <div className="center-message error">{error}</div>

  return (
    <div className="app">
      <header className="header">
        <h1>📦 Pilotree</h1>
        <p>Customer Inquiry Management</p>
      </header>

      <main className="main">
        {selectedEnquiry ? (
          <EnquiryDetail
            enquiry={selectedEnquiry}
            onBack={() => setSelectedEnquiry(null)}
            apiBase={API_BASE}
          />
        ) : (
          <EnquiryList enquiries={enquiries} onSelect={setSelectedEnquiry} />
        )}
      </main>
    </div>
  )
}

export default App
