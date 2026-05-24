import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2, FiEye, FiX, FiShoppingBag, FiCalendar, FiMail, FiUser, FiPhone } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { formatCedi } from '../../utils/currency'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmRoleChange, setConfirmRoleChange] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getUsers({ search, limit: 50 }).then(r => { setUsers(r.data.users); setTotal(r.data.total) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const toggleRole = async (user, newRole) => {
    try { 
      await adminAPI.updateUser(user._id, { role: newRole })
      toast.success('Role updated')
      setConfirmRoleChange(null)
      load() 
    } catch { 
      toast.error('Update failed') 
    }
  }

  const del = async (id) => {
    try { 
      await adminAPI.deleteUser(id)
      toast.success('User deleted')
      setConfirmDelete(null)
      load() 
    } catch { 
      toast.error('Delete failed') 
    }
  }

  const viewUserDetails = async (user) => {
    setSelectedUser(user)
    setLoadingDetails(true)
    try {
      const res = await adminAPI.getUserDetail(user._id)
      setUserDetails(res.data.user)
    } catch {
      toast.error('Failed to load user details')
      setSelectedUser(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setUserDetails(null)
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Users ({total})</h3>
        <div className="admin-search"><input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #9c27b0)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{u.name[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{u.email}</td>
                  <td>
                    <button 
                      className={`badge ${u.role === 'admin' ? 'badge-pink' : 'badge-gray'}`} 
                      onClick={() => {
                        const newRole = u.role === 'admin' ? 'user' : 'admin'
                        setConfirmRoleChange({ user: u, newRole })
                      }} 
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px' }} onClick={() => viewUserDetails(u)} title="View Details"><FiEye size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(u)} disabled={u.role === 'admin'} title="Delete User"><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete User"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => del(confirmDelete._id)}
          onClose={() => setConfirmDelete(null)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
      {confirmRoleChange && (
        <ConfirmModal
          isOpen={true}
          title="Change User Role"
          message={`Are you sure you want to change ${confirmRoleChange.user.name}'s role to ${confirmRoleChange.newRole}?`}
          onConfirm={() => toggleRole(confirmRoleChange.user, confirmRoleChange.newRole)}
          onClose={() => setConfirmRoleChange(null)}
          onCancel={() => setConfirmRoleChange(null)}
          confirmText="Change Role"
          cancelText="Cancel"
          type="warning"
        />
      )}
      
      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeUserDetails}>
          <div className="user-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="user-detail-modal-header">
              <h3>User Details</h3>
              <button className="user-detail-close" onClick={closeUserDetails} aria-label="Close">
                <FiX size={20} />
              </button>
            </div>

            <div className="user-detail-modal-body">
              {loadingDetails ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <LoadingSpinner />
                </div>
              ) : userDetails ? (
                <>
                  {/* User Header */}
                  <div className="user-detail-hero">
                    <div className="user-detail-avatar">
                      {userDetails.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--dark)', wordBreak: 'break-word' }}>{userDetails.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge ${userDetails.role === 'admin' ? 'badge-pink' : 'badge-gray'}`}>{userDetails.role}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiCalendar size={12} />
                          Joined {new Date(userDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 className="user-detail-section-title">Contact Information</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="user-detail-info-row">
                        <FiMail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="user-detail-label">Email</div>
                          <div className="user-detail-value">{userDetails.email}</div>
                        </div>
                      </div>
                      {userDetails.phone && (
                        <div className="user-detail-info-row">
                          <FiPhone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="user-detail-label">Phone</div>
                            <div className="user-detail-value">{userDetails.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 className="user-detail-section-title">Statistics</h5>
                    <div className="user-detail-stats">
                      <div className="user-detail-stat-card">
                        <FiShoppingBag size={18} style={{ color: 'var(--primary)' }} />
                        <div className="user-detail-stat-value">{userDetails.stats.totalOrders}</div>
                        <div className="user-detail-stat-label">Total Orders</div>
                      </div>
                      <div className="user-detail-stat-card">
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>GH₵</span>
                        <div className="user-detail-stat-value">{formatCedi(userDetails.stats.totalSpent).replace('GH₵', '').trim()}</div>
                        <div className="user-detail-stat-label">Total Spent</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {userDetails.recentOrders && userDetails.recentOrders.length > 0 ? (
                    <div>
                      <h5 className="user-detail-section-title">Recent Orders</h5>
                      <div className="user-detail-orders">
                        {userDetails.recentOrders.map(order => (
                          <div key={order._id} className="user-detail-order-row">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                                {formatCedi(order.total)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items • {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                              <span className={`badge ${
                                order.status === 'delivered' ? 'badge-green' :
                                order.status === 'shipped' ? 'badge-blue' :
                                order.status === 'processing' ? 'badge-gold' :
                                order.status === 'cancelled' ? 'badge-red' : 'badge-gray'
                              }`}>
                                {order.status}
                              </span>
                              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-gold'}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                      No orders yet
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
