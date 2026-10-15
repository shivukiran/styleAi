'use client';
import { useState } from 'react';
import { wardrobeApi } from '@/lib/api';

interface ClothingItem {
  id: number;
  name: string;
  category: string;
  brand: string;
  color: string;
  material: string;
  weight: string;
  occasion: string;
  season: string;
  imagePath: string;
  isFavorite: boolean;
  needsLaundry: boolean;
  aiVerified: boolean;
  wearCount: number;
  notes: string;
  fit: string;
  pattern: string;
  size: string;
  secondaryColor: string;
}

interface Props {
  item: ClothingItem;
  onUpdate: (item: ClothingItem) => void;
  onDelete: (id: number) => void;
}

const OCCASION_COLORS: Record<string, string> = {
  Casual: '#4ade80', Formal: '#818cf8', Party: '#f472b6',
  'Business Casual': '#60a5fa', Sports: '#fb923c', Beach: '#34d399',
};

export default function ClothingCard({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ClothingItem>>(item);
  const [saving, setSaving] = useState(false);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await wardrobeApi.update(item.id, { ...form, aiVerified: true });
      onUpdate(res.data);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const toggleFav = async () => {
    const res = await wardrobeApi.update(item.id, { isFavorite: !item.isFavorite });
    onUpdate(res.data);
  };

  const toggleLaundry = async () => {
    const res = await wardrobeApi.update(item.id, { needsLaundry: !item.needsLaundry });
    onUpdate(res.data);
  };

  const badgeColor = OCCASION_COLORS[item.occasion] || 'var(--muted)';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Status badges */}
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, zIndex: 2 }}>
        {!item.aiVerified && (
          <span className="badge" style={{ background: '#fef08a22', color: '#fef08a', border: '1px solid #fef08a44' }}>
            ⚠ Needs review
          </span>
        )}
        {item.needsLaundry && (
          <span className="badge" style={{ background: '#f8717122', color: '#f87171', border: '1px solid #f8717144' }}>
            🧺 Laundry
          </span>
        )}
      </div>

      {/* Image */}
      <div style={{ height: 180, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.imagePath ? (
          <img src={`${apiBase}${item.imagePath}`} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 52 }}>👕</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 14 }}>
        {!editing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{item.name || 'Unnamed item'}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '2px 0 8px' }}>
                  {item.brand !== 'Unknown' ? item.brand : item.category}
                </p>
              </div>
              <button onClick={toggleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {item.isFavorite ? '⭐' : '☆'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <span className="badge" style={{ background: badgeColor + '22', color: badgeColor, border: `1px solid ${badgeColor}44` }}>
                {item.occasion}
              </span>
              <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                {item.color}
              </span>
              {item.material && (
                <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {item.material}
                </span>
              )}
              {item.weight && (
                <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {item.weight}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setEditing(true)}
                style={{ flex: 1, padding: '6px', fontSize: 12 }}>✏ Edit</button>
              <button className="btn-ghost" onClick={toggleLaundry}
                style={{ padding: '6px 10px', fontSize: 12 }}>🧺</button>
              <button onClick={() => onDelete(item.id)}
                style={{ padding: '6px 10px', background: 'none', border: '1px solid #f8717144', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#f87171' }}>
                🗑
              </button>
            </div>
          </>
        ) : (
          // Edit form
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className="input" placeholder="Name" value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 13 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Category', 'category', ['Shirt','T-Shirt','Jeans','Trousers','Dress','Skirt','Shorts','Jacket','Coat','Sweater','Hoodie','Shoes','Sneakers','Formal Shoes','Sandals','Boots','Accessory','Other']],
                ['Brand', 'brand', null],
                ['Color', 'color', null],
                ['Material', 'material', ['Cotton','Linen','Denim','Wool','Polyester','Silk','Nylon','Leather','Synthetic','Unknown']],
                ['Weight', 'weight', ['Light','Medium','Heavy']],
                ['Fit', 'fit', ['Slim','Regular','Oversized','Relaxed']],
                ['Pattern', 'pattern', ['Solid','Striped','Checkered','Floral','Graphic','Abstract','Other']],
                ['Occasion', 'occasion', ['Casual','Formal','Business Casual','Party','Sports','Beach','Travel','Ethnic']],
                ['Season', 'season', ['Summer','Winter','Monsoon','All-Season']],
                ['Size', 'size', null],
              ].map(([label, key, opts]) => (
                <div key={key as string}>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{label as string}</label>
                  {opts ? (
                    <select className="input" value={(form as any)[key as string] || ''}
                      onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))} style={{ fontSize: 12 }}>
                      <option value="">Select...</option>
                      {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="input" value={(form as any)[key as string] || ''}
                      onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))} style={{ fontSize: 12 }} />
                  )}
                </div>
              ))}
            </div>
            <textarea className="input" placeholder="Notes..." rows={2}
              value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ fontSize: 12, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: '8px', fontSize: 13 }}>
                {saving ? 'Saving...' : '✓ Save'}
              </button>
              <button className="btn-ghost" onClick={() => setEditing(false)} style={{ padding: '8px 14px', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
