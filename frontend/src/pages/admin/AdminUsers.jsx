import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2, FiEye, FiX, FiShoppingBag, FiDollarSign, FiCalendar, FiMail, FiUser } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'

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
        <>
          <div className="modal-overlay" onClick={closeUserDetails} />
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <div className="modal-content">
              <button className="modal-close-btn" onClick={closeUserDetails}>
                <FiX />
              </button>
              
              {loadingDetails ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <LoadingSpinner />
                </div>
              ) : userDetails ? (
                <>
                  {/* User Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #9c27b0)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                      {userDetails.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="modal-title" style={{ marginBottom: '4px' }}>{userDetails.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge ${userDetails.role === 'admin' ? 'badge-pink' : 'badge-gray'}`}>{userDetails.role}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                          <FiCalendar size={12} style={{ marginRight: '4px' }} />
                          Joined {new Date(userDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--dark)' }}>Contact Information</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                        <FiMail size={16} style={{ color: 'var(--primary)' }} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '2px' }}>Email</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userDetails.email}</div>
                        </div>
                      </div>
                      {userDetails.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                          <FiUser size={16} style={{ color: 'var(--primary)' }} />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '2px' }}>Phone</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userDetails.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Stats */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--dark)' }}>Statistics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                          <FiShoppingBag size={18} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>{userDetails.stats.totalOrders}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total Orders</div>
                      </div>
                      <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                          <FiDollarSign size={18} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>${userDetails.stats.totalSpent.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total Spent</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {userDetails.recentOrders && userDetails.recentOrders.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--dark)' }}>Recent Orders</h4>
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {userDetails.recentOrders.map(order => (
                          <div key={order._id} style={{ padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
                                ${order.total.toFixed(2)} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
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
                  )}

                  {userDetails.recentOrders && userDetails.recentOrders.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                      No orders yet
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
