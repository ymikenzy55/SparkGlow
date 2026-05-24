import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FiMail, FiTrash2, FiCheck, FiX, FiSend, FiCornerDownRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

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

  const sendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty')
      return
    }
    setSendingReply(true)
    try {
      const res = await adminAPI.replyToMessage(selectedMessage._id, replyText)
      toast.success('Reply sent')
      // Update selected message with new reply
      const updated = res.data.message
      setSelectedMessage(updated)
      // Update messages list
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m))
      setReplyText('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setSendingReply(false)
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
                      onClick={() => { setSelectedMessage(msg); setReplyText(''); if (!msg.read) markAsRead(msg._id) }}
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

                {/* Existing Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Your Replies ({selectedMessage.replies.length})
                    </h4>
                    <div className="msg-reply-thread">
                      {selectedMessage.replies.map((reply, i) => (
                        <div key={i} className="msg-reply-bubble">
                          <div className="msg-reply-meta">
                            <FiCornerDownRight size={12} />
                            Admin • {formatDate(reply.createdAt)}
                          </div>
                          <div className="msg-reply-text">{reply.body}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="msg-reply-form" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark)' }}>
                    {selectedMessage.replies && selectedMessage.replies.length > 0 ? 'Send another reply' : 'Reply to customer'}
                  </label>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Type your reply to ${selectedMessage.name}...`}
                    rows={4}
                    disabled={sendingReply}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FiSend size={14} />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
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
