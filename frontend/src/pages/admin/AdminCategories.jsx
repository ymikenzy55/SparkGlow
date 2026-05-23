import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'

const empty = { name: '', slug: '', description: '', image: '', featured: false }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => { setLoading(true); adminAPI.getCategories().then(r => setCategories(r.data.categories)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openModal = (c = null) => { setEditing(c); setForm(c ? { ...c } : empty); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    try {
      if (editing) await adminAPI.updateCategory(editing._id, data)
      else await adminAPI.createCategory(data)
      toast.success(editing ? 'Category updated!' : 'Category created!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    setSaving(false)
  }

  const del = async (id) => {
    try { 
      await adminAPI.deleteCategory(id)
      toast.success('Category deleted')
      setConfirmDelete(null)
      load() 
    } catch { 
      toast.error('Delete failed') 
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Categories ({categories.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}><FiPlus size={14} /> Add Category</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id}>
                  <td>{c.image && <img className="img-preview" src={c.image} alt="" />}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className="badge badge-gray">{c.slug}</span></td>
                  <td>{c.featured ? <span className="badge badge-pink">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                  <td><div className="action-btns"><button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => openModal(c)}><FiEdit2 size={13} /></button><button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}><FiTrash2 size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><h3>{editing ? 'Edit Category' : 'Add Category'}</h3><button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name *</label><input required className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Slug (auto-generated if empty)</label><input className="form-input" value={form.slug || ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" placeholder="https://..." value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}><input type="checkbox" checked={form.featured || false} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured Category</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Category"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => del(confirmDelete._id)}
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
