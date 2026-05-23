import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi'
export default function Footer() {
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
              <a href="#" className="footer-social-btn"><FiTwitter /></a>
              <a href="#" className="footer-social-btn"><FiYoutube /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/category/skin-care">Skin Care</Link>
              <Link to="/category/makeup">Makeup</Link>
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
              <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.875rem'}}>+1 234 567 890</span>
              <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.875rem'}}>hello@sparkglow.com</span>
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
      </div>
    </footer>
  )
}
