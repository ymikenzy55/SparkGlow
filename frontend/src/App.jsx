import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'
import NetworkError from './components/common/NetworkError'
import ScrollToTop from './components/common/ScrollToTop'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CartPage = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Account = lazy(() => import('./pages/Account'))
const GoogleAuthSuccess = lazy(() => import('./pages/GoogleAuthSuccess'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminSales = lazy(() => import('./pages/admin/AdminSales'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))

function PublicLayout() {
  const location = useLocation()
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin' && user.role !== 'superadmin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <ScrollToTop />
            <NetworkError />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem' } }} />
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/account/:tab" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="sales" element={<AdminSales />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
