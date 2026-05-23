import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCedi } from '../utils/currency'
import { getImageUrl } from '../utils/imageUrl'

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
        setActiveImg(prev => (prev + 1) % product.images.length)
      } else {
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
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> ›
          <Link to="/shop">Shop</Link> ›
          {product.category && <><Link to={`/category/${product.category.slug}`}>{product.category.name}</Link> › </>}
          <span>{product.name}</span>
        </div>

        {/* Product Detail Grid */}
        <div className="pd-grid">
          {/* Left: Image Gallery */}
          <div className="pd-gallery-section">
            <div 
              className="pd-main-image-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img className="pd-main-image" src={getImageUrl(product.images[activeImg] || product.images[0])} alt={product.name} />
              {product.images.length > 1 && (
                <>
                  <button className="pd-nav-btn pd-nav-prev" onClick={prevImage}>
                    <FiChevronLeft size={20} />
                  </button>
                  <button className="pd-nav-btn pd-nav-next" onClick={nextImage}>
                    <FiChevronRight size={20} />
                  </button>
                  <div className="pd-image-indicators">
                    {product.images.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`pd-indicator ${i === activeImg ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <img 
                    key={i} 
                    className={`pd-thumbnail ${i === activeImg ? 'active' : ''}`} 
                    src={getImageUrl(img)} 
                    alt="" 
                    onClick={() => setActiveImg(i)} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="pd-info-section">
            {/* Category Badge */}
            {product.category && (
              <div className="pd-category-badge">{product.category.name}</div>
            )}

            {/* Product Name */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="pd-rating">
                <Stars rating={product.rating} size={16} />
                <span className="pd-rating-text">({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}

            {/* Price */}
            <div className="pd-price-section">
              <div className="pd-price-main">{formatCedi(product.price)}</div>
              {product.comparePrice && (
                <div className="pd-price-compare">{formatCedi(product.comparePrice)}</div>
              )}
              {discount && (
                <div className="pd-discount-badge">Save {discount}%</div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? (
                <>
                  <span className="pd-stock-icon">✓</span>
                  <span>In Stock ({product.stock} available)</span>
                </>
              ) : (
                <>
                  <span className="pd-stock-icon">✗</span>
                  <span>Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="pd-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="pd-actions">
              <div className="pd-qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={product.stock === 0}>
                  <FiMinus size={14} />
                </button>
                <span className="pd-qty-value">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={product.stock === 0}>
                  <FiPlus size={14} />
                </button>
              </div>
              <button className="pd-add-to-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
                <FiShoppingBag size={18} />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Features */}
            <div className="pd-features">
              <div className="pd-feature">
                <FiTruck size={20} />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders over GH₵ 50</span>
                </div>
              </div>
              <div className="pd-feature">
                <FiShield size={20} />
                <div>
                  <strong>Secure Payment</strong>
                  <span>100% secure transactions</span>
                </div>
              </div>
              <div className="pd-feature">
                <FiRefreshCw size={20} />
                <div>
                  <strong>Easy Returns</strong>
                  <span>7-day return policy</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map(tag => <span key={tag} className="pd-tag">#{tag}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pd-reviews-section">
          <h2 className="pd-section-title">Customer <span>Reviews</span></h2>
          
          {product.reviews.length === 0 && (
            <div className="pd-no-reviews">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}

          <div className="pd-reviews-grid">
            {product.reviews.map(r => (
              <div key={r._id} className="pd-review-card">
                <div className="pd-review-header">
                  <div className="pd-reviewer-avatar">{r.name[0].toUpperCase()}</div>
                  <div className="pd-reviewer-info">
                    <div className="pd-reviewer-name">{r.name}</div>
                    <div className="pd-review-date">{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <Stars rating={r.rating} size={14} />
                </div>
                <p className="pd-review-comment">{r.comment}</p>
              </div>
            ))}
          </div>

          {user && (
            <div className="pd-review-form">
              <h3>Write a Review</h3>
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <select className="form-select" value={review.rating} onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    required 
                    value={review.comment} 
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} 
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="pd-related-section">
            <h2 className="pd-section-title">You May Also <span>Like</span></h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
