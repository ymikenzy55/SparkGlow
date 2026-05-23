import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import ConfirmModal from '../common/ConfirmModal'
import { formatCedi } from '../../utils/currency'

export default function CartDrawer() {
  const { items, count, total, isOpen, setIsOpen, removeItem, updateQty, clearCart } = useCart()
  const navigate = useNavigate()
  const [showClearModal, setShowClearModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)
  const shipping = total >= 50 ? 0 : 5.99

  const go = (path) => { setIsOpen(false); navigate(path) }

  const handleRemoveItem = (itemId) => {
    removeItem(itemId)
    setItemToRemove(null)
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearModal(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ConfirmModal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            onConfirm={handleClearCart}
            title="Clear Cart?"
            message="Are you sure you want to remove all items from your cart? This action cannot be undone."
            confirmText="Yes, Clear Cart"
            cancelText="Cancel"
            type="danger"
          />

          <ConfirmModal
            isOpen={itemToRemove !== null}
            onClose={() => setItemToRemove(null)}
            onConfirm={() => handleRemoveItem(itemToRemove)}
            title="Remove Item?"
            message="Are you sure you want to remove this item from your cart?"
            confirmText="Yes, Remove"
            cancelText="Cancel"
            type="warning"
          />

          <motion.div className="cart-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />
          <motion.div className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
            <div className="cart-drawer-header">
              <h3>Shopping Bag ({count})</h3>
              <button className="cart-close-btn" onClick={() => setIsOpen(false)}><FiX /></button>
            </div>
            <div className="cart-drawer-body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon"><FiShoppingBag /></div>
                  <h4>Your bag is empty</h4>
                  <p>Add some beautiful products to get started</p>
                  <button className="btn btn-primary btn-sm" onClick={() => go('/shop')}>Start Shopping</button>
                </div>
              ) : (
                <>
                  {items.length > 1 && (
                    <div style={{ padding: '0 0 12px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm" 
                        style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--primary)' }}
                        onClick={() => setShowClearModal(true)}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                  {items.map(item => (
                    <div key={item._id} className="cart-item">
                      <img className="cart-item-img" src={item.images?.[0] || ''} alt={item.name} />
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">{formatCedi(item.price * item.qty)}</div>
                        <div className="cart-item-qty">
                          <button className="qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}><FiMinus size={10} /></button>
                          <span className="qty-val">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item._id, item.qty + 1)}><FiPlus size={10} /></button>
                        </div>
                      </div>
                      <button className="cart-remove-btn" onClick={() => setItemToRemove(item._id)}><FiTrash2 size={15} /></button>
                    </div>
                  ))}
                </>
              )}
            </div>
            {items.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-subtotal"><span>Subtotal</span><span>{formatCedi(total)}</span></div>
                <div className="cart-subtotal"><span>Shipping</span><span>{shipping === 0 ? <span style={{color:'#2e7d32'}}>FREE</span> : formatCedi(shipping)}</span></div>
                <div className="cart-shipping-note">{total >= 50 ? '✓ Free shipping applied!' : `Add ${formatCedi(50 - total)} more for free shipping`}</div>
                <div className="cart-total"><span>Total</span><span>{formatCedi(total + shipping)}</span></div>
                <button className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }} onClick={() => go('/checkout')}>Checkout</button>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => go('/cart')}>View Full Cart</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
