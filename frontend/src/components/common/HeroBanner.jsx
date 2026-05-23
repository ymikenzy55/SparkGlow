import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const banners = [
  {
    id: 1,
    title: 'Luxurious Bath Experience',
    subtitle: 'Premium Soaps & Body Care',
    description: 'Indulge in our handcrafted soaps made with natural ingredients for a refreshing cleanse.',
    image: '/banner1.jpg',
    cta: 'Shop Soaps',
    link: '/shop'
  },
  {
    id: 2,
    title: 'Pure & Natural Cleansing',
    subtitle: 'Organic Liquid Soaps',
    description: 'Experience gentle care with our organic liquid soaps that nourish and protect your skin.',
    image: '/banner2.jpg',
    cta: 'Explore Collection',
    link: '/shop'
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
              <img src={banners[currentSlide].image} alt={banners[currentSlide].title} />
              <div className="hero-slide-overlay"></div>
            </div>
            <div className="container hero-slide-content">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="hero-badge">✦ {banners[currentSlide].subtitle}</div>
                <h1>{banners[currentSlide].title}</h1>
                <p>{banners[currentSlide].description}</p>
                <div className="hero-btns">
                  <Link to={banners[currentSlide].link} className="btn btn-primary">
                    {banners[currentSlide].cta} <FiArrowRight />
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
