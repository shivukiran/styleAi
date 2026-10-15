'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { wardrobeApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import ClothingCard from '@/components/wardrobe/ClothingCard';
import UploadModal from '@/components/wardrobe/UploadModal';

const CATEGORIES = ['All', 'Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Dress', 'Jacket', 'Shoes', 'Sneakers', 'Accessory', 'Other'];

const STAT_ICONS: Record<string, string> = {
  Shirt: '👔', 'T-Shirt': '👕', Jeans: '👖', Trousers: '👖',
  Dress: '👗', Jacket: '🧥', Shoes: '👞', Sneakers: '👟',
  Accessory: '⌚', Other: '🎽',
};

export default function WardrobePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) loadWardrobe();
  }, [user]);

  const loadWardrobe = async () => {
    setLoading(true);
    try {
      const [wardrobeRes, statsRes] = await Promise.all([
        wardrobeApi.getAll(),
        wardrobeApi.stats(),
      ]);
      setItems(wardrobeRes.data);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  };

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { loadWardrobe(); return; }
    try {
      const res = await wardrobeApi.search(q);
      setItems(res.data);
    } catch {}
  };

  const handleUpdate = (updated: any) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await wardrobeApi.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = category === 'All' ? items : items.filter(i => i.category === category);
  const unverified = items.filter(i => !i.aiVerified).length;
  const inLaundry = items.filter(i => i.needsLaundry).length;
  const favorites = items.filter(i => i.isFavorite).length;

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              My Wardrobe
            </h1>
            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 14 }}>
              {stats ? `${stats.total} items across ${Object.keys(stats.byCategory || {}).length} categories` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--accent)', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              boxShadow: '0 2px 12px rgba(124,106,247,0.4)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontSize: 18 }}>+</span> Add Clothing
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total items', value: stats?.total ?? '—', icon: '👗', color: 'var(--accent-light)' },
            { label: 'Favourites', value: favorites, icon: '⭐', color: '#fbbf24' },
            { label: 'Needs review', value: unverified, icon: '⚠️', color: '#f87171' },
            { label: 'In laundry', value: inLaundry, icon: '🧺', color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--surface2)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20,
                flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI verification banner ── */}
        {unverified > 0 && (
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <p style={{ margin: 0, color: '#fbbf24', fontSize: 13 }}>
              <strong>{unverified} items</strong> need manual review — AI may have missed some details.
              Click <strong>Edit</strong> on any card to correct them.
            </p>
          </div>
        )}

        {/* ── Category stats strip ── */}
        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div style={{
            display: 'flex', gap: 10, marginBottom: 24,
            overflowX: 'auto', paddingBottom: 4,
          }}>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '12px 18px', borderRadius: 12, whiteSpace: 'nowrap',
                  minWidth: 80, cursor: 'pointer', flexShrink: 0,
                  background: category === cat ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 20, marginBottom: 4 }}>
                  {STAT_ICONS[cat] || '👕'}
                </span>
                <span style={{
                  fontSize: 18, fontWeight: 700,
                  color: category === cat ? 'white' : 'var(--accent-light)',
                }}>
                  {count as number}
                </span>
                <span style={{
                  fontSize: 11,
                  color: category === cat ? 'rgba(255,255,255,0.8)' : 'var(--muted)',
                  marginTop: 2,
                }}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Search + filter ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search input */}
          <div style={{
            flex: 1, minWidth: 240,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              placeholder="Search color, brand, occasion..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontSize: 14, width: '100%',
              }}
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: 16, lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  background: category === cat ? 'var(--accent)' : 'transparent',
                  color: category === cat ? 'white' : 'var(--muted)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results label ── */}
        {!loading && (
          <div style={{ marginBottom: 16, color: 'var(--muted)', fontSize: 13 }}>
            {search
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
              : `Showing ${filtered.length} item${filtered.length !== 1 ? 's' : ''}`
            }
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 15 }}>Loading your wardrobe...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>
              {search ? '🔍' : '👗'}
            </div>
            <h2 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 8, fontSize: 20 }}>
              {search ? 'Nothing matched' : 'Your wardrobe is empty'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
              {search
                ? `No items found for "${search}". Try a different term.`
                : 'Add your first clothing item to get started.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowUpload(true)}
                style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: 'var(--accent)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                + Add first item
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {filtered.map(item => (
              <ClothingCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onAdded={item => { setItems(prev => [item, ...prev]); setShowUpload(false); }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}