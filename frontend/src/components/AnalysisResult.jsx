import { useState, useRef } from 'react'

function AnalysisResult({ analysis, enquiry, apiBase }) {
  const priorityClass = `priority-${(analysis.priority || '').toLowerCase()}`
  const composerRef = useRef(null)

  // State for email generation and composition
  const [isEmailGenerated, setIsEmailGenerated] = useState(false)
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleGenerateEmail = () => {
    const recipient =
      enquiry?.email && enquiry.email !== 'not-an-email'
        ? enquiry.email
        : enquiry?.email || ''
    const generatedSubject = `Regarding Your Inquiry [${enquiry?.id || 'Ref'}] - Additional Information Required`
    const generatedBody =
      analysis.suggested_reply ||
      `Dear ${enquiry?.name || 'Customer'},\n\nThank you for reaching out to us regarding your inquiry (${enquiry?.id || ''}).\n\nTo help us assist you as quickly as possible, could you please provide a few additional details?\n${(analysis.suggested_questions || []).map((q) => `• ${q}`).join('\n')}\n\nBest regards,\nCustomer Support Team`

    setToEmail(recipient)
    setSubject(generatedSubject)
    setEmailBody(generatedBody)
    setIsEmailGenerated(true)
    setSendResult(null)

    // Automatically copy to clipboard if supported
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedBody).catch(() => {})
    }

    showToast('✉️ Email generated and automatically pasted into composer!')

    // Scroll smoothly to composer
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handlePasteEmail = () => {
    const textToPaste = analysis.suggested_reply || ''
    setEmailBody(textToPaste)
    showToast('📋 Generated email pasted into editor!')
  }

  const handleCopyEmail = () => {
    if (!emailBody) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(emailBody)
      showToast('📋 Copied email to clipboard!')
    }
  }

  const handleSendEmail = async (e) => {
    if (e) e.preventDefault()
    if (!toEmail.trim() || !toEmail.includes('@')) {
      setSendResult({
        status: 'error',
        message: 'Please provide a valid recipient email address.',
      })
      return
    }
    if (!subject.trim()) {
      setSendResult({
        status: 'error',
        message: 'Email subject cannot be empty.',
      })
      return
    }
    if (!emailBody.trim()) {
      setSendResult({
        status: 'error',
        message: 'Email message cannot be empty.',
      })
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      const res = await fetch(`${apiBase || 'http://localhost:8000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: toEmail.trim(),
          subject: subject.trim(),
          body: emailBody.trim(),
          enquiry_id: enquiry?.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to send email.')
      }

      setSendResult({
        status: 'success',
        message: data.message || `Email sent successfully to ${toEmail}`,
        messageId: data.message_id,
        provider: data.provider,
        details: data.details,
        timestamp: new Date().toLocaleTimeString(),
      })
    } catch (err) {
      setSendResult({
        status: 'error',
        message: err.message || 'An error occurred while sending the email.',
      })
    } finally {
      setIsSending(false)
    }
  }

  const mailtoLink = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(emailBody)}`

  const renderExtractedDetails = () => {
    if (!analysis.extracted_details) return <p>No details extracted</p>
    const entries = Object.entries(analysis.extracted_details).filter(
      ([, v]) => v !== null && v !== undefined
    )
    if (entries.length === 0)
      return <p>No specific details found in the message</p>
    return (
      <div className="extracted-details">
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: 'contents' }}>
            <span className="detail-key">{key.replace(/_/g, ' ')}</span>
            <span className="detail-value">{String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderList = (items) => {
    if (!items || items.length === 0)
      return <p style={{ color: '#999' }}>None</p>
    return (
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="analysis-result">
      <h3>✨ AI Analysis</h3>

      <div className="analysis-grid">
        {/* Summary */}
        <div className="analysis-card full-width">
          <h4>Summary</h4>
          <p>{analysis.summary}</p>
        </div>

        {/* Category */}
        <div className="analysis-card">
          <h4>Category</h4>
          <span className="category-badge">{analysis.category}</span>
        </div>

        {/* Priority */}
        <div className="analysis-card">
          <h4>Priority</h4>
          <span className={`priority-badge ${priorityClass}`}>
            {analysis.priority}
          </span>
        </div>

        {/* Customer Intent */}
        <div className="analysis-card full-width">
          <h4>Customer Intent</h4>
          <p>{analysis.customer_intent}</p>
        </div>

        {/* Extracted Details */}
        <div className="analysis-card full-width">
          <h4>Extracted Details</h4>
          {renderExtractedDetails()}
        </div>

        {/* Missing Information */}
        <div className="analysis-card full-width">
          <h4>Missing Information</h4>
          {renderList(analysis.missing_information)}
        </div>

        {/* Recommended Action */}
        <div className="analysis-card full-width">
          <h4>Recommended Action</h4>
          <p>{analysis.recommended_action}</p>
        </div>

        {/* Suggested Questions */}
        <div className="analysis-card full-width">
          <h4>Suggested Questions</h4>
          {renderList(analysis.suggested_questions)}

          {/* Action Button: Generate Email for Missing Information */}
          <div className="action-button-wrapper">
            <button
              className="generate-email-btn"
              onClick={handleGenerateEmail}
            >
              ✉️ Generate Email for Missing Information
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">{toastMessage}</div>
      )}

      {/* Automated Email Section */}
      {isEmailGenerated && (
        <div className="email-composer-section" ref={composerRef}>
          <div className="email-composer-header">
            <div>
              <h4>✉️ Email Composer — Missing Information Request</h4>
              <p className="email-composer-subtitle">
                Automated draft populated from AI analysis • Review, edit, and send
              </p>
            </div>
            <button
              className="close-composer-btn"
              onClick={() => setIsEmailGenerated(false)}
              title="Close composer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="email-form">
            {/* Recipient */}
            <div className="email-form-group">
              <label htmlFor="toEmail">
                To whom I have to send <span className="req">*</span>
              </label>
              <input
                id="toEmail"
                type="text"
                className="email-input"
                placeholder="customer@example.com"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                required
              />
              {toEmail && !toEmail.includes('@') && (
                <span className="email-field-hint warning">
                  ⚠️ Please enter a valid recipient email address.
                </span>
              )}
            </div>

            {/* Subject */}
            <div className="email-form-group">
              <label htmlFor="emailSubject">
                Subject <span className="req">*</span>
              </label>
              <input
                id="emailSubject"
                type="text"
                className="email-input"
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Email Body */}
            <div className="email-form-group">
              <div className="email-body-header">
                <label htmlFor="emailBody">
                  Email Body <span className="req">*</span>
                </label>
                <div className="email-toolbar-actions">
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={handlePasteEmail}
                    title="Paste AI generated email draft automatically"
                  >
                    📋 Paste Email
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={handleCopyEmail}
                    title="Copy email to clipboard"
                  >
                    📄 Copy
                  </button>
                </div>
              </div>
              <textarea
                id="emailBody"
                className="email-textarea"
                rows={9}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email here..."
                required
              />
            </div>

            {/* Result Alerts */}
            {sendResult?.status === 'success' && (
              <div className="email-alert success">
                <div className="alert-title">
                  ✅ {sendResult.message}
                </div>
                <div className="alert-meta">
                  <span><strong>Tracking ID:</strong> {sendResult.messageId}</span>
                  <span><strong>Delivered via:</strong> {sendResult.provider}</span>
                  {sendResult.timestamp && <span><strong>Sent at:</strong> {sendResult.timestamp}</span>}
                </div>
                <p className="alert-note">{sendResult.details}</p>
              </div>
            )}

            {sendResult?.status === 'error' && (
              <div className="email-alert error">
                ❌ {sendResult.message}
              </div>
            )}

            {/* Actions Bar */}
            <div className="email-actions-bar">
              <button
                type="submit"
                className={`send-email-btn ${isSending ? 'loading' : ''}`}
                disabled={isSending}
              >
                {isSending ? '⏳ Sending Email...' : '🚀 Send Email'}
              </button>

              <a
                href={mailtoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mailto-btn"
                title="Open in your default mail application (Outlook, Apple Mail, etc.)"
              >
                📬 Open in Mail App
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AnalysisResult
