import { Link } from 'react-router-dom'
import { FiShoppingBag, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { formatCedi } from '../../utils/currency'
import { getImageUrl } from '../../utils/imageUrl'

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#FFB300' : '#ddd', fontSize: '0.75rem' }}>★</span>
      ))}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : null

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug || product._id}`}>
        <div className="product-card-img">
          <img src={getImageUrl(product.images?.[0])} alt={product.name} loading="lazy" />
          {discount ? <span className="product-badge product-badge-sale">-{discount}%</span> : <span className="product-badge product-badge-new">New</span>}
          <div className="product-card-actions">
            <button className="product-action-btn" title="Quick view" onClick={e => e.preventDefault()}><FiEye /></button>
          </div>
        </div>
        <div className="product-card-info">
          {product.category && <div className="product-card-category">{product.category.name}</div>}
          <div className="product-card-name">{product.name}</div>
          {product.numReviews > 0 && (
            <div className="product-card-rating">
              <Stars rating={product.rating} />
              <span className="rating-count">({product.numReviews})</span>
            </div>
          )}
          <div className="product-card-price">
            <span className="price-current">{formatCedi(product.price)}</span>
            {product.comparePrice && <span className="price-compare">{formatCedi(product.comparePrice)}</span>}
          </div>
        </div>
      </Link>
      <div className="product-card-footer">
        <button className="add-to-cart-btn" onClick={handleAdd} disabled={product.stock === 0}>
          <FiShoppingBag size={14} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
