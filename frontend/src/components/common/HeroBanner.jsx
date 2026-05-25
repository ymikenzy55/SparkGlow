import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { heroBannerAPI } from '../../services/api'
import { useSocket } from '../../context/SocketContext'

export default function HeroBanner() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const { socket } = useSocket()

  useEffect(() => {
    heroBannerAPI.getAll()
      .then(res => { setBanners(res.data.banners || []) })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }, [])

  // Listen for real-time hero banner updates
  useEffect(() => {
    if (!socket) return

    socket.on('hero-banner-created', () => {
      heroBannerAPI.getAll().then(res => setBanners(res.data.banners || []))
    })

    socket.on('hero-banner-updated', () => {
      heroBannerAPI.getAll().then(res => setBanners(res.data.banners || []))
    })

    socket.on('hero-banner-deleted', () => {
      heroBannerAPI.getAll().then(res => setBanners(res.data.banners || []))
    })

    return () => {
      socket.off('hero-banner-created')
      socket.off('hero-banner-updated')
      socket.off('hero-banner-deleted')
    }
  }, [socket])

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  // Show loading or fallback if no banners
  if (loading || banners.length === 0) {
    return (
      <section className="hero-banner">
        <div className="hero-banner-container">
          <div className="hero-slide">
            <div className="hero-slide-bg hero-slide-bg-gradient">
              <div className="hero-slide-overlay"></div>
            </div>
            <div className="container hero-slide-content">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                <div className="hero-badge">✦ Premium Soaps & Body Care</div>
                <h1>Luxurious Bath Experience</h1>
                <p>Indulge in our handcrafted soaps made with natural ingredients for a refreshing cleanse.</p>
                <div className="hero-btns">
                  <Link to="/shop" className="btn btn-primary">Shop Now <FiArrowRight /></Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Get current banner safely after we know banners exist
  const currentBanner = banners[currentSlide] || banners[0]

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    setCurrentSlide((prev) => {
      let next = prev + newDirection
      if (next < 0) next = banners.length - 1
      if (next >= banners.length) next = 0
      return next
    })
  }

  return (
    <section className="hero-banner">
      <div className="hero-banner-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="hero-slide"
          >
            <div className="hero-slide-bg">
              <img src={currentBanner.image} alt={currentBanner.title || 'SparkGlow'} />
              <div className="hero-slide-overlay"></div>
            </div>
            <div className="container hero-slide-content">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="hero-badge">✦ {currentBanner.subtitle || 'Premium Soaps & Body Care'}</div>
                <h1>{currentBanner.title || 'Luxurious Bath Experience'}</h1>
                <p>{currentBanner.description || 'Indulge in our handcrafted soaps made with natural ingredients for a refreshing cleanse.'}</p>
                <div className="hero-btns">
                  <Link to={currentBanner.link || '/shop'} className="btn btn-primary">
                    {currentBanner.cta || 'Shop Now'} <FiArrowRight />
                  </Link>
                  <Link to="/shop" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)' }}>View All Products</Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          className="hero-nav-btn hero-nav-prev"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
        >
          <FiChevronLeft />
        </button>
        <button
          className="hero-nav-btn hero-nav-next"
          onClick={() => paginate(1)}
          aria-label="Next slide"
        >
          <FiChevronRight />
        </button>

        {/* Dots Indicator */}
        <div className="hero-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1)
                setCurrentSlide(index)
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
