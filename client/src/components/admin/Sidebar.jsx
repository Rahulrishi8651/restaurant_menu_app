/**
 * Admin Sidebar — navigation for admin panel.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/orders',    icon: '📦', label: 'Orders' },
  { path: '/admin/menu',      icon: '🍽️', label: 'Menu' },
  { path: '/admin/users',     icon: '👥', label: 'Users' },
];

const Sidebar = () => {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <aside style={{
      width: 240, minHeight: '100vh',
      background: 'var(--clr-surface)',
      borderRight: '1px solid var(--clr-border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--clr-border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem', fontWeight: 700,
          color: '#fff', marginBottom: 4,
        }}>
          🍽️ Spice<span style={{ color: 'var(--clr-primary)' }}>Route</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
          Admin Console
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10,
            marginBottom: 4,
            color: isActive ? 'var(--clr-primary-light)' : 'var(--clr-text-muted)',
            background: isActive ? 'rgba(232,69,10,0.12)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: isActive ? '1px solid rgba(232,69,10,0.25)' : '1px solid transparent',
          })}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{
        padding: '16px', borderTop: '1px solid var(--clr-border)',
      }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--clr-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem',
          }}>
            {admin?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text)' }}>
              {admin?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
              {admin?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '9px',
          background: 'rgba(244,67,54,0.1)',
          border: '1px solid rgba(244,67,54,0.25)',
          borderRadius: 8, color: 'var(--clr-error)',
          fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          → Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
