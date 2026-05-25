import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'

const empty = { title: '', subtitle: '', description: '', active: true, order: 0 }

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileInputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getHeroBanners()
      setBanners(res.data.banners || [])
    } catch {
      toast.error('Failed to load hero banners')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openModal = (b = null) => {
    if (b) {
      setEditing(b)
      setForm({
        title: b.title || '',
        subtitle: b.subtitle || '',
        description: b.description || '',
        active: b.active !== false,
        order: b.order || 0,
      })
      setImagePreview(b.image || '')
    } else {
      setEditing(null)
      setForm(empty)
      setImagePreview('')
    }
    setImageFile(null)
    setModal(true)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const save = async (e) => {
    e.preventDefault()
    
    if (!imageFile && !editing) {
      toast.error('Please select an image')
      return
    }
    
    setSaving(true)
    try {
      const formData = new FormData()
      if (imageFile) formData.append('image', imageFile)
      formData.append('title', form.title)
      formData.append('subtitle', form.subtitle)
      formData.append('description', form.description)
      formData.append('cta', 'Shop Now')
      formData.append('link', '/shop')
      formData.append('active', form.active)
      formData.append('order', Number(form.order))

      if (editing) {
        await adminAPI.updateHeroBanner(editing._id, formData)
        toast.success('Hero banner updated!')
      } else {
        await adminAPI.createHeroBanner(formData)
        toast.success('Hero banner created!')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
    setSaving(false)
  }

  const del = async (id) => {
    try {
      await adminAPI.deleteHeroBanner(id)
      toast.success('Hero banner deleted')
      setConfirmDelete(null)
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Hero Banners ({banners.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
            <FiPlus size={14} /> Add Banner
          </button>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="hero-banner-grid">
            {banners.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                No hero banners yet. Add one to show on the homepage.
              </div>
            )}
            {banners.map(b => (
              <div key={b._id} className={`hero-banner-card ${!b.active ? 'inactive' : ''}`}>
                <div className="hero-banner-img">
                  <img src={b.image} alt={b.title} />
                  {!b.active && <span className="hero-banner-badge">Inactive</span>}
                </div>
                <div className="hero-banner-info">
                  <h4>{b.title}</h4>
                  <p className="hero-banner-sub">{b.subtitle}</p>
                  <p className="hero-banner-desc">{b.description}</p>
                  <div className="hero-banner-meta">
                    <span>Order: {b.order}</span>
                  </div>
                </div>
                <div className="hero-banner-actions">
                  <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => openModal(b)}>
                    <FiEdit2 size={13} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(b)}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <>
          <div className="hero-modal-overlay" onClick={() => setModal(false)} />
          <div className="hero-modal-container">
            <div className="hero-modal-content">
              <button className="hero-modal-close" onClick={() => setModal(false)}><FiX /></button>
              <h3 className="hero-modal-title">{editing ? 'Edit Hero Banner' : 'Add Hero Banner'}</h3>
              <form onSubmit={save} className="hero-modal-form">
                <div className="form-group">
                  <label className="form-label">Banner Image *</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />
                  <div className="hero-banner-upload" onClick={() => fileInputRef.current?.click()}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" />
                        <div className="hero-banner-upload-overlay">
                          <FiUpload size={24} />
                          <span>Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="hero-banner-upload-placeholder">
                        <FiImage size={40} />
                        <span>Click to upload banner image</span>
                        <small>Recommended: 1920x800px</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g., Luxurious Bath Experience"
                    value={form.title} 
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g., Premium Soaps & Body Care"
                    value={form.subtitle} 
                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    required 
                    placeholder="Brief description of your banner..."
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div className="hero-modal-row">
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0"
                      value={form.order} 
                      onChange={e => setForm(f => ({ ...f, order: e.target.value }))} 
                    />
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                      Lower numbers appear first
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="active" 
                        checked={form.active} 
                        onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="active" style={{ margin: 0, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Active (visible on homepage)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="hero-modal-actions">
                  <button type="button" className="btn" onClick={() => setModal(false)} style={{ background: 'var(--bg-light)', color: 'var(--text)' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : editing ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Hero Banner"
          message={`Are you sure you want to delete "${confirmDelete.title}"?`}
          onConfirm={() => del(confirmDelete._id)}
          onClose={() => setConfirmDelete(null)}
          onCancel={() => setConfirmDelete(null)}
          type="danger"
        />
      )}
    </div>
  )
}
