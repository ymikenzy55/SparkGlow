import { useState, useEffect } from 'react'
import { FiUsers, FiBox, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCedi } from '../../utils/currency'

const statusClass = (s) => ({ pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' }[s] || 'status-pending')

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

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
