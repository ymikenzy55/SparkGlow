import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCedi } from '../utils/currency'

function Stars({ rating, size = 14 }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(rating) ? '#FFB300' : '#ddd', fontSize: size + 'px' }}>★</span>)}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [related, setRelated] = useState([])
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const load = () => {
    setLoading(true)
    productAPI.getOne(id)
      .then(r => {
        setProduct(r.data.product)
        setActiveImg(0)
        if (r.data.product.category?._id) {
          productAPI.getAll({ category: r.data.product.category._id, limit: 4 })
            .then(res => setRelated(res.data.products.filter(p => p._id !== r.data.product._id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!product || product.images.length <= 1) return
    
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        setActiveImg(prev => (prev + 1) % product.images.length)
      } else {
        // Swipe right - previous image
        setActiveImg(prev => (prev - 1 + product.images.length) % product.images.length)
      }
    }
  }

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setActiveImg(prev => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setActiveImg(prev => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!product) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>Product not found</div>

  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : null

  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success(`${product.name} added to cart!`)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to leave a review'); return }
    setSubmitting(true)
    try {
      await productAPI.addReview(product._id, review)
      toast.success('Review submitted!')
      setReview({ rating: 5, comment: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link> ›
          <Link to="/shop">Shop</Link> ›
          {product.category && <><Link to={`/category/${product.category.slug}`}>{product.category.name}</Link> › </>}
          <span>{product.name}</span>
        </div>
        <div className="product-detail-grid">
          {/* Gallery */}
          <motion.div className="product-gallery" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div 
              style={{ position: 'relative' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img className="product-main-img" src={product.images[activeImg] || product.images[0]} alt={product.name} />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 2
                    }}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 2
                    }}
                  >
                    <FiChevronRight size={20} />
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 2
                  }}>
                    {product.images.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImg(i)}
                        style={{
                          width: i === activeImg ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: i === activeImg ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="product-thumbs">
                {product.images.map((img, i) => (
                  <img key={i} className={`product-thumb ${i === activeImg ? 'active' : ''}`} src={img} alt="" onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </motion.div>
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {product.category && <div className="product-category-tag">{product.category.name}</div>}
            <div className="product-info-header">
              <h1>{product.name}</h1>
            </div>
            {product.numReviews > 0 && (
              <div className="product-rating-row">
                <Stars rating={product.rating} size={16} />
                <span>({product.numReviews} reviews)</span>
              </div>
            )}
            <div className="product-price-wrap">
              <span className="product-price">{formatCedi(product.price)}</span>
              {product.comparePrice && <span className="product-compare-price">{formatCedi(product.comparePrice)}</span>}
              {discount && <span className="product-discount-badge">-{discount}%</span>}
            </div>
            <p className="product-description">{product.description}</p>
            <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.875rem', color: 'var(--text-light)' }}>
              {product.stock > 0 ? <span style={{ color: '#2e7d32', fontWeight: 600 }}>✓ In Stock ({product.stock} available)</span> : <span style={{ color: '#e53935', fontWeight: 600 }}>✗ Out of Stock</span>}
            </div>
            <div className="product-qty-row">
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus size={12} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}><FiPlus size={12} /></button>
              </div>
              <button className="product-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                <FiShoppingBag size={16} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            {product.tags?.length > 0 && (
              <div className="product-tags">
                {product.tags.map(tag => <span key={tag} className="product-tag">#{tag}</span>)}
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ marginBottom: '24px' }}>Customer <span style={{ color: 'var(--primary)' }}>Reviews</span></h2>
          {product.reviews.length === 0 && <p style={{ color: 'var(--text-light)' }}>No reviews yet. Be the first!</p>}
          {product.reviews.map(r => (
            <div key={r._id} className="review-card">
              <div className="review-header">
                <span className="reviewer-name">{r.name}</span>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <Stars rating={r.rating} />
              <p className="review-comment" style={{ marginTop: '8px' }}>{r.comment}</p>
            </div>
          ))}
          {user && (
            <div className="review-form">
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Write a Review</h3>
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select className="form-select" value={review.rating} onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea className="form-input" rows={4} required value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} placeholder="Share your experience…" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
              </form>
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ marginBottom: '28px' }}>You May Also <span style={{ color: 'var(--primary)' }}>Like</span></h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
