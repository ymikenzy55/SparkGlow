import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFilter, FiX } from 'react-icons/fi'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Breadcrumb from '../components/common/Breadcrumb'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  const page = Number(searchParams.get('page')) || 1
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 12, sort }
    if (category) params.category = category
    if (search) params.search = search
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    productAPI.getAll(params)
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages) })
      .finally(() => setLoading(false))
  }, [page, category, sort, minPrice, maxPrice, search])

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <Breadcrumb />
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Our <span style={{ color: 'var(--primary)' }}>Shop</span></h2>
          <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>{total} products available</p>
        </div>
        <button 
          className="btn btn-primary btn-sm mobile-filter-btn" 
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'none' }}
        >
          <FiFilter size={16} /> Filters
        </button>
      </div>
      <div className="shop-layout">
        <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Filters</h3>
            <button 
              className="mobile-filter-close" 
              onClick={() => setShowFilters(false)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="sidebar-section">
            <h4>Search</h4>
            <input className="form-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && set('search', search)} />
            <button className="btn btn-primary btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => { set('search', search); setShowFilters(false) }}>Search</button>
          </div>
          <div className="sidebar-section">
            <h4>Category</h4>
            <div className={`category-filter-item ${!category ? 'active' : ''}`} onClick={() => { set('category', ''); setShowFilters(false) }}>All Categories</div>
            {categories.map(c => (
              <div key={c._id} className={`category-filter-item ${category === c._id ? 'active' : ''}`} onClick={() => { set('category', c._id); setShowFilters(false) }}>{c.name}</div>
            ))}
          </div>
          <div className="sidebar-section">
            <h4>Price Range</h4>
            <div className="price-range-inputs">
              <input className="price-input" type="number" placeholder="Min GH₵" value={minPrice} onChange={e => set('minPrice', e.target.value)} />
              <input className="price-input" type="number" placeholder="Max GH₵" value={maxPrice} onChange={e => set('maxPrice', e.target.value)} />
            </div>
          </div>
          <div className="sidebar-section">
            <h4>Sort By</h4>
            <select className="form-select" value={sort} onChange={e => { set('sort', e.target.value); setShowFilters(false) }}>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>
        {showFilters && <div className="shop-sidebar-overlay" onClick={() => setShowFilters(false)} />}
        <div>
          {loading ? <LoadingSpinner /> : (
            <>
              <div className="products-grid">
                {products.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
              {products.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>No products found</div>}
              {pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => set('page', page - 1)}>‹</button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => set('page', p)}>{p}</button>
                  ))}
                  <button className="page-btn" disabled={page === pages} onClick={() => set('page', page + 1)}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
