import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/common/Breadcrumb'
import { formatCedi } from '../utils/currency'

export default function CartPage() {
  const { items, total, removeItem, updateQty, clearCart } = useCart()
  const shipping = total >= 50 ? 0 : items.length > 0 ? 5.99 : 0

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px', color: 'var(--border)' }}><FiShoppingBag /></div>
        <h2 style={{ marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '28px' }}>Looks like you haven&apos;t added anything yet</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping <FiArrowRight /></Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <Breadcrumb />
      <h2 style={{ marginBottom: '28px' }}>Shopping <span style={{ color: 'var(--primary)' }}>Cart</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
              <button style={{ color: '#e53935', fontSize: '0.8rem', fontWeight: 500 }} onClick={clearCart}>Clear All</button>
            </div>
            {items.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <img src={item.images?.[0]} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.slug || item._id}`} style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>{item.name}</Link>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '10px' }}>{formatCedi(item.price)} each</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}><FiMinus size={10} /></button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.qty + 1)}><FiPlus size={10} /></button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1rem', marginBottom: '8px' }}>{formatCedi(item.price * item.qty)}</div>
                  <button className="cart-remove-btn" onClick={() => removeItem(item._id)}><FiTrash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{formatCedi(total)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: '#2e7d32' }}>FREE</span> : formatCedi(shipping)}</span></div>
          {shipping > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '8px' }}>Add {formatCedi(50 - total)} more for free shipping</p>}
          <div className="summary-total"><span>Total</span><span>{formatCedi(total + shipping)}</span></div>
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>Proceed to Checkout <FiArrowRight /></Link>
          <Link to="/shop" className="btn btn-outline" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
