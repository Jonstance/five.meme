import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import "./Home.scss"

const Home = () => {
  const [stats, setStats] = useState({
    launches: 0,
    volume: '0',
    traders: 0,
    graduated: 0
  })

  // Fetch platform stats
  useEffect(() => {
    // TODO: Replace with actual API calls when backend is ready
    setStats({
      launches: 47,
      volume: '1.2M',
      traders: 1834,
      graduated: 12
    })
  }, [])

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        {/* Background decoration */}
        <div className="hero-glow"></div>

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              ⚡ Powered by Bonding Curves
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="hero-title"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Launch & Trade
              <br />
              <span className="hero-title-gradient">Meme Tokens</span>
              <br />
              Instantly
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Fair Launch • Instant Trading • Auto DEX Listing
            </motion.div>

            {/* Description */}
            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              No presale, no waiting. Trade immediately on bonding curves with{' '}
              <span className="highlight">anti-sniping protection</span>,{' '}
              <span className="highlight">fair pricing</span>, and{' '}
              <span className="highlight">automatic PancakeSwap graduation</span>.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/create-launch" className="btn-primary-large">
                  🚀 Create Launch
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/market" className="btn-secondary-large">
                  🔥 Discover Tokens
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="stat-item">
                <span className="stat-value">{stats.launches}</span>
                <span className="stat-label">Launches</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">${stats.volume}</span>
                <span className="stat-label">Volume</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{stats.traders}</span>
                <span className="stat-label">Traders</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{stats.graduated}</span>
                <span className="stat-label">Graduated</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">
              How It <span className="text-neon">Works</span>
            </h2>
            <p className="section-subtitle">
              Launch and trade in minutes with our bonding curve system
            </p>
          </motion.div>

          <div className="steps-grid">
            <motion.div
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="step-number">1</div>
              <div className="step-icon">🚀</div>
              <h3 className="step-title">Create Launch</h3>
              <p className="step-description">
                Deploy your token and bonding curve in one transaction. No coding required, just fill the form.
              </p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="step-number">2</div>
              <div className="step-icon">📈</div>
              <h3 className="step-title">Trade Instantly</h3>
              <p className="step-description">
                Buy and sell immediately on the bonding curve. Price increases as supply is sold.
              </p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="step-number">3</div>
              <div className="step-icon">🎓</div>
              <h3 className="step-title">Auto Graduate</h3>
              <p className="step-description">
                At 80% sold, tokens automatically list on PancakeSwap with locked liquidity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">
              Why Choose <span className="text-neon">pad.meme</span>
            </h2>
          </motion.div>

          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="feature-icon">🛡️</div>
              <h3>Anti-Sniping</h3>
              <p>First 3 blocks have max buy limits to prevent whales from dominating launches.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="feature-icon">⏰</div>
              <h3>Rush Mode</h3>
              <p>10-minute time-locked selling prevents immediate pump-and-dump schemes.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="feature-icon">💰</div>
              <h3>Referral Rewards</h3>
              <p>Earn 0.25% of trading fees by referring others. Built-in viral growth.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="feature-icon">⚖️</div>
              <h3>Fair Launch</h3>
              <p>Everyone buys at the same bonding curve price. No presale advantages.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="feature-icon">🔄</div>
              <h3>Instant Trading</h3>
              <p>No waiting periods. Buy and sell tokens immediately after launch.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="feature-icon">🎯</div>
              <h3>Auto DEX Listing</h3>
              <p>Automatic PancakeSwap listing when bonding curve reaches target.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-title">Ready to Launch Your Token?</h2>
            <p className="cta-description">
              Join the fair launch revolution. No presale, no waiting, just instant trading.
            </p>
            <div className="cta-actions">
              <Link to="/create-launch" className="btn-primary-large">
                🚀 Create Launch Now
              </Link>
              <Link to="/market" className="btn-outline-large">
                View Live Launches
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
