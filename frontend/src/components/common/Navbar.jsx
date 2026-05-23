import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { productAPI, categoryAPI } from '../../services/api'
import CartDrawer from '../cart/CartDrawer'
import ConfirmModal from './ConfirmModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count, setIsOpen: openCart } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSearching(true)
      try { const r = await productAPI.search(searchQ); setResults(r.data.products) } catch {}
      setSearching(false)
    }, 400)
    return () => clearTimeout(timer.current)
  }, [searchQ])

  const pick = (p) => { setSearchOpen(false); setSearchQ(''); setResults([]); navigate(`/product/${p.slug || p._id}`) }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
      <div className="navbar-wrapper">
        <div className="announcement-bar">
          <span>Need help with your order? Call or WhatsApp us now!</span>
          <a href="tel:0246871565" className="announcement-link" style={{ color: '#fff' }}>📞 0246871565</a>
          <a href="https://wa.me/233246871565" target="_blank" rel="noopener noreferrer" className="announcement-link" style={{ color: '#25D366' }}>💬 WhatsApp</a>
        </div>
        <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="SparkGlow" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </Link>
          <ul className="navbar-nav">
            <li><NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Home</NavLink></li>
            <li><NavLink to="/shop" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Shop</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>About</NavLink></li>
            <li className="dropdown-parent" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="nav-link">Categories <FiChevronDown size={14} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} /></button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                    {categories.map(c => <Link key={c._id} to={`/category/${c.slug}`} className="dropdown-item" onClick={() => setCatOpen(false)}>{c.name}</Link>)}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
          <div className="navbar-icons">
            <div className="search-wrap">
              <button className="icon-btn" onClick={() => setSearchOpen(s => !s)}><FiSearch /></button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div className="search-dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <input autoFocus className="search-input" placeholder="Search products…" value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)} />
                    {searching && <div className="search-loading">Searching…</div>}
                    {!searching && searchQ && results.length === 0 && <div className="search-loading">No results found</div>}
                    {results.length > 0 && (
                      <div className="search-results">
                        {results.map(p => (
                          <button key={p._id} className="search-result-item" onClick={() => pick(p)}>
                            <img src={p.images[0]} alt={p.name} />
                            <div><div className="result-name">{p.name}</div><div className="result-price">${p.price.toFixed(2)}</div></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="icon-btn" onClick={() => openCart(true)}>
              <FiShoppingBag />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            {user ? (
              <div className="user-menu-wrap">
                <button className="icon-btn" onClick={() => setUserMenuOpen(s => !s)}>
                  <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setUserMenuOpen(false)} />
                      <motion.div className="user-dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ zIndex: 100 }}>
                        <div className="user-dropdown-header"><strong>{user.name}</strong><small>{user.email}</small></div>
                        <Link to="/account" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}><FiUser /> My Account</Link>
                        {user.role === 'admin' && <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>}
                        <button className="user-dropdown-item logout" onClick={() => { setShowLogoutModal(true); setUserMenuOpen(false) }}><FiLogOut /> Logout</button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="icon-btn"><FiUser /></Link>
            )}
            <button className="icon-btn mobile-menu-btn" onClick={() => setMenuOpen(s => !s)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div className="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
              <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              <div className="mobile-nav-label">Categories</div>
              {categories.map(c => <Link key={c._id} to={`/category/${c.slug}`} className="mobile-nav-link indent" onClick={() => setMenuOpen(false)}>{c.name}</Link>)}
              {user ? (
                <>
                  <Link to="/account" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>My Account</Link>
                  {user.role === 'admin' && <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                  <button className="mobile-nav-link" onClick={() => { setShowLogoutModal(true); setMenuOpen(false) }}>Logout</button>
                </>
              ) : (
                <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login / Register</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      </div>
      <CartDrawer />
    </>
  )
}
