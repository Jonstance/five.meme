import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import BNBLaunchPad from "../../ABIs/BNBLaunchPad.json"
import { getSigner } from "../../utility/getSigner"

const Home = () => {
  const [data, setData] = useState<any[]>([])
  const [contributions, setContributions] = useState<number>(0)
  const [participants, setParticipants] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  const fetchData = async () => {
    const baseUrl = "/api"
    try {
      const response = await axios.get(baseUrl + "/projects")
      console.log("Fetched project data:", response.data)
      setData(response.data)
    } catch (err) {
      console.error("Error fetching project data:", err)
    }
  }

  const getParticipants = async (data: any[]) => {
    try {
      const signer = await getSigner()
      let total = 0

      for (let item of data) {
        if (item.presaleAddress) {
          const launchPadContract = new ethers.Contract(
            item.presaleAddress,
            BNBLaunchPad.abi,
            signer
          )
          const participantCount = await launchPadContract.getNumberOfParticipants()
          total += Number(participantCount)
        }
      }

      setParticipants(total)
    } catch (err) {
      console.error("Error fetching participants:", err)
    }
  }

  const getContributions = async (data: any[]) => {
    try {
      const signer = await getSigner()
      let total = 0

      for (let item of data) {
        if (item.presaleAddress) {
          const launchPadContract = new ethers.Contract(
            item.presaleAddress,
            BNBLaunchPad.abi,
            signer
          )
          const contributionAmount = await launchPadContract.getTotalContributions()
          total += Number(ethers.formatEther(contributionAmount))
        }
      }

      setContributions(total)
    } catch (err) {
      console.error("Error fetching contributions:", err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      getParticipants(data)
      getContributions(data)
    }
  }, [data])

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0f', 
      color: '#ffffff',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a1f 50%, #0a0a0f 100%)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(243, 186, 47, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Main Logo */}
            <motion.h1 
              style={{
                fontSize: 'clamp(4rem, 10vw, 10rem)',
                fontWeight: '900',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #f3ba2f 0%, #8b5cf6 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              pad.meme
            </motion.h1>
            
            {/* Subtitle */}
            <motion.div 
              style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                color: '#e5e5e5',
                fontWeight: '600',
                letterSpacing: '0.1em',
                marginBottom: '3rem',
                textTransform: 'uppercase'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              The Ultimate Meme Token Launchpad
            </motion.div>
            
            {/* Description */}
            <motion.p 
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
                color: '#e5e5e5',
                marginBottom: '4rem',
                maxWidth: '900px',
                margin: '0 auto 4rem auto',
                lineHeight: '1.7',
                fontWeight: '400'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              🚀 Launch your meme token in minutes with{' '}
              <span style={{ color: '#f3ba2f', fontWeight: '700' }}>zero coding</span>,{' '}
              <span style={{ color: '#8b5cf6', fontWeight: '700' }}>instant deployment</span>, and{' '}
              <span style={{ color: '#3b82f6', fontWeight: '700' }}>moon potential</span>!
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              style={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '4rem'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/Create_presale" 
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                    color: '#000',
                    padding: '1.5rem 3rem',
                    borderRadius: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 10px 30px rgba(243, 186, 47, 0.3)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Launch Your Token
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/Presale_list" 
                  style={{
                    display: 'inline-block',
                    background: 'transparent',
                    color: '#f3ba2f',
                    padding: '1.5rem 3rem',
                    borderRadius: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    border: '2px solid #f3ba2f',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Explore Projects
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #141419 0%, #1a1a1f 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #f3ba2f, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            🚀 Platform Statistics
          </motion.h2>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Stat Card 1 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02, borderColor: '#f3ba2f' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                color: '#f3ba2f',
                marginBottom: '0.5rem'
              }}>
                {data.length}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#e5e5e5', fontWeight: '600' }}>
                Active Projects
              </div>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>
                {participants.toLocaleString()}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#e5e5e5', fontWeight: '600' }}>
                Total Participants
              </div>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                {contributions.toFixed(1)}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#e5e5e5', fontWeight: '600' }}>
                BNB Raised
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Now Banner */}
      <section style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #f3ba2f 0%, #8b5cf6 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          animation: 'scroll 30s linear infinite'
        }}>
          <span style={{ color: '#000', fontWeight: '700', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            🔥 TRENDING: DOGE2.0 +2847% • MOON +1234% • PEPE3.0 +892% • SHIB2.0 +654%
          </span>
          <span style={{ color: '#000', fontWeight: '700', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            🔥 TRENDING: DOGE2.0 +2847% • MOON +1234% • PEPE3.0 +892% • SHIB2.0 +654%
          </span>
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </section>

      {/* Market Overview */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #141419 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '3rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f3ba2f, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            🚀 Market Overview
          </motion.h2>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Market Cap */}
            <div style={{
              background: 'linear-gradient(135deg, #141419, #1a1a1f)',
              border: '1px solid #27272a',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f3ba2f', marginBottom: '0.5rem' }}>
                $2.4M
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e5e5e5' }}>Total Market Cap</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>+24.5% (24h)</div>
            </div>

            {/* 24h Volume */}
            <div style={{
              background: 'linear-gradient(135deg, #141419, #1a1a1f)',
              border: '1px solid #27272a',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                $156K
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e5e5e5' }}>24h Volume</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>+67.8% (24h)</div>
            </div>

            {/* Active Presales */}
            <div style={{
              background: 'linear-gradient(135deg, #141419, #1a1a1f)',
              border: '1px solid #27272a',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6', marginBottom: '0.5rem' }}>
                {data.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e5e5e5' }}>Active Presales</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>Live Now</div>
            </div>

            {/* Success Rate */}
            <div style={{
              background: 'linear-gradient(135deg, #141419, #1a1a1f)',
              border: '1px solid #27272a',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginBottom: '0.5rem' }}>
                94%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e5e5e5' }}>Success Rate</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>Fully Funded</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Projects Ticker */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #1a1a1f 0%, #0a0a0f 100%)',
        borderTop: '1px solid #27272a',
        borderBottom: '1px solid #27272a'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f3ba2f',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              🔥 Latest Launches
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {data.slice(0, 3).map((project, index) => (
                <motion.div
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                    border: '1px solid #27272a',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ scale: 1.02, borderColor: '#f3ba2f' }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: 0
                    }}>
                      {project.tokenName || 'New Token'}
                    </h4>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      animation: 'pulse 2s infinite'
                    }}>
                      LIVE
                    </span>
                  </div>
                  <p style={{
                    color: '#a1a1aa',
                    fontSize: '0.9rem',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.4'
                  }}>
                    {project.tokenSymbol || 'MEME'} • Presale Active
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Progress</div>
                      <div style={{
                        width: '120px',
                        height: '6px',
                        background: '#27272a',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginTop: '0.25rem'
                      }}>
                        <div style={{
                          width: `${Math.random() * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #f3ba2f, #fbbf24)',
                        }}></div>
                      </div>
                    </div>
                    <Link
                      to={`/Presale_list`}
                      style={{
                        background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                        color: '#000',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      View
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            {data.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#a1a1aa',
                padding: '3rem 0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <p>First projects launching soon!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hot Picks / Featured Launches */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #141419 0%, #1a1a1f 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '3rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ef4444, #f3ba2f)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            🔥 Hot Picks - Ending Soon!
          </motion.h2>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Hot Pick 1 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #1a1a1f, #141419)',
                border: '2px solid #ef4444',
                borderRadius: '1.5rem',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hot Badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                animation: 'pulse 2s infinite'
              }}>
                🔥 HOT
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  MoonDoge 🚀
                </h3>
                <p style={{
                  color: '#a1a1aa',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  The next 1000x meme token with automatic burns and reflections
                </p>
              </div>

              {/* Countdown Timer */}
              <div style={{
                background: '#0a0a0f',
                border: '1px solid #27272a',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                  Presale Ends In:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>12</div>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>DAYS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>08</div>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>HRS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>23</div>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>MIN</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>45</div>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>SEC</div>
                  </div>
                </div>
              </div>

              {/* Progress and Stats */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Progress</span>
                  <span style={{ fontSize: '0.9rem', color: '#f3ba2f', fontWeight: '600' }}>87%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#27272a',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '87%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #ef4444, #f3ba2f)',
                  }}></div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#a1a1aa'
                }}>
                  <span>245 BNB raised</span>
                  <span>280 BNB goal</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to="/Presale_list"
                style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                🔥 Join Presale Now
              </Link>
            </motion.div>

            {/* Hot Pick 2 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #1a1a1f, #141419)',
                border: '2px solid #f3ba2f',
                borderRadius: '1.5rem',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Featured Badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                color: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}>
                ⭐ FEATURED
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  SafeRocket 🛡️
                </h3>
                <p style={{
                  color: '#a1a1aa',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  Audited smart contract with automatic liquidity pool creation
                </p>
              </div>

              {/* Price Chart Placeholder */}
              <div style={{
                background: '#0a0a0f',
                border: '1px solid #27272a',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                  Current Price
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f3ba2f', marginBottom: '0.5rem' }}>
                  $0.000012
                </div>
                <div style={{ fontSize: '0.9rem', color: '#10b981' }}>
                  +156.7% (24h)
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8b5cf6' }}>2.4K</div>
                  <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Holders</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#3b82f6' }}>67%</div>
                  <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Funded</div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to="/Presale_list"
                style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                  color: '#000',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                ⭐ View Details
              </Link>
            </motion.div>

            {/* Quick Launch CTA */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                borderRadius: '1.5rem',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '1rem'
              }}>
                Launch Your Token
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                Join the hottest tokens! Create your presale in 5 minutes and get featured.
              </p>
              <Link
                to="/Create_presale"
                style={{
                  display: 'inline-block',
                  background: '#ffffff',
                  color: '#8b5cf6',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
              >
                🚀 Start Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #141419 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #f3ba2f, #3b82f6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose pad.meme?
          </motion.h2>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#f3ba2f' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚡</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#f3ba2f', 
                marginBottom: '1rem' 
              }}>
                Lightning Fast
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Deploy your meme token in under 5 minutes with our streamlined process
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#8b5cf6', 
                marginBottom: '1rem' 
              }}>
                Secure & Audited
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Enterprise-grade security with audited smart contracts for peace of mind
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💎</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#3b82f6', 
                marginBottom: '1rem' 
              }}>
                Low Fees
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Minimal platform costs to maximize your project's potential returns
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #141419 0%, #0a0a0f 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #f3ba2f)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Launch in 3 Simple Steps
          </motion.h2>
          <motion.p 
            style={{
              fontSize: '1.2rem',
              color: '#e5e5e5',
              marginBottom: '4rem',
              maxWidth: '600px',
              margin: '0 auto 4rem auto'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From meme idea to moon mission in minutes
          </motion.p>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              marginTop: '3rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Step 1 */}
            <motion.div 
              style={{
                position: 'relative',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                fontSize: '2rem',
                fontWeight: '900',
                color: '#000'
              }}>
                1
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#f3ba2f', 
                marginBottom: '1rem' 
              }}>
                Create Token
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Set your token name, symbol, and supply. Our smart contracts handle the rest automatically.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              style={{
                position: 'relative',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                fontSize: '2rem',
                fontWeight: '900',
                color: '#fff'
              }}>
                2
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#8b5cf6', 
                marginBottom: '1rem' 
              }}>
                Launch Presale
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Configure your presale parameters and let the community discover your project.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              style={{
                position: 'relative',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                fontSize: '2rem',
                fontWeight: '900',
                color: '#fff'
              }}>
                3
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#3b82f6', 
                marginBottom: '1rem' 
              }}>
                Go to Moon
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5', lineHeight: '1.6' }}>
                Raise funds, build community, and launch to PancakeSwap for trading.
              </p>
            </motion.div>
          </motion.div>

          {/* CTA after steps */}
          <motion.div
            style={{ marginTop: '4rem' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/Create_presale" 
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                color: '#000',
                padding: '1.25rem 2.5rem',
                borderRadius: '1rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(243, 186, 47, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Start Your Launch Now 🚀
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Community Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a1f 100%)',
        borderTop: '1px solid #27272a'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Join the Meme Revolution
          </motion.h2>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Community Stat 1 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: '900', 
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                10,000+
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5' }}>
                Diamond Hand Holders
              </p>
            </motion.div>

            {/* Community Stat 2 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: '900', 
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>
                50+
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5' }}>
                Tokens Mooned
              </p>
            </motion.div>

            {/* Community Stat 3 */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, #141419, #1a1a1f)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid #27272a',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02, borderColor: '#f3ba2f' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: '900', 
                color: '#f3ba2f',
                marginBottom: '0.5rem'
              }}>
                24/7
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#e5e5e5' }}>
                Community Support
              </p>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a
              href="https://t.me/padmeme"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #0088cc, #0066aa)',
                color: '#ffffff',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              📱 Join Telegram
            </a>
            <a
              href="https://twitter.com/padmeme"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #1da1f2, #0d8bd9)',
                color: '#ffffff',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              🐦 Follow Twitter
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home