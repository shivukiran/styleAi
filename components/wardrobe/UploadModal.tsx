'use client';
import { useState, useRef } from 'react';
import { wardrobeApi } from '@/lib/api';

interface Props {
  onAdded: (item: any) => void;
  onClose: () => void;
}

export default function UploadModal({ onAdded, onClose }: Props) {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual form
  const [manual, setManual] = useState({
    name: '', category: '', brand: '', color: '', material: '',
    weight: 'Medium', fit: 'Regular', pattern: 'Solid',
    occasion: 'Casual', season: 'All-Season', size: '', notes: ''
  });

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadFile = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await wardrobeApi.upload(file);
      onAdded(res.data.item);
      onClose();
    } catch (e: any) {
      setError('Upload failed. Check backend connection.');
    }
    setAnalyzing(false);
  };

  const addManual = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await wardrobeApi.addManual(manual);
      onAdded(res.data);
      onClose();
    } catch {
      setError('Failed to add item. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000aa', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add Clothing</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>✕</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--surface2)', borderRadius: 8, padding: 4 }}>
          {(['upload', 'manual'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? 'white' : 'var(--muted)', fontWeight: 600, fontSize: 13
            }}>
              {m === 'upload' ? '📸 Photo Upload (AI)' : '✏ Add Manually'}
            </button>
          ))}
        </div>

        {mode === 'upload' ? (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: 10, padding: 32,
                textAlign: 'center', cursor: 'pointer', marginBottom: 16,
                transition: 'border-color 0.15s',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>Click or drag & drop an image</p>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>AI will automatically detect category, color, material, and more</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} style={{ display: 'none' }} />
            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button className="btn-primary" onClick={uploadFile} disabled={!file || analyzing} style={{ width: '100%' }}>
              {analyzing ? '🤖 AI is analyzing your item...' : '✨ Upload & Analyze'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Item name (e.g. Blue Oxford Shirt)" value={manual.name}
              onChange={e => setManual(m => ({ ...m, name: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                ['Category', 'category', ['Shirt','T-Shirt','Jeans','Trousers','Dress','Skirt','Shorts','Jacket','Coat','Sweater','Hoodie','Shoes','Sneakers','Formal Shoes','Sandals','Boots','Accessory','Other']],
                ['Brand', 'brand', null],
                ['Color', 'color', null],
                ['Material', 'material', ['Cotton','Linen','Denim','Wool','Polyester','Silk','Nylon','Leather','Synthetic','Unknown']],
                ['Weight', 'weight', ['Light','Medium','Heavy']],
                ['Fit', 'fit', ['Slim','Regular','Oversized','Relaxed']],
                ['Occasion', 'occasion', ['Casual','Formal','Business Casual','Party','Sports','Beach','Travel','Ethnic']],
                ['Season', 'season', ['Summer','Winter','Monsoon','All-Season']],
                ['Pattern', 'pattern', ['Solid','Striped','Checkered','Floral','Graphic','Abstract','Other']],
                ['Size', 'size', null],
              ] as [string, keyof typeof manual, string[] | null][]).map(([label, key, opts]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{label}</label>
                  {opts ? (
                    <select className="input" value={manual[key]}
                      onChange={e => setManual(m => ({ ...m, [key]: e.target.value }))} style={{ fontSize: 13 }}>
                      <option value="">Select...</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="input" value={manual[key]}
                      onChange={e => setManual(m => ({ ...m, [key]: e.target.value }))} style={{ fontSize: 13 }} />
                  )}
                </div>
              ))}
            </div>
            <textarea className="input" placeholder="Notes (optional)" rows={2}
              value={manual.notes} onChange={e => setManual(m => ({ ...m, notes: e.target.value }))}
              style={{ resize: 'none' }} />
            {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
            <button className="btn-primary" onClick={addManual} disabled={loading || !manual.name}>
              {loading ? 'Adding...' : '+ Add to Wardrobe'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
