import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sg_token')
    if (token) {
      authAPI.getMe()
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user)
          } else {
            localStorage.removeItem('sg_token')
          }
        })
        .catch(err => {
          console.error('Failed to fetch user:', err)
          localStorage.removeItem('sg_token')
        })
        .finally(() => {
          setLoading(false)
          setInitialCheckDone(true)
        })
    } else {
      setLoading(false)
      setInitialCheckDone(true)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('sg_token', token)
    setUser(user)
    return user
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { token, user } = res.data
    localStorage.setItem('sg_token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('sg_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (u) => setUser(u)

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateUser, initialCheckDone }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
