import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCedi } from '../../utils/currency'
import { FiCalendar, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'

export default function AdminSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 })

  const load = () => {
    setLoading(true)
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    adminAPI.getSales(params)
      .then(r => {
        setSales(r.data.sales)
        setStats(r.data.stats)
      })
      .catch(err => {
        console.error('Failed to load sales:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [startDate, endDate])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getLastWeekDate = () => {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    return lastWeek.toISOString().split('T')[0]
  }

  const getLastMonthDate = () => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return lastMonth.toISOString().split('T')[0]
  }

  const quickFilter = (type) => {
    const today = getTodayDate()
    switch(type) {
      case 'today':
        setStartDate(today)
        setEndDate(today)
        break
      case 'week':
        setStartDate(getLastWeekDate())
        setEndDate(today)
        break
      case 'month':
        setStartDate(getLastMonthDate())
        setEndDate(today)
        break
      case 'all':
        setStartDate('')
        setEndDate('')
        break
      default:
        break
    }
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Sales Report</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => quickFilter('today')}>
              Today
            </button>
            <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => quickFilter('week')}>
              Last 7 Days
            </button>
            <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => quickFilter('month')}>
              Last 30 Days
            </button>
            <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => quickFilter('all')}>
              All Time
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
              <label className="form-label">
                <FiCalendar size={14} style={{ marginRight: '4px' }} />
                Start Date
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                max={getTodayDate()}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
              <label className="form-label">
                <FiCalendar size={14} style={{ marginRight: '4px' }} />
                End Date
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                max={getTodayDate()}
                min={startDate}
              />
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={load}
              style={{ height: '44px' }}
            >
              Apply Filter
            </button>
            {(startDate || endDate) && (
              <button 
                className="btn btn-sm" 
                style={{ background: 'var(--bg-light)', height: '44px' }} 
                onClick={() => { setStartDate(''); setEndDate('') }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="stat-cards" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-card-icon green" style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
              GH₵
            </div>
            <h4>{formatCedi(stats.totalRevenue)}</h4>
            <p>Total Revenue</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiShoppingBag />
            </div>
            <h4>{stats.totalOrders}</h4>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon gold">
              <FiTrendingUp />
            </div>
            <h4>{formatCedi(stats.avgOrderValue)}</h4>
            <p>Avg Order Value</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon pink">
              <FiShoppingBag />
            </div>
            <h4>{stats.totalSales}</h4>
            <p>Items Sold</p>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <h4 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Sales by Date</h4>
            {sales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                No sales data for the selected period
              </div>
            ) : (
              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Orders</th>
                      <th>Items Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 500 }}>{formatDate(sale.date)}</td>
                        <td>{sale.orderCount}</td>
                        <td>{sale.itemsSold}</td>
                        <td>
                          <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                            {formatCedi(sale.revenue)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--bg-light)', fontWeight: 'bold' }}>
                      <td>TOTAL</td>
                      <td>{stats.totalOrders}</td>
                      <td>{stats.totalSales}</td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                          {formatCedi(stats.totalRevenue)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
