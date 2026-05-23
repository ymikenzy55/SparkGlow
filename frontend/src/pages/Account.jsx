import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiShoppingBag, FiLock, FiLogOut, FiMessageSquare, FiDownload, FiPackage } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { authAPI, orderAPI, messageAPI } from '../services/api'
import { formatCedi } from '../utils/currency'
import Breadcrumb from '../components/common/Breadcrumb'

export default function Account() {
  const { user, logout, updateUser } = useAuth()
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
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                        <div className="order-id">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`order-status ${statusClass(order.status)}`}>{order.status}</span>
                        <button 
                          className="btn btn-sm" 
                          style={{ background: 'var(--bg-light)', padding: '6px 12px' }}
                          onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        >
                          <FiPackage size={14} /> {selectedOrder?._id === order._id ? 'Hide' : 'Track'}
                        </button>
                        <button 
                          className="btn btn-sm" 
                          style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px' }}
                          onClick={() => downloadReceipt(order)}
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
    </div>
  )
}
