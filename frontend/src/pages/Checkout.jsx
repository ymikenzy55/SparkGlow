import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiHome, FiShoppingCart } from 'react-icons/fi'
import { orderAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCedi } from '../utils/currency'
import { getImageUrl } from '../utils/imageUrl'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('momo')
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    region: '', 
    location: '', 
    notes: '' 
  })

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || f.name,
        email: user.email || f.email,
        phone: user.phone || f.phone,
      }))
    }
  }, [user])

  const shipping = total >= 50 ? 0 : 5.99

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Go Shopping</Link>
      </div>
    )
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digits
    if (value.length <= 10) {
      set('phone', value)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    
    // Validate phone number
    if (form.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }
    
    setLoading(true)
    try {
      const orderData = {
        items: items.map(i => ({ product: i._id, quantity: i.qty })),
        customerInfo: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          region: form.region,
          location: form.location,
        },
        shippingAddress: { 
          region: form.region, 
          location: form.location 
        },
        paymentMethod: payMethod,
        notes: form.notes,
      }
      
      if (!user) {
        orderData.guestInfo = {
          name: form.name,
          email: form.email,
          phone: form.phone,
        }
      }
      
      const res = await orderAPI.create(orderData)
      clearCart()
      
      // Navigate to success page with order data
      navigate('/order-success', { 
        state: { 
          order: {
            orderId: res.data.order?._id?.slice(-8).toUpperCase() || res.data.orderId || 'N/A',
            items: items.map(i => ({ name: i.name, quantity: i.qty, price: i.price })),
            customerInfo: orderData.customerInfo,
            guestInfo: orderData.guestInfo,
            shippingAddress: orderData.shippingAddress,
            subtotal: total,
            shipping: shipping,
            total: total + shipping,
            paymentMethod: payMethod,
            createdAt: new Date().toISOString()
          }
        },
        replace: true 
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: '24px' }}>
        <Link to="/"><FiHome size={14} /> Home</Link> ›
        <Link to="/cart"><FiShoppingCart size={14} /> Cart</Link> ›
        <span>Checkout</span>
      </div>
      
      <h2 style={{ marginBottom: '28px' }}>Checkout</h2>
      <form onSubmit={submit}>
        <div className="checkout-grid">
          <div>
            {!user && (
              <div className="checkout-section">
                <h3>Contact Information</h3>
                <div className="guest-toggle">Already have an account? <Link to="/login">Login</Link> for faster checkout.</div>
              </div>
            )}
            <div className="checkout-section">
              <h3>Customer Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  required 
                  className="form-input" 
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                  disabled={user && user.name}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input 
                    required 
                    type="email" 
                    className="form-input" 
                    value={form.email} 
                    onChange={e => set('email', e.target.value)} 
                    disabled={user && user.email}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    className="form-input" 
                    value={form.phone} 
                    onChange={handlePhoneChange} 
                    placeholder="0XXXXXXXXX"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                    {form.phone.length}/10 digits
                  </small>
                </div>
              </div>
            </div>
            <div className="checkout-section">
              <h3>Delivery Address</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Region *</label>
                  <select required className="form-select" value={form.region} onChange={e => set('region', e.target.value)}>
                    <option value="">Select region</option>
                    <option value="Greater Accra">Greater Accra</option>
                    <option value="Ashanti">Ashanti</option>
                    <option value="Central">Central</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Western">Western</option>
                    <option value="Volta">Volta</option>
                    <option value="Northern">Northern</option>
                    <option value="Upper East">Upper East</option>
                    <option value="Upper West">Upper West</option>
                    <option value="Bono">Bono</option>
                    <option value="Bono East">Bono East</option>
                    <option value="Ahafo">Ahafo</option>
                    <option value="Savannah">Savannah</option>
                    <option value="North East">North East</option>
                    <option value="Oti">Oti</option>
                    <option value="Western North">Western North</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location/City *</label>
                  <input 
                    required 
                    className="form-input" 
                    value={form.location} 
                    onChange={e => set('location', e.target.value)} 
                    placeholder="e.g., Accra, Kumasi"
                  />
                </div>
              </div>
            </div>
            <div className="checkout-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                {[
                  { id: 'momo', label: '📱 Mobile Money', desc: 'MTN, Vodafone, AirtelTigo' },
                  { id: 'card', label: '💳 Credit/Debit Card', desc: 'Visa, Mastercard' },
                  { id: 'cash', label: '💵 Cash on Delivery', desc: 'Pay when you receive' }
                ].map(m => (
                  <button key={m.id} type="button" className={`payment-option ${payMethod === m.id ? 'active' : ''}`} onClick={() => setPayMethod(m.id)}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="checkout-section">
              <h3>Order Notes <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 400 }}>(Optional)</span></h3>
              <textarea className="form-input" rows={3} placeholder="Special instructions for your order…" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            {items.map(item => (
              <div key={item._id} className="summary-item">
                <img className="summary-item-img" src={getImageUrl(item.images?.[0])} alt={item.name} />
                <div>
                  <div className="summary-item-name">{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Qty: {item.qty}</div>
                </div>
                <div className="summary-item-price">{formatCedi(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ marginTop: '16px' }}>
              <div className="summary-row"><span>Subtotal</span><span>{formatCedi(total)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatCedi(shipping)}</span></div>
              <div className="summary-total"><span>Total</span><span>{formatCedi(total + shipping)}</span></div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Placing Order…' : `Place Order — ${formatCedi(total + shipping)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
