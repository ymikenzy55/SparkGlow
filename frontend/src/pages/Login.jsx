import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let user
      if (tab === 'login') {
        user = await login(form.email, form.password)
      } else {
        if (!form.name) { toast.error('Name is required'); setLoading(false); return }
        user = await register(form.name, form.email, form.password)
      }
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!')
      // For admins, use a hard reload to ensure all contexts (auth, socket, cart)
      // are fully synchronized before the admin dashboard mounts. Soft navigation
      // can cause the dashboard to render with stale auth state.
      if (user.role === 'admin' || user.role === 'superadmin') {
        window.location.href = '/admin/dashboard'
        return
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="auth-page">
      <div className="auth-image">
        <div className="auth-image-overlay">
          <div className="auth-quote">
            <h2>Pure & Natural Cleansing</h2>
            <p>Your ultimate bath and body care destination. Discover premium soaps crafted just for you.</p>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <motion.div className="auth-form-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="SparkGlow" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>
          <p className="auth-subtitle">Your bath care journey starts here</p>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>
          <form onSubmit={submit}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input required type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPw ? 'text' : 'password'} className="form-input" style={{ paddingRight: '44px' }} placeholder={tab === 'register' ? 'Min 6 characters' : 'Your password'} minLength={6} value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Login to Account' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-oauth-btn"
            disabled={loading}
          >
            <FcGoogle style={{ fontSize: '1.5rem' }} />
            <span>Continue with Google</span>
          </button>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-light)' }}>
              Don&apos;t have an account? <button style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }} onClick={() => setTab('register')}>Register</button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
