import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Coin = { name: string; symbol: string; thumb: string };
type FearGreed = { value: string; classification: string };
type Post = { tone: 'DEGEN' | 'DOOMER' | 'ALPHA'; text: string };

const TONE_META = {
  DEGEN:  { label: 'Degen',        color: 'green',  icon: 'DG', desc: 'Pure hopium. Number go up. WAGMI.' },
  DOOMER: { label: 'Doomer',       color: 'orange', icon: '!!', desc: 'This is fine. Ironic suffering.' },
  ALPHA:  { label: 'Alpha Caller', color: 'purple', icon: '//', desc: 'My source says... Fake insider energy.' },
};

const MAX_CHARS = 280;

function CharCount({ text }: { text: string }) {
  const remaining = MAX_CHARS - text.length;
  const color = remaining < 0 ? 'orange' : remaining < 20 ? 'orange' : 'green';
  return (
    <span className={`sg-char-count text-${color}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      {remaining}
    </span>
  );
}

function FearGaugeDot({ classification }: { classification: string }) {
  const c = classification.toLowerCase();
  const color =
    c.includes('extreme fear') ? '#ef4444' :
    c.includes('fear')         ? '#f59e0b' :
    c.includes('extreme greed')? '#00ff41' :
    c.includes('greed')        ? '#00e5ff' : '#64748b';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, marginRight: 6 }} />;
}

export default function ShitpostGenerator() {
  const navigate = useNavigate();

  const [coins, setCoins]           = useState<Coin[]>([]);
  const [fearGreed, setFearGreed]   = useState<FearGreed | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [trendsError, setTrendsError]     = useState('');

  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic]     = useState('');

  const [generating, setGenerating] = useState(false);
  const [posts, setPosts]           = useState<Post[]>([]);
  const [edited, setEdited]         = useState<string[]>([]);
  const [genError, setGenError]     = useState('');

  const [copied, setCopied]         = useState<number | null>(null);

  // ── Fetch trending data ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingTrends(true);
      setTrendsError('');
      try {
        const [cgRes, fgRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/search/trending'),
          fetch('https://api.alternative.me/fng/'),
        ]);

        if (cgRes.ok) {
          const cg = await cgRes.json();
          const top: Coin[] = (cg.coins || []).slice(0, 7).map((c: any) => ({
            name:   c.item.name,
            symbol: c.item.symbol,
            thumb:  c.item.thumb,
          }));
          setCoins(top);
          setSelectedCoins(new Set(top.map(c => c.symbol)));
        }

        if (fgRes.ok) {
          const fg = await fgRes.json();
          setFearGreed({
            value:          fg.data[0].value,
            classification: fg.data[0].value_classification,
          });
        }
      } catch {
        setTrendsError('Could not fetch trends. Check your connection.');
      } finally {
        setLoadingTrends(false);
      }
    }
    load();
  }, []);

  const toggleCoin = (symbol: string) =>
    setSelectedCoins(prev => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });

  // ── Generate posts ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const active = coins.filter(c => selectedCoins.has(c.symbol));
    if (!active.length && !customTopic.trim()) return;
    setGenerating(true);
    setGenError('');
    setPosts([]);
    setEdited([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: active, fearGreed, customTopic: customTopic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPosts(data.posts);
      setEdited(data.posts.map((p: Post) => p.text));
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const postToX = (text: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="xa-page">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* Top bar */}
      <div className="xa-topbar container">
        <button className="xa-back" onClick={() => navigate('/')}>
          <span className="text-dim">←</span> Back to Portfolio
        </button>
        <span className="xa-brand">
          <span className="text-dim">~/</span>
          <span className="text-green">CT</span>
          <span className="text-dim">Drafter</span>
        </span>
        <span className="xa-disclaimer text-dim">// powered by Claude AI</span>
      </div>

      <div className="xa-content container">

        {/* Header */}
        <div className="xa-hero">
          <span className="section-eyebrow text-green">// shitpost.exe</span>
          <h1 className="xa-title">
            CT Shitpost <span className="text-gradient">Generator</span>
          </h1>
          <p className="xa-subtitle text-dim">
            Pulls live crypto trends, feeds them to Claude, generates 3 drafts —
            Degen, Doomer, and Alpha Caller. Pick one, edit if needed, post to X.
          </p>
        </div>

        {/* Trends panel */}
        <div className="sg-panel glass">
          <div className="sg-panel__header">
            <span className="section-eyebrow text-green" style={{ marginBottom: 0 }}>// trending.now()</span>
            {fearGreed && (
              <span className="sg-fear" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                <FearGaugeDot classification={fearGreed.classification} />
                {fearGreed.classification} &nbsp;·&nbsp; {fearGreed.value}/100
              </span>
            )}
          </div>

          {loadingTrends && (
            <div className="sg-loading text-dim">
              <span className="xa-share-spinner" style={{ borderTopColor: 'var(--green)' }} />
              Fetching CoinGecko trends...
            </div>
          )}
          {trendsError && <p className="text-orange" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{trendsError}</p>}

          {!loadingTrends && coins.length > 0 && (
            <>
              <p className="text-dim" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '12px' }}>
                Toggle coins to include in the post:
              </p>
              <div className="sg-coins">
                {coins.map(c => (
                  <button
                    key={c.symbol}
                    className={`sg-coin ${selectedCoins.has(c.symbol) ? 'sg-coin--active' : ''}`}
                    onClick={() => toggleCoin(c.symbol)}
                  >
                    {c.thumb && <img src={c.thumb} alt={c.name} className="sg-coin__thumb" />}
                    <span className="sg-coin__name">{c.name}</span>
                    <span className="sg-coin__sym text-dim">{c.symbol.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="sg-custom">
            <label className="form-label text-dim">Add your own context / topic (optional)</label>
            <input
              className="form-input sg-custom__input"
              placeholder="e.g. ETH ETF approved, BTC all-time high, Solana down again..."
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <button
            className="btn btn--glow sg-generate-btn"
            onClick={handleGenerate}
            disabled={generating || (!selectedCoins.size && !customTopic.trim())}
          >
            {generating ? (
              <><span className="xa-share-spinner" /> Asking Claude...</>
            ) : posts.length ? (
              'Regenerate All →'
            ) : (
              'Generate Shitposts →'
            )}
          </button>

          {genError && (
            <p className="text-orange" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '12px' }}>
              Error: {genError}
            </p>
          )}
        </div>

        {/* Generating animation */}
        {generating && (
          <div className="terminal glass xa-terminal" style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div className="terminal__titlebar">
              <div className="terminal__dots">
                <span className="tdot tdot--r" /><span className="tdot tdot--y" /><span className="tdot tdot--g" />
              </div>
              <span className="terminal__title">claude.sh — generating drafts</span>
              <span className="terminal__tag">THINKING</span>
            </div>
            <div className="terminal__body xa-terminal-body" style={{ minHeight: '120px' }}>
              <div className="text-green">$ ./generate --trends --model haiku</div>
              <div className="text-dim">&gt; Reading trending coins...</div>
              <div className="text-dim">&gt; Checking market sentiment...</div>
              <div className="text-dim">&gt; Channeling inner degen...</div>
              <div className="text-dim">&gt; Writing three drafts<span className="t-cursor">&#9608;</span></div>
            </div>
          </div>
        )}

        {/* Draft cards */}
        {posts.length > 0 && !generating && (
          <div className="sg-drafts">
            <div className="section-eyebrow text-green" style={{ textAlign: 'center', marginBottom: '24px' }}>
              // drafts.ready() — pick one, edit if needed, then post
            </div>
            {posts.map((post, i) => {
              const meta = TONE_META[post.tone];
              const text = edited[i] ?? post.text;
              const overLimit = text.length > MAX_CHARS;
              return (
                <div key={i} className={`sg-draft glass sg-draft--${meta.color}`}>
                  <div className="sg-draft__header">
                    <div className="sg-draft__tone-wrap">
                      <span className={`sg-draft__icon text-${meta.color}`}>{meta.icon}</span>
                      <div>
                        <div className={`sg-draft__tone text-${meta.color}`}>{meta.label} Mode</div>
                        <div className="sg-draft__desc text-dim">{meta.desc}</div>
                      </div>
                    </div>
                    <CharCount text={text} />
                  </div>

                  <textarea
                    className={`sg-draft__textarea ${overLimit ? 'sg-draft__textarea--over' : ''}`}
                    value={text}
                    onChange={e => {
                      const next = [...edited];
                      next[i] = e.target.value;
                      setEdited(next);
                    }}
                    rows={4}
                    spellCheck
                  />

                  {overLimit && (
                    <p className="text-orange" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '8px' }}>
                      Over 280 characters — trim before posting
                    </p>
                  )}

                  <div className="sg-draft__actions">
                    <button
                      className="btn btn--glow sg-post-btn"
                      onClick={() => postToX(text)}
                      disabled={overLimit}
                    >
                      Post to X →
                    </button>
                    <button
                      className={`btn btn--outline sg-copy-btn ${copied === i ? 'sg-copy-btn--done' : ''}`}
                      onClick={() => copyText(text, i)}
                    >
                      {copied === i ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button
                      className="sg-reset-btn text-dim"
                      onClick={() => {
                        const next = [...edited];
                        next[i] = post.text;
                        setEdited(next);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              );
            })}

            <p className="xa-fine-print text-dim" style={{ textAlign: 'center', marginTop: '8px' }}>
              "Post to X →" opens your X composer with this draft pre-filled. Review it, then hit Tweet.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
