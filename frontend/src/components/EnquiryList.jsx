function EnquiryList({ enquiries, onSelect }) {
  const formatStatus = (status) => status.replace(/_/g, ' ')

  return (
    <div>
      <div className="enquiry-list-header">
        <h2>All Enquiries</h2>
        <span className="enquiry-count">{enquiries.length} enquiries</span>
      </div>

      <div className="enquiry-list">
        {enquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            className="enquiry-card"
            onClick={() => onSelect(enquiry)}
          >
            <div className="enquiry-card-id">{enquiry.id}</div>

            <div className="enquiry-card-content">
              <div className="enquiry-card-top">
                <span className="enquiry-card-company">{enquiry.company}</span>
                {enquiry.name && (
                  <span className="enquiry-card-name">• {enquiry.name}</span>
                )}
                <span className={`status-badge status-${enquiry.status}`}>
                  {formatStatus(enquiry.status)}
                </span>
              </div>
              <div className="enquiry-card-message">{enquiry.message}</div>
            </div>

            <span className="enquiry-card-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EnquiryList
