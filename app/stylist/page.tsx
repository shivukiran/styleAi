'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { aiApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

interface Message {
  role: 'user' | 'ai';
  content: string;
  loading?: boolean;
}

const QUICK_PROMPTS = [
  'What should I wear to work today?',
  'I have a job interview tomorrow',
  'Suggest something for a first date',
  'Casual weekend outfit',
  'I want to look confident',
  'Outfit for a party tonight',
];

export default function StylistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hi! I'm your AI stylist. I know your wardrobe and can recommend outfits for any occasion. What are you dressing for today?" }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState('');
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [showGaps, setShowGaps] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || thinking) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: query };
    const loadingMsg: Message = { role: 'ai', content: '', loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setThinking(true);

    try {
      const res = await aiApi.recommend(query);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', content: res.data.recommendation }
      ]);
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', content: 'Sorry, I had trouble reaching the AI. Make sure the backend is running.' }
      ]);
    }
    setThinking(false);
  };

  const loadGapAnalysis = async () => {
    setLoadingGaps(true);
    setShowGaps(true);
    try {
      const res = await aiApi.analyzeGaps();
      setGapAnalysis(res.data.analysis);
    } catch {
      setGapAnalysis('Could not load gap analysis. Make sure the backend is running.');
    }
    setLoadingGaps(false);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>✨ AI Stylist</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>Outfit recommendations from your own wardrobe</p>
          </div>
          <button className="btn-ghost" onClick={loadGapAnalysis} style={{ fontSize: 13 }}>
            🔍 Wardrobe Gap Analysis
          </button>
        </div>

        {/* Gap analysis panel */}
        {showGaps && (
          <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: 'var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: 'var(--accent-light)' }}>🔍 Wardrobe Gap Analysis</h3>
              <button onClick={() => setShowGaps(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            {loadingGaps ? (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Analyzing your wardrobe...</p>
            ) : (
              <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6, margin: 0 }}
                dangerouslySetInnerHTML={{ __html: formatMessage(gapAnalysis) }} />
            )}
          </div>
        )}

        {/* Chat messages */}
        <div className="card" style={{ flex: 1, padding: 20, marginBottom: 16, overflowY: 'auto', minHeight: 400, maxHeight: 500 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 10
              }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✨</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text)'
                }}>
                  {msg.loading ? (
                    <span style={{ color: 'var(--muted)' }}>✨ Checking your wardrobe...</span>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            placeholder="Ask your stylist anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={thinking}
          />
          <button className="btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || thinking}
            style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
            {thinking ? '...' : 'Ask →'}
          </button>
        </div>
      </div>
    </div>
  );
}
