import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiEye, FiX, FiTrash2, FiCalendar, FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { socket } = useSocket()
  const pages = Math.ceil(total / 20)

  const load = () => {
    setLoading(true)
    adminAPI.getOrders({ page, limit: 20, search, status: filterStatus, startDate, endDate })
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search, filterStatus, startDate, endDate])

  // Real-time updates for admin
  useEffect(() => {
    if (!socket) return

    const handleOrderUpdated = (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
        )
      )
    }

    const handleOrderDeleted = (orderId) => {
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId))
      setTotal(prev => prev - 1)
    }

    const handleNewOrder = (newOrder) => {
      setOrders(prevOrders => [newOrder, ...prevOrders])
      setTotal(prev => prev + 1)
    }

    socket.on('order-updated', handleOrderUpdated)
    socket.on('order-deleted', handleOrderDeleted)
    socket.on('new-order', handleNewOrder)

    return () => {
      socket.off('order-updated', handleOrderUpdated)
      socket.off('order-deleted', handleOrderDeleted)
      socket.off('new-order', handleNewOrder)
    }
  }, [socket])

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

  const deleteOrder = async (orderId) => {
    setDeleting(true)
    try {
      await adminAPI.deleteOrder(orderId)
      toast.success('Order deleted!')
      setShowDeleteConfirm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div>
      <div className="admin-section">
        {/* Header with title */}
        <div className="admin-section-header" style={{ flexWrap: 'wrap', gap: '12px', paddingBottom: '16px' }}>
          <h3>Orders ({total})</h3>
        </div>

        {/* Always visible search bar */}
        <div className="orders-search-row">
          <div className="orders-search-wrapper">
            <FiSearch className="orders-search-icon" size={18} />
            <input
              type="text"
              className="orders-search-input"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="orders-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`orders-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            <span>Filters</span>
          </button>
        </div>

        {/* Collapsible Filters Section */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap', 
          margin: '0 24px 20px',
          background: 'var(--bg-light)',
          padding: showFilters ? '16px' : '0',
          borderRadius: 'var(--radius-md)',
          border: showFilters ? '1px solid var(--border)' : 'none',
          overflow: 'hidden',
          maxHeight: showFilters ? '500px' : '0',
          opacity: showFilters ? 1 : 0,
          transition: 'all 0.3s ease'
        }}>
          <select 
            className="form-select" 
            style={{ flex: '0 0 auto', minWidth: '140px' }} 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap', minWidth: '280px' }}>
            <FiCalendar size={16} style={{ color: 'var(--text-light)' }} />
            <input 
              type="date" 
              className="form-input" 
              style={{ flex: '1 1 120px', minWidth: '120px', padding: '8px 12px' }}
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
            <span style={{ color: 'var(--text-light)' }}>to</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ flex: '1 1 120px', minWidth: '120px', padding: '8px 12px' }}
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>

          {(search || filterStatus || startDate || endDate) && (
            <button 
              className="btn btn-sm" 
              style={{ background: 'var(--bg-light)', padding: '8px 16px' }} 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop Table View */}
            <div className="table-scroll orders-desktop-view">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const isNew = o.status === 'pending'
                    const customerName = o.user?.name || o.guestInfo?.name || o.customerInfo?.name || 'Guest'
                    const customerEmail = o.user?.email || o.guestInfo?.email || o.customerInfo?.email
                    return (
                      <tr key={o._id} onClick={() => loadOrderDetail(o._id)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isNew && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53935' }}></span>}
                          #{o._id.slice(-8).toUpperCase()}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div 
                            style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary)' }}
                            onClick={() => setSelectedUser({
                              name: customerName,
                              email: customerEmail,
                              phone: o.user?.phone || o.guestInfo?.phone || o.customerInfo?.phone,
                              region: o.shippingAddress?.region || o.customerInfo?.region,
                              location: o.shippingAddress?.location || o.customerInfo?.location
                            })}
                          >
                            {customerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{customerEmail}</div>
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
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => loadOrderDetail(o._id)}>
                              <FiEye size={13} />
                            </button>
                            <button 
                              className="btn btn-sm" 
                              style={{ background: '#ffebee', color: '#c62828' }} 
                              onClick={() => setShowDeleteConfirm(o._id)}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="orders-mobile-view" style={{ padding: '0 16px' }}>
              {orders.map(o => {
                const isNew = o.status === 'pending'
                const customerName = o.user?.name || o.guestInfo?.name || o.customerInfo?.name || 'Guest'
                const customerEmail = o.user?.email || o.guestInfo?.email || o.customerInfo?.email
                const customerPhone = o.user?.phone || o.guestInfo?.phone || o.customerInfo?.phone
                return (
                  <div 
                    key={o._id} 
                    style={{ 
                      background: 'var(--bg-light)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '16px', 
                      marginBottom: '12px',
                      border: isNew ? '2px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    {/* Order Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {isNew && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53935' }}></span>}
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{o._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item{o.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCedi(o.total)}</div>
                        <span className={o.paymentStatus === 'paid' ? 'badge badge-green' : 'badge badge-gold'} style={{ marginTop: '4px' }}>
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info - Clickable */}
                    <div 
                      onClick={() => setSelectedUser({
                        name: customerName,
                        email: customerEmail,
                        phone: customerPhone,
                        region: o.shippingAddress?.region || o.customerInfo?.region,
                        location: o.shippingAddress?.location || o.customerInfo?.location
                      })}
                      style={{ 
                        background: '#fff', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '12px', 
                        marginBottom: '12px',
                        cursor: 'pointer',
                        border: '1px solid var(--border)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          background: 'var(--primary-light)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          flexShrink: 0
                        }}>
                          <FiUser size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>{customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {customerEmail || 'No email'}
                          </div>
                        </div>
                        <FiChevronRight size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select 
                        className="form-select" 
                        style={{ flex: 1, padding: '10px 12px', fontSize: '0.85rem' }} 
                        value={o.status} 
                        onChange={e => updateStatus(o._id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button 
                        className="btn btn-sm" 
                        style={{ background: 'var(--primary)', color: '#fff', padding: '10px 14px' }} 
                        onClick={() => loadOrderDetail(o._id)}
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        className="btn btn-sm" 
                        style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px' }} 
                        onClick={() => setShowDeleteConfirm(o._id)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination" style={{ marginTop: '20px' }}>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  <FiChevronRight size={16} />
                </button>
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
                    <div style={{ marginBottom: '20px', marginTop: '16px' }}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Order</h3>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '20px' }}>
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-light)' }} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button type="button" className="btn btn-sm" style={{ background: '#c62828', color: '#fff' }} onClick={() => deleteOrder(showDeleteConfirm)} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--primary)'
                }}>
                  <FiUser size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{selectedUser.name}</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                    <FiMail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '2px' }}>Email</div>
                      <a href={`mailto:${selectedUser.email}`} style={{ fontSize: '0.875rem', color: 'var(--dark)', wordBreak: 'break-all' }}>{selectedUser.email}</a>
                    </div>
                  </div>
                )}
                
                {selectedUser.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                    <FiPhone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '2px' }}>Phone</div>
                      <a href={`tel:${selectedUser.phone}`} style={{ fontSize: '0.875rem', color: 'var(--dark)' }}>{selectedUser.phone}</a>
                    </div>
                  </div>
                )}
                
                {(selectedUser.region || selectedUser.location) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                    <FiMapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '2px' }}>Address</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--dark)' }}>
                        {selectedUser.region && <div>{selectedUser.region}</div>}
                        {selectedUser.location && <div style={{ color: 'var(--text-light)' }}>{selectedUser.location}</div>}
                      </div>
                    </div>
                  </div>
                )}
                
                {!selectedUser.email && !selectedUser.phone && !selectedUser.region && !selectedUser.location && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                    No additional details available for this customer.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
