import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

const navItems = [
  { to: '/two-part', label: 'Dos Partes' },
  { to: '/adaptive', label: 'Adaptativo' },
  { to: '/base', label: 'Con Base' },
  { to: '/planter', label: 'Macetero' },
];

export default function Layout() {
  const { isMobile } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1f1f2a', padding: '0 16px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: isMobile ? 8 : 32 }}>
          <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18, whiteSpace: 'nowrap', background: 'linear-gradient(135deg,#f97316,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rincon-Z · Moldes
          </span>
          {isMobile ? (
            <>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: 'none', color: '#e4e4e7', fontSize: 24, cursor: 'pointer', padding: 4 }}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: 60, left: 0, right: 0, background: '#0a0a0f', borderBottom: '1px solid #1f1f2a', padding: '8px 16px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      style={({ isActive }) => ({
                        padding: '10px 14px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontSize: 14,
                        color: isActive ? '#fff' : '#888',
                        background: isActive ? '#1f1f2a' : 'transparent',
                      })}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          ) : (
            <nav style={{ display: 'flex', gap: 4 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    padding: '8px 16px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 14,
                    color: isActive ? '#fff' : '#888',
                    background: isActive ? '#1f1f2a' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 24 }}>
        <Outlet />
      </main>
    </div>
  );
}