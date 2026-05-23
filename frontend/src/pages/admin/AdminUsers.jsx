import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'
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
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(u)} disabled={u.role === 'admin'}><FiTrash2 size={13} /></button>
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
    </div>
  )
}
