import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categoryAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Breadcrumb from '../components/common/Breadcrumb'

export default function CategoryPage() {
  const { slug } = useParams()
  const [cat, setCat] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')

  useEffect(() => { setPage(1); setSearch('') }, [slug])

  useEffect(() => {
    setLoading(true)
    categoryAPI.getOne(slug, { page, limit: 12, sort, search })
      .then(r => { setCat(r.data.category); setProducts(r.data.products); setPages(r.data.pages); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, page, sort, search])

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--bg-light), #fce4ec)', padding: '60px 0' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> ›
            <Link to="/shop">Shop</Link> ›
            <span>{cat?.name || slug}</span>
          </div>
          {cat && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{cat.name}</h1>
              <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>{cat.description}</p>
            </motion.div>
          )}
        </div>
      </div>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{total} products</span>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input className="form-input" style={{ width: '200px' }} placeholder="Search in category…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="products-grid">
              {products.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
            {products.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>No products found</div>}
            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
