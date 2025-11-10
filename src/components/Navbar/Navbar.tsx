import { MenuContext } from "../../setup/context/MenuContext"
import WalletContext from "../../setup/context/walletContext"
import { useContext } from 'react'
import { Link, useLocation } from "react-router-dom"
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const walletContext = useContext(WalletContext)
  if (!walletContext) {
    throw new Error("WalletContext is undefined. Make sure your component is wrapped in WalletContext.Provider.")
  }
  const { setWallet } = walletContext
  const { menuOpen, setMenuOpen } = useContext(MenuContext)
  const location = useLocation();
  
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        backgroundColor: isActiveLink(to) ? '#1a1a1f' : 'transparent',
        color: isActiveLink(to) ? '#6CFF32' : '#e5e5e5',
        display: 'block'
      }}
      onMouseEnter={(e) => {
        if (!isActiveLink(to)) {
          e.currentTarget.style.backgroundColor = '#2a2a2f';
          e.currentTarget.style.color = '#ffffff';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActiveLink(to)) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#e5e5e5';
        }
      }}
    >
      {children}
    </Link>
  );

  const toggleMenu = () => {
    const newState = !menuOpen
    setMenuOpen(newState)
    document.body.style.overflow = newState ? 'hidden' : 'auto'
  }

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #27272a',
        height: '80px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
          }}>
            {/* Logo */}
            <Link 
              to="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <span style={{
                fontSize: '2rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #6CFF32, #8fff5c)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                fontFamily: "'Inter', sans-serif"
              }}>
                pad.meme
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            className="hidden-mobile">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/market">🔥 Discover</NavLink>
              <NavLink to="/create-launch">🚀 Launch</NavLink>
              <NavLink to="/Presale_list">Presales</NavLink>
              <NavLink to="/Create_token">Create Token</NavLink>
              <NavLink to="/Create_lock">Create Lock</NavLink>
              <NavLink to="/My_locks_list">My Locks</NavLink>
              <NavLink to="/Airdrop">Airdrop</NavLink>
            </div>

            {/* Connect Button & Mobile Menu */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div className="hidden-mobile">
                <ConnectButton />
              </div>
              <button
                onClick={toggleMenu}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="mobile-only"
                aria-label="Toggle menu"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg
                  style={{ width: '24px', height: '24px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: menuOpen ? 'block' : 'none'
        }}
        className="mobile-only"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: '100px',
          paddingBottom: '2rem',
          paddingLeft: '2rem',
          paddingRight: '2rem'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <Link
              to="/"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              Home
            </Link>
            <Link
              to="/market"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/market') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/market') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              🔥 Discover
            </Link>
            <Link
              to="/create-launch"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/create-launch') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/create-launch') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Launch
            </Link>
            <Link
              to="/Presale_list"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/Presale_list') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/Presale_list') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              Presales
            </Link>
            <Link
              to="/Create_token"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/Create_token') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/Create_token') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              Create Token
            </Link>
            <Link
              to="/Create_lock"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/Create_lock') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/Create_lock') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              Create Lock
            </Link>
            <Link
              to="/My_locks_list"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/My_locks_list') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/My_locks_list') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              My Locks
            </Link>
            <Link
              to="/Airdrop"
              onClick={toggleMenu}
              style={{
                display: 'block',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: isActiveLink('/Airdrop') ? '#1a1a1f' : 'transparent',
                color: isActiveLink('/Airdrop') ? '#6CFF32' : '#e5e5e5',
                transition: 'all 0.2s ease'
              }}
            >
              Airdrop
            </Link>
          </div>
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid #27272a',
            marginTop: '2rem'
          }}>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* CSS for responsive behavior */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .hidden-mobile {
            display: flex !important;
          }
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default Navbar
