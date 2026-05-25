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

// Lazy loading with retry logic for chunk loading failures
const lazyWithRetry = (componentImport) => 
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )

    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version of the application
        // Let's refresh the page immediately
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        return window.location.reload()
      }
      // The page has already been reloaded
      // Assuming that user is already using the latest version of the application
      // Let's let the application crash and raise the error
      throw error
    }
  })

const Home = lazyWithRetry(() => import('./pages/Home'))
const Shop = lazyWithRetry(() => import('./pages/Shop'))
const About = lazyWithRetry(() => import('./pages/About'))
const CategoryPage = lazyWithRetry(() => import('./pages/CategoryPage'))
const ProductDetail = lazyWithRetry(() => import('./pages/ProductDetail'))
const CartPage = lazyWithRetry(() => import('./pages/Cart'))
const Checkout = lazyWithRetry(() => import('./pages/Checkout'))
const OrderSuccess = lazyWithRetry(() => import('./pages/OrderSuccess'))
const Login = lazyWithRetry(() => import('./pages/Login'))
const Account = lazyWithRetry(() => import('./pages/Account'))
const GoogleAuthSuccess = lazyWithRetry(() => import('./pages/GoogleAuthSuccess'))
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazyWithRetry(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazyWithRetry(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazyWithRetry(() => import('./pages/admin/AdminUsers'))
const AdminCategories = lazyWithRetry(() => import('./pages/admin/AdminCategories'))
const AdminSettings = lazyWithRetry(() => import('./pages/admin/AdminSettings'))
const AdminSales = lazyWithRetry(() => import('./pages/admin/AdminSales'))
const AdminMessages = lazyWithRetry(() => import('./pages/admin/AdminMessages'))
const AdminHeroBanners = lazyWithRetry(() => import('./pages/admin/AdminHeroBanners'))

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

function CheckoutLayout() {
  const location = useLocation()
  return (
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
                  <Route path="/about" element={<About />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/account/:tab" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                </Route>
                <Route element={<CheckoutLayout />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
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
                  <Route path="hero-banners" element={<AdminHeroBanners />} />
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
