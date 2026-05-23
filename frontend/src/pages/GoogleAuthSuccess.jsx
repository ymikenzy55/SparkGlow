import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function GoogleAuthSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Google authentication failed. Please try again.')
        navigate('/login', { replace: true })
        return
      }

      if (!token) {
        toast.error('No authentication token received.')
        navigate('/login', { replace: true })
        return
      }

      try {
        // Store token
        localStorage.setItem('sg_token', token)

        // Fetch user data
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch user data')
        }

        // Set user in context
        setUser(data.user)
        
        // Show success message
        toast.success(`Welcome back, ${data.user.name}!`)
        
        // Redirect based on role
        const redirectPath = data.user.role === 'admin' ? '/admin/dashboard' : '/'
        navigate(redirectPath, { replace: true })
        
      } catch (err) {
        localStorage.removeItem('sg_token')
        toast.error('Authentication failed. Please try again.')
        navigate('/login', { replace: true })
      }
    }

    handleGoogleAuth()
  }, [searchParams, navigate, setUser])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '20px'
    }}>
      <LoadingSpinner />
      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
        Completing authentication...
      </p>
    </div>
  )
}
