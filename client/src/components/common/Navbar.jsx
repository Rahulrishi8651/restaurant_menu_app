/**
 * Navbar — main site navigation with cart badge.
 */
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled
        ? 'rgba(15,15,15,0.96)'
        : 'linear-gradient(to bottom, rgba(15,15,15,0.8), transparent)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(58,58,58,0.6)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', height: 68,
        gap: 32,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: '1.4rem' }}>🍽️</span>
          <span>Spice<span style={{ color: 'var(--clr-primary)' }}>Route</span></span>
        </Link>

        {/* Desktop nav links */}
        <div style={{
          display: 'flex', gap: 4, marginLeft: 16,
          '@media(max-width:768px)': { display: 'none' },
        }}>
          {[['/', 'Home'], ['/menu', 'Menu'], ['/orders', 'My Orders']].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'} style={({ isActive }) => ({
              padding: '6px 16px',
              borderRadius: 8,
              color: isActive ? 'var(--clr-primary-light)' : 'rgba(255,255,255,0.75)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: isActive ? 'rgba(232,69,10,0.1)' : 'transparent',
            })}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Cart icon */}
        <Link to="/cart" style={{ position: 'relative', padding: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: 'var(--clr-primary)', color: '#fff',
              width: 18, height: 18, borderRadius: '50%',
              fontSize: '0.65rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Link>

        {/* Auth */}
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 10,
                background: 'var(--clr-surface-2)',
                border: '1px solid var(--clr-border)',
                color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--clr-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              {user?.name?.split(' ')[0]}
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: 12, padding: '8px 0',
                minWidth: 160, boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
              }}>
                <Link to="/orders" onClick={() => setDropdownOpen(false)}
                  style={{ display: 'block', padding: '10px 20px', color: 'var(--clr-text)', fontSize: '0.9rem' }}>
                  My Orders
                </Link>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}
                  style={{ display: 'block', padding: '10px 20px', color: 'var(--clr-text)', fontSize: '0.9rem' }}>
                  Profile
                </Link>
                <hr style={{ borderColor: 'var(--clr-border)', margin: '4px 0' }} />
                <button onClick={handleLogout}
                  style={{ display: 'block', padding: '10px 20px', color: 'var(--clr-error)',
                    fontSize: '0.9rem', width: '100%', textAlign: 'left' }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
