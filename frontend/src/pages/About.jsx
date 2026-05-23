import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export default function About() {
  const phoneNumber = '0246871565'
  const whatsappNumber = '233246871565'

  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-tag">About Us</div>
            <h2>Welcome to <span>SparkGlow</span></h2>
            <p>Your trusted partner for premium bath and body care products</p>
          </motion.div>
        </div>
      </section>

      {/* About Content */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <motion.div className="about-images" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img className="about-img-1" src="/about1.jpg" alt="SparkGlow products" />
              <img className="about-img-2" src="/about2.jpg" alt="Bath soaps" />
              <img className="about-img-3" src="/about3.jpg" alt="Natural ingredients" />
              <div className="about-badge">✦ Trusted by 50,000+ customers</div>
            </motion.div>
            <motion.div className="about-content" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2>Your Journey to <span>Pure Cleansing</span></h2>
              <p>At SparkGlow, we believe in the power of natural ingredients. We curate the finest soaps and body care products that cleanse, nourish, and protect your skin.</p>
              <p>Our mission is to bring you premium-quality bath products at accessible prices — because you deserve the best care every single day.</p>
              <p>From handcrafted soaps to organic liquid cleansers, every product is carefully selected to ensure the highest quality and effectiveness for your daily skincare routine.</p>
              <div className="about-stats">
                <div className="about-stat"><strong>24+</strong><span>Categories</span></div>
                <div className="about-stat"><strong>2500+</strong><span>Products</span></div>
                <div className="about-stat"><strong>99%</strong><span>Satisfied</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-tag">Our Values</div>
            <h2>What We <span>Stand For</span></h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <motion.div 
              style={{ background: '#fff', padding: '32px 24px', borderRadius: 'var(--radius)', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.1 }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🌿</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Natural Ingredients</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', lineHeight: '1.6' }}>We prioritize natural, organic ingredients that are gentle on your skin and the environment.</p>
            </motion.div>
            <motion.div 
              style={{ background: '#fff', padding: '32px 24px', borderRadius: 'var(--radius)', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.2 }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Premium Quality</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', lineHeight: '1.6' }}>Every product is carefully selected and tested to meet our high standards of excellence.</p>
            </motion.div>
            <motion.div 
              style={{ background: '#fff', padding: '32px 24px', borderRadius: 'var(--radius)', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.3 }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💚</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Customer Care</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', lineHeight: '1.6' }}>Your satisfaction is our priority. We're here to help you find the perfect products for your needs.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-tag">Visit Us</div>
            <h2>Our <span>Location</span></h2>
            <p>Come visit our store in Accra or reach out to us</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius)', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FiMapPin size={20} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Address</strong>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', lineHeight: '1.6' }}>Botwe Lakeside, Accra, Ghana</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FiPhone size={20} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Phone</strong>
                      <a href={`tel:${phoneNumber}`} style={{ color: 'var(--text-light)', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>{phoneNumber}</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FaWhatsapp size={20} style={{ color: '#25D366', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>WhatsApp</strong>
                      <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-light)', fontSize: '0.875rem', display: 'block' }}>Chat with us</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FiClock size={20} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Business Hours</strong>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', lineHeight: '1.6' }}>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)', height: '450px' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8076!2d-0.1870!3d5.6500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9a7d8b3e8c8b%3A0x1234567890abcdef!2sBotwe%20Lakeside%2C%20Accra!5e0!3m2!1sen!2sgh!4v1234567890123!5m2!1sen!2sgh" 
                  width="100%" 
                  height="450" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SparkGlow Location - Botwe Lakeside, Accra, Ghana"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
