import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiArrowLeft, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { formatCedi } from '../utils/currency'
import { getImageUrl } from '../utils/imageUrl'
import { useEffect } from 'react'

export default function CartPage() {
  const { items, total, removeItem, updateQty, clearCart } = useCart()

  // Hide navbar when on cart page
  useEffect(() => {
    const navbar = document.querySelector('.navbar-wrapper')
    if (navbar) {
      navbar.style.display = 'none'
    }
    
    return () => {
      if (navbar) {
        navbar.style.display = 'block'
      }
    }
  }, [])

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '120px', height: '120px', margin: '0 auto 24px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <FiShoppingBag size={50} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ marginBottom: '12px', fontSize: '1.8rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '32px', fontSize: '0.95rem' }}>Discover our amazing products and start shopping!</p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 32px' }}>
            <FiShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)' }}>
      {/* Custom Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark)', fontWeight: 500, fontSize: '0.9rem' }}>
            <FiArrowLeft size={18} /> Continue Shopping
          </Link>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Cart ({items.length})</h2>
          <button onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e53935', fontSize: '0.9rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiTrash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px', maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item, i) => (
              <motion.div 
                key={item._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                style={{ 
                  background: 'white', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '20px', 
                  display: 'flex', 
                  gap: '20px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                <button 
                  onClick={() => removeItem(item._id)}
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    background: '#ffebee', 
                    color: '#e53935', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {e.currentTarget.style.background = '#e53935'; e.currentTarget.style.color = 'white'}}
                  onMouseLeave={(e) => {e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = '#e53935'}}
                >
                  <FiX size={16} />
                </button>
                
                <Link to={`/product/${item.slug || item._id}`}>
                  <img 
                    src={getImageUrl(item.images?.[0])} 
                    alt={item.name} 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: 'var(--radius-sm)', 
                      flexShrink: 0,
                      border: '1px solid var(--border)'
                    }} 
                  />
                </Link>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <Link 
                      to={`/product/${item.slug || item._id}`} 
                      style={{ 
                        fontWeight: 600, 
                        color: 'var(--dark)', 
                        fontSize: '1.05rem', 
                        display: 'block', 
                        marginBottom: '8px',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.name}
                    </Link>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCedi(item.price)}
                      <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.85rem', marginLeft: '6px' }}>each</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-full)', padding: '6px' }}>
                      <button 
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          border: 'none', 
                          background: 'white', 
                          color: 'var(--dark)', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                          opacity: item.qty <= 1 ? 0.5 : 1
                        }}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '1rem', minWidth: '30px', textAlign: 'center' }}>{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          border: 'none', 
                          background: 'var(--primary)', 
                          color: 'white', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(220,20,60,0.3)',
                          opacity: item.qty >= item.stock ? 0.5 : 1
                        }}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    
                    <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1.3rem' }}>
                      {formatCedi(item.price * item.qty)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary - Sticky */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-light)' }}>Subtotal ({items.length} items)</span>
                  <span style={{ fontWeight: 600 }}>{formatCedi(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-light)' }}>Shipping Fee</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>To be determined</span>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-light)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0, lineHeight: 1.5 }}>
                  Shipping fee will be calculated by admin based on your location
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Estimated Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary)' }}>{formatCedi(total)}</span>
              </div>
              
              <Link 
                to="/checkout" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', marginBottom: '12px' }}
              >
                Proceed to Checkout <FiArrowRight />
              </Link>
              
              <Link 
                to="/shop" 
                className="btn btn-outline" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 968px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
          
          .container > div > div:last-child {
            position: static !important;
            top: auto !important;
          }
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 20px 16px !important;
          }
          
          .container > div > div:first-child > div {
            padding: 16px !important;
            gap: 16px !important;
          }
          
          .container > div > div:first-child > div img {
            width: 90px !important;
            height: 90px !important;
          }
          
          .container > div > div:first-child > div > div > div:first-child a {
            font-size: 0.95rem !important;
            white-space: normal !important;
          }
          
          .container > div > div:first-child > div > div > div:last-child {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .container > div > div:last-child > div {
            padding: 20px !important;
          }
          
          .container > div > div:last-child h3 {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
