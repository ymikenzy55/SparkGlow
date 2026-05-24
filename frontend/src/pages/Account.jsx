import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiShoppingBag, FiLock, FiLogOut, FiMessageSquare, FiDownload, FiPackage, FiX, FiMail, FiEye } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { authAPI, orderAPI, messageAPI } from '../services/api'
import { formatCedi } from '../utils/currency'
import { getImageUrl } from '../utils/imageUrl'
import Breadcrumb from '../components/common/Breadcrumb'

export default function Account() {
  const { user, logout, updateUser } = useAuth()
  const { socket } = useSocket()
  const { tab: urlTab } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(urlTab || 'orders')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || {} })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [messageForm, setMessageForm] = useState({ subject: '', body: '' })
  const [saving, setSaving] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(null)
  const [followUpOrder, setFollowUpOrder] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({ subject: '', body: '' })
  const [sendingFollowUp, setSendingFollowUp] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(null)

  // Update tab when URL changes
  useEffect(() => {
    if (urlTab) {
      setTab(urlTab)
    }
  }, [urlTab])

  // Navigate when tab changes
  const changeTab = (newTab) => {
    setTab(newTab)
    navigate(`/account/${newTab}`)
  }

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true)
      orderAPI.getMyOrders().then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setOrdersLoading(false))
    }
  }, [tab])

  // Real-time order status updates
  useEffect(() => {
    if (!socket) return

    const handleOrderStatusChanged = (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
        )
      )
      toast.success('Order status updated!')
    }

    socket.on('order-status-changed', handleOrderStatusChanged)

    return () => {
      socket.off('order-status-changed', handleOrderStatusChanged)
    }
  }, [socket])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(profileForm)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    setSaving(false)
  }

  const savePw = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    setSaving(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await messageAPI.send({ name: user.name, email: user.email, subject: messageForm.subject, body: messageForm.body })
      toast.success('Message sent successfully!')
      setMessageForm({ subject: '', body: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send message') }
    setSaving(false)
  }

  const sendFollowUpMessage = async (e) => {
    e.preventDefault()
    setSendingFollowUp(true)
    try {
      const subject = `Follow-up on Order #${followUpOrder._id.slice(-8).toUpperCase()}`
      await messageAPI.send({ 
        name: user.name, 
        email: user.email, 
        subject, 
        body: followUpForm.body 
      })
      toast.success('Follow-up message sent!')
      setFollowUpOrder(null)
      setFollowUpForm({ subject: '', body: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send message') }
    setSendingFollowUp(false)
  }

  const downloadReceipt = (order) => {
    const receiptContent = `
SPARKGLOW RECEIPT
=====================================
Order ID: ${order._id.slice(-8).toUpperCase()}
Date: ${new Date(order.createdAt).toLocaleString()}

Customer Information:
Name: ${order.customerInfo?.name || user?.name || 'N/A'}
Email: ${order.customerInfo?.email || user?.email || 'N/A'}
Phone: ${order.customerInfo?.phone || 'N/A'}

Delivery Address:
Region: ${order.shippingAddress?.region || order.customerInfo?.region || 'N/A'}
Location: ${order.shippingAddress?.location || order.customerInfo?.location || 'N/A'}

Items Ordered:
${order.items.map(item => `- ${item.name} x${item.quantity} - ${formatCedi(item.price * item.quantity)}`).join('\n')}

Order Summary:
Subtotal: ${formatCedi(order.subtotal)}
Shipping: ${formatCedi(order.shipping)}
Total: ${formatCedi(order.total)}

Payment Method: ${order.paymentMethod.toUpperCase()}
Payment Status: ${order.paymentStatus.toUpperCase()}
Order Status: ${order.status.toUpperCase()}

Thank you for shopping with SparkGlow!
=====================================
    `
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SparkGlow-Receipt-${order._id.slice(-8).toUpperCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Receipt downloaded!')
  }

  const getOrderProgress = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = steps.indexOf(status)
    return currentIndex === -1 ? 0 : ((currentIndex + 1) / steps.length) * 100
  }

  const statusClass = (s) => ({ pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' }[s] || 'status-pending')

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <Breadcrumb />
      <h2 style={{ marginBottom: '28px' }}>My <span style={{ color: 'var(--primary)' }}>Account</span></h2>
      <div className="account-grid">
        <div className="account-sidebar">
          <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #9c27b0)', color: '#fff', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{user?.name[0]?.toUpperCase()}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{user?.email}</div>
          </div>
          <button className={`account-nav-item ${tab === 'orders' ? 'active' : ''}`} onClick={() => changeTab('orders')}><FiShoppingBag /> My Orders</button>
          <button className={`account-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => changeTab('profile')}><FiUser /> Edit Profile</button>
          <button className={`account-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => changeTab('password')}><FiLock /> Change Password</button>
          <button className={`account-nav-item ${tab === 'message' ? 'active' : ''}`} onClick={() => changeTab('message')}><FiMessageSquare /> Send Message</button>
          <button className="account-nav-item" style={{ color: '#e53935' }} onClick={logout}><FiLogOut /> Logout</button>
        </div>
        <motion.div className="account-content" key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'orders' && (
            <>
              <h2>My Orders</h2>
              {ordersLoading ? <div style={{ padding: '40px', textAlign: 'center' }}>Loading…</div> : orders.length === 0 ? (
                <p style={{ color: 'var(--text-light)' }}>No orders yet. <a href="/shop" style={{ color: 'var(--primary)' }}>Start shopping!</a></p>
              ) : (
                orders.map(order => (
                  <div 
                    key={order._id} 
                    className="order-card"
                    onClick={() => setShowOrderDetail(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="order-card-header">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                        <div className="order-id">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`order-status ${statusClass(order.status)}`}>{order.status}</span>
                        <button 
                          className="btn btn-sm" 
                          style={{ background: 'var(--bg-light)', padding: '6px 12px' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(selectedOrder?._id === order._id ? null : order) }}
                        >
                          <FiPackage size={14} /> {selectedOrder?._id === order._id ? 'Hide' : 'Track'}
                        </button>
                        <button 
                          className="btn btn-sm" 
                          style={{ background: 'var(--bg-light)', padding: '6px 12px' }}
                          onClick={(e) => { e.stopPropagation(); setShowReceiptModal(order) }}
                        >
                          <FiMail size={14} /> View Receipt
                        </button>
                        <button 
                          className="btn btn-sm" 
                          style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px' }}
                          onClick={(e) => { e.stopPropagation(); downloadReceipt(order) }}
                        >
                          <FiDownload size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {selectedOrder?._id === order._id && (
                      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', fontWeight: 600 }}>Order Tracking</h4>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            <span>Pending</span>
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                          <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: `${getOrderProgress(order.status)}%`, transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                          <strong>Items:</strong> {order.items.map(item => item.name).join(', ')}
                        </div>
                        <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                          <strong>Delivery:</strong> {order.shippingAddress?.region || order.customerInfo?.region}, {order.shippingAddress?.location || order.customerInfo?.location}
                        </div>
                        {order.trackingNumber && (
                          <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                            <strong>Tracking #:</strong> {order.trackingNumber}
                          </div>
                        )}
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ marginTop: '12px' }} 
                          onClick={(e) => { e.stopPropagation(); setFollowUpOrder(order); setFollowUpForm({ subject: '', body: '' }) }}
                        >
                          <FiMessageSquare size={14} /> Send Follow-up Message
                        </button>
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '8px' }}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCedi(order.total)}</div>
                  </div>
                ))
              )}
            </>
          )}
          {tab === 'profile' && (
            <>
              <h2>Edit Profile</h2>
              <form onSubmit={saveProfile}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">City</label><input className="form-input" value={profileForm.address?.city || ''} onChange={e => setProfileForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} /></div>
                  <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={profileForm.address?.country || ''} onChange={e => setProfileForm(f => ({ ...f, address: { ...f.address, country: e.target.value } }))} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </form>
            </>
          )}
          {tab === 'password' && (
            <>
              <h2>Change Password</h2>
              <form onSubmit={savePw}>
                <div className="form-group"><label className="form-label">Current Password</label><input required type="password" className="form-input" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">New Password</label><input required type="password" className="form-input" minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Changing…' : 'Change Password'}</button>
              </form>
            </>
          )}
          {tab === 'message' && (
            <>
              <h2>Send Us a Message</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '0.875rem' }}>Have a question or feedback? We'd love to hear from you!</p>
              <form onSubmit={sendMessage}>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input 
                    required 
                    className="form-input" 
                    placeholder="What's this about?" 
                    value={messageForm.subject} 
                    onChange={e => setMessageForm(f => ({ ...f, subject: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea 
                    required 
                    className="form-input" 
                    rows={6} 
                    placeholder="Tell us more..." 
                    value={messageForm.body} 
                    onChange={e => setMessageForm(f => ({ ...f, body: e.target.value }))} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="modal-overlay" onClick={() => setShowOrderDetail(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button onClick={() => setShowOrderDetail(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Order Information</h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <strong>Order ID:</strong>
                    <span>#{showOrderDetail._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <strong>Date:</strong>
                    <span>{new Date(showOrderDetail.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <strong>Status:</strong>
                    <span className={`order-status ${statusClass(showOrderDetail.status)}`}>{showOrderDetail.status}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Customer Information</h4>
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Name:</strong> {showOrderDetail.customerInfo?.name || user?.name || 'N/A'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Email:</strong> {showOrderDetail.customerInfo?.email || user?.email || 'N/A'}</div>
                  {showOrderDetail.customerInfo?.phone && <div><strong>Phone:</strong> {showOrderDetail.customerInfo.phone}</div>}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Items</h4>
                {showOrderDetail.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: i < showOrderDetail.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <img src={getImageUrl(item.image)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCedi(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Subtotal:</span>
                  <span>{formatCedi(showOrderDetail.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Shipping:</span>
                  <span>{showOrderDetail.shipping === 0 ? 'FREE' : formatCedi(showOrderDetail.shipping)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem' }}>
                  <span>Total:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCedi(showOrderDetail.total)}</span>
                </div>
              </div>

              {showOrderDetail.notes && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Order Notes</h4>
                  <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {showOrderDetail.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(null)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Receipt</h3>
              <button onClick={() => setShowReceiptModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img src="/logo.png" alt="SparkGlow" style={{ height: '50px', marginBottom: '8px' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>SparkGlow</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-light)' }}>Your Receipt</p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <strong>Order ID:</strong>
                  <span>#{showReceiptModal._id.slice(-8).toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <strong>Date:</strong>
                  <span>{new Date(showReceiptModal.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <strong>Status:</strong>
                  <span className={`order-status ${statusClass(showReceiptModal.status)}`}>{showReceiptModal.status}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Customer Information</h4>
                <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Name:</strong> {showReceiptModal.customerInfo?.name || user?.name || 'N/A'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Email:</strong> {showReceiptModal.customerInfo?.email || user?.email || 'N/A'}</div>
                  {showReceiptModal.customerInfo?.phone && <div><strong>Phone:</strong> {showReceiptModal.customerInfo.phone}</div>}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Items</h4>
                {showReceiptModal.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: i < showReceiptModal.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <img src={getImageUrl(item.image)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCedi(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Subtotal:</span>
                  <span>{formatCedi(showReceiptModal.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Shipping:</span>
                  <span>{showReceiptModal.shipping === 0 ? 'FREE' : formatCedi(showReceiptModal.shipping)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem' }}>
                  <span>Total:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCedi(showReceiptModal.total)}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => downloadReceipt(showReceiptModal)}>
                  <FiDownload size={14} /> Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Message Modal */}
      {followUpOrder && (
        <div className="modal-overlay" onClick={() => setFollowUpOrder(null)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Follow-up Message</h3>
              <button onClick={() => setFollowUpOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                Sending message for Order #<strong>{followUpOrder._id.slice(-8).toUpperCase()}</strong>
              </p>
              <form onSubmit={sendFollowUpMessage}>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea 
                    required 
                    className="form-input" 
                    rows={5} 
                    placeholder="Write your message here..." 
                    value={followUpForm.body} 
                    onChange={e => setFollowUpForm(f => ({ ...f, body: e.target.value }))} 
                  />
                </div>
                <div className="modal-footer" style={{ padding: '0', marginTop: '20px' }}>
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => setFollowUpOrder(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={sendingFollowUp}>
                    {sendingFollowUp ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
