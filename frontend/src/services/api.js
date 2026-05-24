import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sg_token')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  search: (q) => api.get('/products/search', { params: { q } }),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (slug, params) => api.get(`/categories/${slug}`, { params }),
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOne: (id) => api.get(`/orders/${id}`),
}

export const messageAPI = {
  send: (data) => api.post('/messages', data),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => {
    if (data instanceof FormData) {
      return api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    return api.post('/admin/products', data)
  },
  updateProduct: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    return api.put(`/admin/products/${id}`, data)
  },
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadImages: (formData) => api.post('/admin/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => {
    if (data instanceof FormData) {
      return api.post('/admin/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    return api.post('/admin/categories', data)
  },
  updateCategory: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/admin/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    return api.put(`/admin/categories/${id}`, data)
  },
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Settings
  changePassword: (data) => api.put('/admin/settings/password', data),
  changeEmail: (data) => api.put('/admin/settings/email', data),
  getAdmins: () => api.get('/admin/admins'),
  addAdmin: (data) => api.post('/admin/admins', data),
  removeAdmin: (id) => api.put(`/admin/admins/${id}/remove`),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/admin/notifications/read-all'),
  // Messages
  getMessages: () => api.get('/admin/messages'),
  markMessageRead: (id) => api.put(`/admin/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
  // Sales
  getSales: (params) => api.get('/admin/sales', { params }),
}
