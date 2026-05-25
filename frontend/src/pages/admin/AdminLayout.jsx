import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiTag, FiMenu, FiX, FiLogOut, FiBell, FiSettings, FiMail, FiExternalLink, FiImage } from 'react-icons/fi'
import { GiCash } from 'react-icons/gi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import ConfirmModal from '../../components/common/ConfirmModal'

const navItems = [
  { to: 'dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: 'products', icon: FiBox, label: 'Products' },
  { to: 'orders', icon: FiShoppingBag, label: 'Orders' },
  { to: 'sales', icon: GiCash, label: 'Sales' },
  { to: 'users', icon: FiUsers, label: 'Users' },
  { to: 'categories', icon: FiTag, label: 'Categories' },
  { to: 'messages', icon: FiMail, label: 'Messages' },
  { to: 'hero-banners', icon: FiImage, label: 'Hero Banners' },
  { to: 'settings', icon: FiSettings, label: 'Settings' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('adminWelcomeSeen')
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem('adminWelcomeSeen', 'true')
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await adminAPI.getNotifications()
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch (err) {
      // Silent fail
    }
  }

  const markAsRead = async (id, link) => {
    try {
      // Mark as read
      await adminAPI.markNotificationRead(id)
      
      // Update local state to remove the notification immediately
      setNotifications(prev => prev.filter(n => n._id !== id))
      setUnreadCount(prev => Math.max(0, prev - 1))
      setShowNotifications(false)
      
      // Navigate to the page
      if (link) {
        if (link.includes('/admin/messages') || link === '/admin/messages') {
          navigate('/admin/messages')
        } else {
          navigate(link)
        }
      }
      
      // Delete notification in background after navigation
      setTimeout(async () => {
        try {
          await adminAPI.deleteNotification(id)
        } catch (err) {
          // Silent fail - notification already removed from UI
        }
      }, 1000)
    } catch (err) {
      toast.error('Failed to process notification')
    }
  }

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead()
      loadNotifications()
    } catch (err) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout from the admin panel?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
      {showWelcome && (
        <>
          <div className="modal-overlay" onClick={() => setShowWelcome(false)} />
          <div className="modal-container">
            <div className="modal-content">
              <button className="modal-close-btn" onClick={() => setShowWelcome(false)}>
                <FiX />
              </button>
              <div className="modal-icon" style={{ background: 'linear-gradient(135deg, var(--primary), #9c27b0)' }}>
                👋
              </div>
              <h3 className="modal-title">Welcome to SparkGlow Admin!</h3>
              <p className="modal-message">
                You're all set to manage your store. From here, you can manage products, track orders, view customers, and much more.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => setShowWelcome(false)}
              >
                Get Started
              </button>
            </div>
          </div>
        </>
      )}

      <div className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/logo.png" alt="SparkGlow" style={{ height: '40px', width: 'auto' }} />
          <div className="admin-sidebar-subtitle">Admin Panel</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSideOpen(false)}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item" style={{ color: 'var(--primary)' }}>
            <FiExternalLink size={16} /> Visit Website
          </a>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{user?.name}</div>
            <button className="admin-nav-item" style={{ width: '100%' }} onClick={() => setShowLogoutModal(true)}><FiLogOut size={16} /> Logout</button>
          </div>
          <a 
            href="https://portfolio-sooty-eight-54.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '12px',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            Built by MiqroTek
          </a>
        </div>
      </div>
      <div className="admin-overlay" style={{ display: sideOpen ? 'block' : 'none' }} onClick={() => setSideOpen(false)} />
      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="admin-mobile-toggle" onClick={() => setSideOpen(s => !s)}>{sideOpen ? <FiX /> : <FiMenu />}</button>
            <img src="/logo.png" alt="SparkGlow" style={{ height: '32px', width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { loadNotifications(); setShowNotifications(!showNotifications) }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}
              >
                <FiBell size={20} color="var(--text)" />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '4px', 
                    right: '4px', 
                    background: '#e53935', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    fontSize: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div 
                    style={{ 
                      position: 'fixed', 
                      inset: 0, 
                      zIndex: 9998 
                    }} 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    zIndex: 9999
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => markAsRead(notif._id, notif.link)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: notif.read ? 'transparent' : 'rgba(220, 20, 60, 0.1)',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-light)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(220, 20, 60, 0.1)'}
                        >
                          <div style={{ fontWeight: notif.read ? 'normal' : 'bold', fontSize: '0.875rem', marginBottom: '4px' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
