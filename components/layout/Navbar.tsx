'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/wardrobe', label: 'Wardrobe', icon: '👗' },
  { href: '/stylist', label: 'AI Stylist', icon: '✨' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Left — logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Link href="/wardrobe" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>👔</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-light)', lineHeight: 1.1 }}>StyleAI</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.1 }}>Your personal stylist</div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface2)', borderRadius: 10, padding: 4 }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '7px 16px',
              borderRadius: 7,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: path === item.href ? 'var(--accent)' : 'transparent',
              color: path === item.href ? 'white' : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right — user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface2)', borderRadius: 20,
          padding: '5px 14px 5px 5px',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'white',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
            {user?.name}
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.borderColor = '#f87171';
            (e.target as HTMLButtonElement).style.color = '#f87171';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.target as HTMLButtonElement).style.color = 'var(--muted)';
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}