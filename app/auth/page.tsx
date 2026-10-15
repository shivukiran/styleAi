'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handle = async () => {
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form);
      login(res.data);
      router.push('/wardrobe');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 36 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👗</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-light)' }}>StyleAI</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Your AI-powered wardrobe assistant</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--surface2)', borderRadius: 8, padding: 4 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? 'white' : 'var(--muted)',
              fontWeight: 600, fontSize: 14, textTransform: 'capitalize'
            }}>
              {m === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <input className="input" placeholder="Your name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          )}
          <input className="input" placeholder="Email address" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="input" placeholder="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handle()} />

          {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

          <button className="btn-primary" onClick={handle} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Your personal AI stylist, powered by Google Gemini
        </p>
      </div>
    </div>
  );
}
