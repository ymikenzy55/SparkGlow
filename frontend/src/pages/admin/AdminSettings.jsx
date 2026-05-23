import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiLock, FiMail, FiUsers, FiTrash2, FiUserPlus } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('password')
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [addAdminEmail, setAddAdminEmail] = useState('')
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null })

  useEffect(() => {
    if (activeTab === 'admins') loadAdmins()
  }, [activeTab])

  const loadAdmins = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAdmins()
      setAdmins(res.data.admins)
    } catch (err) {
      toast.error('Failed to load admins')
    }
    setLoading(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await adminAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      toast.success('Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    }
    setLoading(false)
  }

  const handleEmailChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.changeEmail({ newEmail: emailForm.newEmail, password: emailForm.password })
      toast.success('Email updated successfully!')
      setEmailForm({ newEmail: '', password: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email')
    }
    setLoading(false)
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.addAdmin({ email: addAdminEmail })
      toast.success('Admin added successfully!')
      setAddAdminEmail('')
      loadAdmins()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add admin')
    }
    setLoading(false)
  }

  const handleRemoveAdmin = async (id, name) => {
    setConfirmModal({
      show: true,
      title: 'Remove Admin',
      message: `Are you sure you want to remove ${name} as admin? They will become a regular user.`,
      onConfirm: async () => {
        try {
          await adminAPI.removeAdmin(id)
          toast.success('Admin removed successfully')
          loadAdmins()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to remove admin')
        }
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
      }
    })
  }

  const handleDeleteAdmin = async (id, name) => {
    setConfirmModal({
      show: true,
      title: 'Delete Admin',
      message: `Are you sure you want to permanently delete ${name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await adminAPI.deleteAdmin(id)
          toast.success('Admin deleted successfully')
          loadAdmins()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete admin')
        }
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
      }
    })
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Settings</h3>
        </div>
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button 
              onClick={() => setActiveTab('password')} 
              style={{ 
                padding: '12px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-light)',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiLock size={16} /> Change Password
            </button>
            <button 
              onClick={() => setActiveTab('email')} 
              style={{ 
                padding: '12px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'email' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'email' ? 'var(--primary)' : 'var(--text-light)',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiMail size={16} /> Change Email
            </button>
            <button 
              onClick={() => setActiveTab('admins')} 
              style={{ 
                padding: '12px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'admins' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'admins' ? 'var(--primary)' : 'var(--text-light)',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiUsers size={16} /> Manage Admins
            </button>
          </div>
        </div>

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} style={{ maxWidth: '500px' }}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                value={passwordForm.currentPassword} 
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                value={passwordForm.newPassword} 
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                value={passwordForm.confirmPassword} 
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={handleEmailChange} style={{ maxWidth: '500px' }}>
            <div className="form-group">
              <label className="form-label">New Email *</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                value={emailForm.newEmail} 
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                value={emailForm.password} 
                onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))} 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        )}

        {activeTab === 'admins' && (
          <div>
            <form onSubmit={handleAddAdmin} style={{ maxWidth: '500px', marginBottom: '32px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Add New Admin</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  placeholder="Enter user email" 
                  value={addAdminEmail} 
                  onChange={e => setAddAdminEmail(e.target.value)} 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FiUserPlus size={16} /> Add Admin
                </button>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '8px' }}>
                The user must already be registered in the system
              </p>
            </form>

            <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Current Admins</h4>
            {loading ? <LoadingSpinner /> : (
              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin._id}>
                        <td style={{ fontWeight: 500 }}>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-btns">
                            <button 
                              className="btn btn-sm" 
                              style={{ background: 'var(--bg-light)' }} 
                              onClick={() => handleRemoveAdmin(admin._id, admin.name)}
                            >
                              Remove Role
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmModal.show && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
          onCancel={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
          type="danger"
        />
      )}
    </div>
  )
}
