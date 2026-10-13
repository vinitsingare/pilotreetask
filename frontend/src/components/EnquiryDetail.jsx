import { useState } from 'react'
import AnalysisResult from './AnalysisResult'

function EnquiryDetail({ enquiry, onBack, apiBase }) {
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const formatStatus = (status) => status.replace(/_/g, ' ')

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/enquiries/${enquiry.id}/analyze`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Analysis failed')
      }
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="enquiry-detail">
      <button className="back-btn" onClick={onBack}>
        ← Back to all enquiries
      </button>

      <div className="detail-card">
        <div className="detail-card-header">
          <h2>{enquiry.id}</h2>
          <span className={`status-badge status-${enquiry.status}`}>
            {formatStatus(enquiry.status)}
          </span>
        </div>

        <div className="detail-card-body">
          <div className="detail-fields">
            <div className="detail-field">
              <label>Company</label>
              <span>{enquiry.company}</span>
            </div>
            <div className="detail-field">
              <label>Contact Name</label>
              <span>{enquiry.name || 'N/A'}</span>
            </div>
            <div className="detail-field">
              <label>Email</label>
              <span>{enquiry.email}</span>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <span className={`status-badge status-${enquiry.status}`}>
                {formatStatus(enquiry.status)}
              </span>
            </div>
          </div>

          <div className="detail-message">
            <label>Customer Message</label>
            <p>{enquiry.message}</p>
          </div>

          <button
            className={`analyze-btn ${analyzing ? 'loading' : ''}`}
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? '⏳ Analyzing...' : '🤖 Analyze with AI'}
          </button>

          {error && <div className="analyze-error">❌ {error}</div>}

          {analysis && (
            <AnalysisResult
              analysis={analysis}
              enquiry={enquiry}
              apiBase={apiBase}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default EnquiryDetail
