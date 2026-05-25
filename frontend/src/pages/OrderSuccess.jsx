import { useEffect, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiDownload, FiHome, FiShoppingBag, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'
import { formatCedi } from '../utils/currency'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const receiptRef = useRef(null)
  const order = location.state?.order

  useEffect(() => {
    if (!order) {
      navigate('/')
    }
  }, [order, navigate])

  if (!order) return null

  const orderDate = new Date(order.createdAt || Date.now())
  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const formattedTime = orderDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const downloadReceipt = () => {
    const receiptContent = receiptRef.current
    if (!receiptContent) return

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SparkGlow Receipt - ${order.orderId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Poppins', sans-serif; 
            background: #f8f8f8; 
            padding: 20px;
            color: #333;
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .receipt-header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 24px;
            text-align: center;
          }
          .logo { width: 50px; height: 50px; margin: 0 auto 8px; display: block; }
          .logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            font-weight: 800;
            margin-bottom: 4px;
          }
          .logo-text span { color: #dc143c; }
          .receipt-header p {
            font-size: 0.8rem;
            opacity: 0.8;
          }
          .contact-info {
            font-size: 0.75rem;
            opacity: 0.85;
            margin-top: 10px;
          }
          .contact-info a {
            color: #fff;
            text-decoration: none;
          }
          .receipt-body { padding: 24px; }
          .success-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #e8f5e9;
            color: #2e7d32;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 20px;
          }
          .order-id {
            text-align: center;
            margin-bottom: 20px;
          }
          .order-id label {
            font-size: 0.75rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .order-id h3 {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1a1a2e;
            margin-top: 4px;
          }
          .section {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px dashed #e0e0e0;
          }
          .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .section-title {
            font-size: 0.75rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
          }
          .info-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 0.875rem;
          }
          .info-row svg {
            width: 16px;
            height: 16px;
            color: #dc143c;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 0.875rem;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            color: #888;
            margin: 0 12px;
          }
          .item-price {
            font-weight: 600;
            color: #dc143c;
          }
          .totals {
            background: #f8f8f8;
            padding: 16px;
            border-radius: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            margin-bottom: 8px;
            color: #666;
          }
          .total-row.grand {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 0;
            padding-top: 8px;
            border-top: 2px solid #e0e0e0;
          }
          .total-row.grand span:last-child {
            color: #dc143c;
          }
          .receipt-footer {
            text-align: center;
            padding: 20px 24px 24px;
            background: #f8f8f8;
          }
          .receipt-footer p {
            font-size: 0.8rem;
            color: #888;
            margin-bottom: 4px;
          }
          .receipt-footer .thank-you {
            font-size: 1rem;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 8px;
          }
          @media print {
            body { background: #fff; padding: 0; }
            .receipt { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        ${receiptContent.innerHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Success Message */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)'
        }}>
          <FiCheckCircle size={40} color="#2e7d32" />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>
          Order Received!
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
          Thank you for your order! We've received it and will contact you shortly to confirm delivery details.
        </p>
      </div>

      {/* Receipt Preview */}
      <div ref={receiptRef} style={{ marginBottom: '24px' }}>
        <div className="receipt-preview" style={{ 
          background: '#fff', 
          borderRadius: 'var(--radius)', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Receipt Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
            color: '#fff', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <img src="/logo.png" alt="SparkGlow" style={{ width: '50px', height: '50px', margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
              Spark<span style={{ color: '#dc143c' }}>Glow</span>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Premium Bath & Body Care</p>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '10px' }}>
              📞 <a href="tel:0246871565" style={{ color: '#fff', textDecoration: 'none' }}>0246871565</a> | 
              💬 <a href="https://wa.me/233246871565" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>WhatsApp</a>
            </div>
          </div>

          {/* Receipt Body */}
          <div style={{ padding: '24px' }}>
            {/* Success Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              background: '#e8f5e9', 
              color: '#2e7d32', 
              padding: '12px', 
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              <FiCheckCircle size={18} />
              Order Confirmed
            </div>

            {/* Order ID */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</label>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark)', marginTop: '4px' }}>
                #{order.orderId}
              </h3>
            </div>

            {/* Date & Time */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-light)',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px dashed #e0e0e0'
            }}>
              <FiClock size={14} />
              {formattedDate} at {formattedTime}
            </div>

            {/* Customer Details */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #e0e0e0' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Customer Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                  <FiPhone size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  {order.customerInfo?.phone || order.guestInfo?.phone || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                  <FiMail size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  {order.customerInfo?.email || order.guestInfo?.email || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem' }}>
                  <FiMapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{order.shippingAddress?.location}, {order.shippingAddress?.region}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #e0e0e0' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Order Items
              </div>
              {order.items?.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ color: '#888', margin: '0 12px' }}>×{item.quantity}</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCedi(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px', color: '#666' }}>
                <span>Subtotal</span>
                <span>{formatCedi(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px', color: '#666' }}>
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : formatCedi(order.shipping)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                paddingTop: '8px',
                borderTop: '2px solid #e0e0e0',
                color: 'var(--dark)'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>{formatCedi(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Receipt Footer */}
          <div style={{ textAlign: 'center', padding: '20px 24px 24px', background: '#f8f8f8' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '8px' }}>
              Thank you for shopping with us!
            </p>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>
              We'll contact you shortly to confirm your order.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={downloadReceipt}
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '16px', gap: '10px' }}
        >
          <FiDownload size={18} />
          Download Receipt
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            to="/" 
            className="btn" 
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              background: 'var(--bg-light)', 
              color: 'var(--dark)',
              padding: '14px',
              gap: '8px'
            }}
          >
            <FiHome size={16} />
            Home
          </Link>
          <Link 
            to="/shop" 
            className="btn" 
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              background: 'var(--bg-light)', 
              color: 'var(--dark)',
              padding: '14px',
              gap: '8px'
            }}
          >
            <FiShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
