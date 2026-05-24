import { useState, useEffect, useCallback } from 'react'
import { FiUsers, FiBox, FiShoppingBag, FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCedi } from '../../utils/currency'

const statusClass = (s) => ({ pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' }[s] || 'status-pending')

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadDashboard = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true)
    setError(null)
    try {
      const r = await adminAPI.getDashboard()
      setData(r.data)
      setError(null)
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard. The server may be waking up.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Auto-retry once after 3 seconds if first attempt fails (handles cold start)
  useEffect(() => {
    if (error && retryCount === 0) {
      const timer = setTimeout(() => {
        setRetryCount(1)
        loadDashboard(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, retryCount, loadDashboard])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
      <LoadingSpinner />
      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center' }}>
        Loading dashboard...
      </p>
    </div>
  )

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <h3 style={{ color: 'var(--dark)', margin: 0 }}>Couldn't load dashboard</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', maxWidth: '400px' }}>
          {error || 'Something went wrong loading your data.'}
          {retryCount > 0 && ' Please try again — the server may take a moment to wake up.'}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => { setRetryCount(c => c + 1); loadDashboard() }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiRefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  const { stats, recentOrders, lowStock } = data

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <FiUsers size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <h4>{stats.totalUsers}</h4>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <FiBox size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <h4>{stats.totalProducts}</h4>
          <p>Products</p>
        </div>
        <div className="stat-card">
          <FiShoppingBag size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <h4>{stats.totalOrders}</h4>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <FiTrendingUp size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <h4>{formatCedi(stats.totalRevenue)}</h4>
          <p>Revenue</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="admin-section">
          <div className="admin-section-header"><h3>Recent Orders</h3></div>
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id}>
                    <td>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>{o.user?.name || o.guestInfo?.name || o.customerInfo?.name || 'Guest'}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{formatCedi(o.total)}</strong></td>
                    <td><span className={`order-status ${statusClass(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-section">
          <div className="admin-section-header"><h3>Low Stock Alert</h3></div>
          {lowStock.length === 0 ? (
            <div style={{ padding: '24px', color: 'var(--text-light)', fontSize: '0.875rem' }}>All products are well-stocked ✓</div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Stock</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td><span className={p.stock === 0 ? 'badge badge-red' : 'low-stock'}>{p.stock === 0 ? 'OUT' : p.stock}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
