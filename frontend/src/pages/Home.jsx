import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTruck, FiShield } from 'react-icons/fi'
import { categoryAPI, productAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import HeroBanner from '../components/common/HeroBanner'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const tickerMessages = [
  '✦ Premium Handcrafted Soaps',
  '✦ 100% Natural Ingredients',
  '✦ Gentle on Sensitive Skin',
  '✦ Organic Liquid Soaps',
  '✦ Trusted by 50,000+ Customers',
  '✦ Free Delivery on Orders Over GH₵ 50',
  '✦ Luxurious Bath Experience',
  '✦ Eco-Friendly Packaging',
  '✦ Nourish & Protect Your Skin',
  '✦ Made with Love & Care'
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([categoryAPI.getAll(), productAPI.getFeatured()])
      .then(([c, p]) => { setCategories(c.data.categories); setFeatured(p.data.products) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  // Duplicate ticker messages for seamless loop
  const tickerItems = [...tickerMessages, ...tickerMessages, ...tickerMessages]

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {tickerItems.map((message, i) => (
            <div key={i} className="ticker-item">
              <span>{message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-tag">Our Collections</div>
            <h2>Shop By <span>Category</span></h2>
          </motion.div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <motion.div key={cat._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <Link to={`/category/${cat.slug}`} className="category-card">
                  <div className="category-card-img"><img src={cat.image} alt={cat.name} loading="lazy" /></div>
                  <div className="category-card-name">{cat.name}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-tag">Best Sellers</div>
            <h2>Featured <span>Products</span></h2>
            <p>Handpicked favorites loved by thousands of beauty enthusiasts</p>
          </motion.div>
          <div className="products-grid">
            {featured.slice(0, 8).map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/shop" className="btn btn-dark">View All Products <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="section">
        <div className="container">
          <div className="promo-grid">
            <motion.div className="promo-card promo-card-light" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="promo-content">
                <span className="promo-tag">Flat 25% Discount</span>
                <h3>Luxury <span>Bath Soaps</span></h3>
                <p>Pamper yourself with our premium handcrafted soap collection.</p>
                <Link to="/shop" className="btn btn-dark btn-sm">Shop Now <FiArrowRight /></Link>
              </div>
              <img src="/about1.jpg" alt="Bath soaps" />
            </motion.div>
            <motion.div className="promo-card promo-card-dark" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}>
              <div className="promo-content">
                <span className="promo-tag">Flat 20% Discount</span>
                <h3>Organic <span>Liquid Soaps</span></h3>
                <p>Gentle cleansing with natural ingredients for healthy skin.</p>
                <Link to="/shop" className="btn btn-primary btn-sm">Shop Now <FiArrowRight /></Link>
              </div>
              <img src="/about2.jpg" alt="Liquid soaps" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section about-section">
        <div className="container">
          <div className="about-grid">
            <motion.div className="about-images" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img className="about-img-1" src="/about1.jpg" alt="Soap products" />
              <img className="about-img-2" src="/about2.jpg" alt="Bath soaps" />
              <img className="about-img-3" src="/about3.jpg" alt="Natural ingredients" />
              <div className="about-badge">✦ Trusted by 50,000+ customers</div>
            </motion.div>
            <motion.div className="about-content" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="section-tag">About Us</div>
              <h2>Your Journey to <span>Pure Cleansing</span></h2>
              <p>At SparkGlow, we believe in the power of natural ingredients. We curate the finest soaps and body care products that cleanse, nourish, and protect your skin.</p>
              <p>Our mission is to bring you premium-quality bath products at accessible prices — because you deserve the best care every single day.</p>
              <div className="about-stats">
                <div className="about-stat"><strong>24+</strong><span>Categories</span></div>
                <div className="about-stat"><strong>2500+</strong><span>Products</span></div>
                <div className="about-stat"><strong>99%</strong><span>Satisfied</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
