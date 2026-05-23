import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FiMail, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => {
    setLoading(true)
    adminAPI.getMessages()
      .then(r => setMessages(r.data.messages))
      .catch(err => toast.error('Failed to load messages'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markAsRead = async (id) => {
    try {
      await adminAPI.markMessageRead(id)
      load()
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const deleteMessage = async (id) => {
    try {
      await adminAPI.deleteMessage(id)
      toast.success('Message deleted')
      setConfirmDelete(null)
      setSelectedMessage(null)
      load()
    } catch {
      toast.error('Failed to delete message')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Messages ({messages.length})</h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
            {messages.filter(m => !m.read).length} unread
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="messages-layout">
            <div className={`messages-list ${selectedMessage ? 'has-selected' : ''}`}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                  No messages yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.map(msg => (
                    <div
                      key={msg._id}
                      onClick={() => { setSelectedMessage(msg); if (!msg.read) markAsRead(msg._id) }}
                      style={{
                        padding: '16px',
                        background: msg.read ? 'var(--bg-card)' : 'var(--primary-light)',
                        border: `1px solid ${selectedMessage?._id === msg._id ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <FiMail size={16} color={msg.read ? 'var(--text-light)' : 'var(--primary)'} style={{ flexShrink: 0 }} />
                          <strong style={{ fontSize: '0.9rem', fontWeight: msg.read ? 500 : 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {msg.name}
                          </strong>
                        </div>
                        {!msg.read && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'block',
                            flexShrink: 0
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.email}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMessage && (
              <div className="message-detail">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="message-close-btn"
                >
                  <FiX size={18} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', wordWrap: 'break-word' }}>{selectedMessage.subject}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    <div style={{ wordWrap: 'break-word' }}><strong>From:</strong> {selectedMessage.name}</div>
                    <div style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}><strong>Email:</strong> {selectedMessage.email}</div>
                    <div><strong>Date:</strong> {formatDate(selectedMessage.createdAt)}</div>
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'var(--bg-light)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}>
                  {selectedMessage.body}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {!selectedMessage.read && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => markAsRead(selectedMessage._id)}
                    >
                      <FiCheck size={14} /> Mark as Read
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirmDelete(selectedMessage)}
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Message"
          message={`Are you sure you want to delete this message from ${confirmDelete.name}?`}
          onConfirm={() => deleteMessage(confirmDelete._id)}
          onClose={() => setConfirmDelete(null)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  )
}
