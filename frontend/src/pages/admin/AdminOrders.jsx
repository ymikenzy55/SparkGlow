import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiEye, FiX } from 'react-icons/fi'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCedi } from '../../utils/currency'
import { getImageUrl } from '../../utils/imageUrl'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const statusClass = (s) => ({ pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' }[s] || 'status-pending')

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const pages = Math.ceil(total / 20)

  const load = () => {
    setLoading(true)
    adminAPI.getOrders({ page, limit: 20, search, status: filterStatus })
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search, filterStatus])

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateOrder(id, { status })
      toast.success('Order updated')
      load()
      if (selectedOrder === id) loadOrderDetail(id)
    } catch { toast.error('Update failed') }
  }

  const loadOrderDetail = async (id) => {
    setSelectedOrder(id)
    setDetailLoading(true)
    try {
      const res = await adminAPI.getOrderDetail(id)
      setOrderDetail(res.data.order)
    } catch {
      toast.error('Failed to load order details')
    }
    setDetailLoading(false)
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Orders ({total})</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div className="admin-search"><input placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => {
                    const isNew = o.status === 'pending'
                    return (
                      <tr key={o._id} onClick={() => loadOrderDetail(o._id)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isNew && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53935' }}></span>}
                          #{o._id.slice(-8).toUpperCase()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{o.user?.name || o.guestInfo?.name || o.customerInfo?.name || 'Guest'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{o.user?.email || o.guestInfo?.email || o.customerInfo?.email}</div>
                        </td>
                        <td>{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
                        <td><strong style={{ color: 'var(--primary)' }}>{formatCedi(o.total)}</strong></td>
                        <td><span className={o.paymentStatus === 'paid' ? 'badge badge-green' : 'badge badge-gold'}>{o.paymentStatus}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }} value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => loadOrderDetail(o._id)}>
                            <FiEye size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body">
              {detailLoading ? <LoadingSpinner /> : orderDetail && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Customer Information</h4>
                    <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                      <div style={{ marginBottom: '6px' }}><strong>Name:</strong> {orderDetail.customerInfo?.name || orderDetail.user?.name || orderDetail.guestInfo?.name || 'N/A'}</div>
                      <div style={{ marginBottom: '6px' }}><strong>Email:</strong> {orderDetail.customerInfo?.email || orderDetail.user?.email || orderDetail.guestInfo?.email || 'N/A'}</div>
                      <div style={{ marginBottom: '6px' }}><strong>Phone:</strong> {orderDetail.customerInfo?.phone || orderDetail.user?.phone || orderDetail.guestInfo?.phone || 'N/A'}</div>
                      <div style={{ marginBottom: '6px' }}><strong>Region:</strong> {orderDetail.shippingAddress?.region || orderDetail.customerInfo?.region || 'N/A'}</div>
                      <div><strong>Location:</strong> {orderDetail.shippingAddress?.location || orderDetail.customerInfo?.location || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Order Items</h4>
                    {orderDetail.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                        <img src={getImageUrl(item.product?.images?.[0] || item.image)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCedi(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                      <span>Subtotal:</span>
                      <span>{formatCedi(orderDetail.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                      <span>Shipping:</span>
                      <span>{formatCedi(orderDetail.shipping)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem' }}>
                      <span>Total:</span>
                      <span style={{ color: 'var(--primary)' }}>{formatCedi(orderDetail.total)}</span>
                    </div>
                  </div>

                  {orderDetail.notes && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Order Notes</h4>
                      <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {orderDetail.notes}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '16px', fontSize: '0.875rem' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ display: 'block', marginBottom: '8px' }}>Update Order Status:</strong>
                      <select 
                        className="form-select" 
                        style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }} 
                        value={orderDetail.status} 
                        onChange={e => updateStatus(orderDetail._id, e.target.value)}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '6px' }}><strong>Payment Method:</strong> {orderDetail.paymentMethod.toUpperCase()}</div>
                    <div style={{ marginBottom: '6px' }}><strong>Payment Status:</strong> <span className={orderDetail.paymentStatus === 'paid' ? 'badge badge-green' : 'badge badge-gold'}>{orderDetail.paymentStatus}</span></div>
                    <div><strong>Current Status:</strong> <span className={`order-status ${statusClass(orderDetail.status)}`}>{orderDetail.status}</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
