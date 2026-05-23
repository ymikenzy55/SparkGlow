import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiYoutube, FiPhone } from 'react-icons/fi'
import { FaWhatsapp, FaTiktok } from 'react-icons/fa'

export default function Footer() {
  const phoneNumber = '0246871565'
  const whatsappNumber = '233246871565' // Ghana country code + number without leading 0
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="SparkGlow" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <p>Your ultimate bath and body care destination. Premium soaps and natural cleansing products — because you deserve the best care every day.</p>
            <div className="footer-socials">
              <a href="#" className="footer-social-btn"><FiInstagram /></a>
              <a href="#" className="footer-social-btn"><FiFacebook /></a>
              <a href="#" className="footer-social-btn"><FaTiktok /></a>
              <a href="#" className="footer-social-btn"><FiYoutube /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/about">About Us</Link>
              <Link to="/cart">Cart</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <div className="footer-links">
              <Link to="/category/hair-care">Hair Care</Link>
              <Link to="/category/fragrances">Fragrances</Link>
              <Link to="/category/nail-care">Nail Care</Link>
              <Link to="/category/body-care">Body Care</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="footer-links">
              <a 
                href={`tel:${phoneNumber}`} 
                style={{
                  color:'rgba(255,255,255,0.6)',
                  fontSize:'0.875rem',
                  display:'flex',
                  alignItems:'center',
                  gap:'8px',
                  transition:'color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <FiPhone size={14} /> {phoneNumber}
              </a>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color:'rgba(255,255,255,0.6)',
                  fontSize:'0.875rem',
                  display:'flex',
                  alignItems:'center',
                  gap:'8px',
                  transition:'color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <FaWhatsapp size={14} /> WhatsApp Us
              </a>
              <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.875rem'}}>Mon–Fri, 9am–6pm</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SparkGlow. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '16px', 
          marginTop: '16px', 
          borderTop: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <a 
            href="https://portfolio-sooty-eight-54.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            Built by MiqroTek
          </a>
        </div>
      </div>
    </footer>
  )
}
