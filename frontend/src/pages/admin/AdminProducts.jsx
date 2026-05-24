import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCamera, FiCheck } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { formatCedi } from '../../utils/currency'
import { getImageUrl } from '../../utils/imageUrl'

const empty = { name: '', description: '', price: '', oldPrice: '', images: [], category: '', stock: '', featured: false, tags: '', isActive: true }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [saving, setSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryImage, setNewCategoryImage] = useState(null)
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const categoryImageInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      adminAPI.getProducts({ page, limit: 20, search }),
      adminAPI.getCategories(),
    ]).then(([pr, cr]) => {
      setProducts(pr.data.products)
      setTotal(pr.data.total)
      setCategories(cr.data.categories)
      setSelectedProducts([])
    }).catch(err => {
      toast.error('Failed to load products')
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    setPage(1)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      load()
    }, 300)
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }
    setCreatingCategory(true)
    try {
      const formData = new FormData()
      formData.append('name', newCategoryName)
      formData.append('slug', newCategoryName.toLowerCase().replace(/\s+/g, '-'))
      
      if (newCategoryImage) {
        formData.append('image', newCategoryImage)
      } else if (imageFiles.length > 0) {
        // Use first product image as category image
        formData.append('image', imageFiles[0])
      }
      
      const res = await adminAPI.createCategory(formData)
      toast.success('Category created!')
      setCategories([...categories, res.data.category])
      setForm({ ...form, category: res.data.category._id })
      setShowCategoryModal(false)
      setNewCategoryName('')
      setNewCategoryImage(null)
      setNewCategoryImagePreview('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category')
    }
    setCreatingCategory(false)
  }

  const handleCategoryImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setNewCategoryImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewCategoryImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const openModal = (p = null) => {
    if (p) {
      setEditing(p)
      setForm({ 
        ...p, 
        oldPrice: p.comparePrice || '',
        images: Array.isArray(p.images) ? p.images : [], 
        tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags, 
        category: p.category?._id || p.category || '' 
      })
      setImagePreviews(Array.isArray(p.images) ? p.images : [])
    } else {
      setEditing(null)
      setForm(empty)
      setImagePreviews([])
    }
    setImageFiles([])
    setModal(true)
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setImageFiles(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const formData = new FormData()
      
      imageFiles.forEach(file => {
        formData.append('images', file)
      })
      
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', Number(form.price))
      if (form.oldPrice) formData.append('comparePrice', Number(form.oldPrice))
      formData.append('category', form.category)
      formData.append('stock', Number(form.stock))
      formData.append('featured', form.featured)
      formData.append('isActive', form.isActive)
      if (form.tags) formData.append('tags', form.tags)
      
      if (imageFiles.length === 0 && editing && form.images.length > 0) {
        form.images.forEach(img => formData.append('existingImages', img))
      }
      
      if (editing) {
        await adminAPI.updateProduct(editing._id, formData)
        toast.success('Product updated!')
      } else {
        await adminAPI.createProduct(formData)
        toast.success('Product created!')
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
      await adminAPI.deleteProduct(id)
      toast.success('Product deleted')
      setConfirmDelete(null)
      load() 
    } catch { 
      toast.error('Delete failed') 
    }
  }

  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p._id))
    }
  }

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedProducts.map(id => adminAPI.deleteProduct(id)))
      toast.success(`${selectedProducts.length} products deleted`)
      setBulkDeleteConfirm(false)
      setSelectedProducts([])
      load()
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Products ({total})</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-search">
              <input 
                placeholder="Search products…" 
                value={search} 
                onChange={handleSearchChange}
              />
            </div>
            {selectedProducts.length > 0 && (
              <button 
                className="btn btn-danger btn-sm" 
                onClick={() => setBulkDeleteConfirm(true)}
              >
                <FiTrash2 size={14} /> Delete ({selectedProducts.length})
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
              <FiPlus size={14} /> Add Product
            </button>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="table-scroll" style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ background: selectedProducts.includes(p._id) ? 'var(--primary-light)' : 'transparent' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(p._id)}
                          onChange={() => toggleSelectProduct(p._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td><img className="img-preview" src={getImageUrl(p.images?.[0])} alt="" /></td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.category?.name || '—'}</td>
                      <td><strong style={{ color: 'var(--primary)' }}>{formatCedi(p.price)}</strong></td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {p.stock <= 5 && p.stock > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53935' }}></span>}
                        <span className={p.stock === 0 ? 'badge badge-red' : p.stock <= 5 ? 'low-stock' : ''}>{p.stock}</span>
                      </td>
                      <td>{p.featured ? <span className="badge badge-pink">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => openModal(p)}>
                            <FiEdit2 size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(p)}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}>
              {products.map(p => (
                <div key={p._id} style={{ 
                  background: selectedProducts.includes(p._id) ? 'var(--primary-light)' : 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px', 
                  marginBottom: '12px' 
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(p._id)}
                      onChange={() => toggleSelectProduct(p._id)}
                      style={{ cursor: 'pointer', marginTop: '4px' }}
                    />
                    <img src={getImageUrl(p.images?.[0])} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{p.name}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--text-light)' }}>{p.category?.name || '—'}</p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCedi(p.price)}</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Stock: 
                          {p.stock <= 5 && p.stock > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53935' }}></span>}
                          <span className={p.stock === 0 ? 'badge badge-red' : p.stock <= 5 ? 'low-stock' : ''}>{p.stock}</span>
                        </span>
                        {p.featured && <span className="badge badge-pink">Featured</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-sm" style={{ flex: 1, background: 'var(--bg-light)' }} onClick={() => openModal(p)}>
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setConfirmDelete(p)}>
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input required className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea required className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (GH₵) *</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={form.price} 
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (GH₵)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={form.oldPrice} 
                      onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} 
                      placeholder="Optional"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        required 
                        className="form-select" 
                        style={{ flex: 1 }} 
                        value={form.category} 
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                      <button type="button" className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff' }} onClick={() => setShowCategoryModal(true)}>
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      className="form-input" 
                      value={form.stock} 
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} 
                      placeholder="0"
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Product Images</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)', flex: 1 }} onClick={() => fileInputRef.current?.click()}>
                      <FiUpload size={14} /> Upload Images
                    </button>
                    <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)', flex: 1 }} onClick={() => cameraInputRef.current?.click()}>
                      <FiCamera size={14} /> Take Photo
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
                  
                  {imagePreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                      {imagePreviews.map((preview, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={preview} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#e53935', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" placeholder="skincare, serum, vitamin-c" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active
                  </label>
                </div>
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
          title="Delete Product"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => del(confirmDelete._id)}
          onClose={() => setConfirmDelete(null)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Bulk Delete Products"
          message={`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`}
          onConfirm={bulkDelete}
          onClose={() => setBulkDeleteConfirm(false)}
          onCancel={() => setBulkDeleteConfirm(false)}
          confirmText="Delete All"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {showCategoryModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCategoryModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button onClick={() => setShowCategoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input 
                  required 
                  className="form-input" 
                  placeholder="e.g., Skincare, Makeup" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), createCategory())}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category Image</label>
                <button 
                  type="button" 
                  className="btn btn-sm" 
                  style={{ background: 'var(--bg-light)', width: '100%' }} 
                  onClick={() => categoryImageInputRef.current?.click()}
                >
                  <FiUpload size={14} /> {newCategoryImagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                <input 
                  ref={categoryImageInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCategoryImageSelect} 
                  style={{ display: 'none' }} 
                />
                {newCategoryImagePreview && (
                  <div style={{ marginTop: '12px', position: 'relative' }}>
                    <img src={newCategoryImagePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <button 
                      type="button" 
                      onClick={() => { setNewCategoryImage(null); setNewCategoryImagePreview('') }} 
                      style={{ position: 'absolute', top: '8px', right: '8px', background: '#e53935', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {!newCategoryImagePreview && imageFiles.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px' }}>
                    Or use the first product image as category image
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => setShowCategoryModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={createCategory} disabled={creatingCategory}>
                {creatingCategory ? 'Creating…' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
