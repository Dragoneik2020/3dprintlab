import { Outlet, NavLink } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

const links = [
  { to: '/two-part', label: 'Dos Partes' },
  { to: '/adaptive', label: 'Adaptativo' },
  { to: '/base', label: 'Con Base' },
  { to: '/planter', label: 'Macetero' },
];

export default function Layout() {
  const { isMobile } = useResponsive();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw' }}>
      <header style={{ borderBottom: '1px solid #1f1f2a', padding: '0 12px', flexShrink: 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', height: 52, gap: 12, overflow: 'hidden' }}>
          <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', background: 'linear-gradient(135deg,#f97316,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rincon-Z · Moldes
          </span>
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
                  padding: '6px 12px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontSize: 13,
                  color: isActive ? '#fff' : '#666',
                  background: isActive ? '#1f1f2a' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                })}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', padding: isMobile ? 8 : 16 }}>
        <Outlet />
      </main>
    </div>
  );
}