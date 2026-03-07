import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

// ─── Deterministic hash ───────────────────────────────────────────────────────
function hashStr(str: string, seed: number): number {
  let h = seed + 0x9e3779b9;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return Math.abs(h) % 100;
}

function analyzeUsername(raw: string) {
  const u = raw.toLowerCase().replace(/^@/, '');
  const n = (seed: number, min: number, max: number) =>
    (hashStr(u, seed) % (max - min)) + min;

  const aiContent  = n(1, 18, 82);
  const botProb    = n(2,  4, 52);
  const online     = n(3, 30, 96);
  const degen      = n(4,  8, 91);
  const mainChar   = n(5, 14, 88);
  const ratio      = n(6,  8, 72);
  const toxicity   = n(7,  5, 68);
  const nightPost  = n(8, 12, 87);
  const iq         = n(9, 58, 168);
  const clout      = n(10, 10, 90);

  return { aiContent, humanContent: 100 - aiContent, botProb, online, degen, mainChar, ratio, toxicity, nightPost, iq, clout };
}

type Stats = ReturnType<typeof analyzeUsername>;

function getProfile(s: Stats) {
  if (s.botProb > 45)   return { label: 'Definitely a Bot',         color: '#f59e0b', icon: '>>' };
  if (s.degen > 75)     return { label: 'Certified Degen',           color: '#00e5ff', icon: 'DG' };
  if (s.online > 82)    return { label: 'Touch Grass Urgently',      color: '#f59e0b', icon: '!!' };
  if (s.mainChar > 75)  return { label: 'Main Character Syndrome',   color: '#3b82f6', icon: 'MC' };
  if (s.aiContent > 68) return { label: 'AI Content Farm',           color: '#00e5ff', icon: 'AI' };
  if (s.iq > 135)       return { label: 'Galaxy-Brained Poster',     color: '#00ff41', icon: 'IQ' };
  if (s.ratio > 58)     return { label: 'Professional Ratio Target', color: '#f59e0b', icon: 'R8' };
  if (s.toxicity > 55)  return { label: 'Twitter Villain Era',       color: '#f59e0b', icon: '//' };
  return                       { label: 'Suspiciously Normal',        color: '#00ff41', icon: 'OK' };
}

function generateVerdict(username: string, s: Stats, profile: { label: string }) {
  if (s.botProb > 45)   return `@${username} — our systems flagged you as ${s.botProb}% bot. If you're human, we're sorry. If you're a bot, you're doing great.`;
  if (s.aiContent > 65) return `@${username} posts like a language model trained on LinkedIn posts and crypto shills. ${s.aiContent}% of your content could've been written by ChatGPT on a Monday morning.`;
  if (s.online > 80)    return `@${username} — you are ${s.online}% chronically online. Your friends (if any exist offline) are worried. Touch grass. We're begging you.`;
  if (s.degen > 72)     return `@${username} is a certified degen with a ${s.degen}% score. You've probably explained "number go up" to at least three family members at Thanksgiving.`;
  if (s.mainChar > 70)  return `@${username} radiates ${s.mainChar}% main character energy. Every subtweet you post, you think is being read by 40,000 people. (It isn't.)`;
  if (s.iq > 130)       return `@${username} has an estimated IQ of ${s.iq}. Either you're genuinely smart, or you just use big words and hope no one checks. Either way, respect.`;
  if (s.ratio > 55)     return `@${username} has a ${s.ratio}% ratio vulnerability. You are one bad hot take away from being the main character (not in a good way). Tread carefully.`;
  return `@${username} — you're "${profile.label}". Against all odds, you've managed to exist on this platform without fully losing your mind. We're as surprised as you are.`;
}

// ─── Animated progress bar (live UI) ─────────────────────────────────────────
const Bar = ({ value, color, active }: { value: number; color: string; active: boolean }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setW(value), 120);
    return () => clearTimeout(t);
  }, [active, value]);
  return (
    <div className="xbar-track">
      <div className={`xbar-fill xbar-fill--${color}`} style={{ width: `${w}%`, transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
};

const StatRow = ({ label, value, color, desc, active }: { label: string; value: number; color: string; desc: string; active: boolean }) => (
  <div className="xstat-row">
    <div className="xstat-header">
      <span className="xstat-label">{label}</span>
      <span className={`xstat-value text-${color}`}>{value}%</span>
    </div>
    <Bar value={value} color={color} active={active} />
    <span className="xstat-desc text-dim">{desc}</span>
  </div>
);

// ─── Off-screen Share Card (captured by html2canvas) ─────────────────────────
const ShareCard = ({
  cardRef, username, stats, profile, avatarUrl, verdict,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  username: string;
  stats: Stats;
  profile: ReturnType<typeof getProfile>;
  avatarUrl: string;
  verdict: string;
}) => {
  const statRows = [
    { label: 'Bot Probability',          value: stats.botProb,   color: '#f59e0b' },
    { label: 'Chronically Online',       value: stats.online,    color: '#00e5ff' },
    { label: 'Degen Score',              value: stats.degen,     color: '#00e5ff' },
    { label: 'Main Character Energy',    value: stats.mainChar,  color: '#3b82f6' },
    { label: 'Ratio Vulnerability',      value: stats.ratio,     color: '#f59e0b' },
    { label: 'Toxicity Level',           value: stats.toxicity,  color: '#f59e0b' },
    { label: 'Night Posting %',          value: stats.nightPost, color: '#3b82f6' },
    { label: 'Clout Chasing Index',      value: stats.clout,     color: '#00ff41' },
  ];

  const s: React.CSSProperties = {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '800px',
    background: '#020408',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: '#e2e8f0',
    padding: '0',
    overflow: 'hidden',
    borderRadius: '16px',
  };

  return (
    <div ref={cardRef} style={s}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Green accent top bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00e5ff,#00ff41)', width: '100%' }} />

      <div style={{ padding: '32px 36px', position: 'relative' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {avatarUrl && (
              <img
                src={avatarUrl}
                crossOrigin="anonymous"
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #00ff41', objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ color: '#00ff41', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>@{username}</div>
              <div style={{
                display: 'inline-block', fontSize: '11px', padding: '3px 10px', borderRadius: '4px',
                background: profile.color + '22', border: `1px solid ${profile.color}55`, color: profile.color, letterSpacing: '0.5px',
              }}>
                {profile.label}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>IQ SCORE</div>
            <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, color: stats.iq > 130 ? '#00ff41' : stats.iq < 80 ? '#f59e0b' : '#00e5ff' }}>
              {stats.iq}
            </div>
          </div>
        </div>

        {/* AI vs Human split */}
        <div style={{
          display: 'flex', gap: '0', marginBottom: '20px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
          border: '1px solid rgba(0,229,255,0.1)', overflow: 'hidden',
        }}>
          <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#00e5ff', lineHeight: 1, marginBottom: '4px' }}>{stats.aiContent}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.5px' }}>AI GENERATED</div>
          </div>
          <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#00ff41', lineHeight: 1, marginBottom: '4px' }}>{stats.humanContent}%</div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.5px' }}>ACTUALLY HUMAN</div>
          </div>
        </div>

        {/* Combined bar */}
        <div style={{ display: 'flex', height: '5px', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: `${stats.aiContent}%`, background: '#00e5ff', height: '100%' }} />
          <div style={{ width: `${stats.humanContent}%`, background: '#00ff41', height: '100%' }} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {statRows.map(row => (
            <div key={row.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{row.label}</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: row.color }}>{row.value}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.value}%`, background: row.color, borderRadius: '4px', opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div style={{
          background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: '8px', padding: '14px 16px', marginBottom: '20px',
        }}>
          <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', marginBottom: '6px' }}>// final_verdict.txt</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.65, fontStyle: 'italic' }}>{verdict}</div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>* For entertainment purposes only</div>
          <div style={{ fontSize: '13px', color: '#00ff41', fontWeight: 700 }}>internxbt.cloud/xanalyzer</div>
        </div>
      </div>

      {/* Green accent bottom bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg,#00ff41,#00e5ff,#00ff41)', width: '100%' }} />
    </div>
  );
};

// ─── Scan lines ───────────────────────────────────────────────────────────────
const SCAN_DELAY = 220;
function buildScanLines(username: string) {
  return [
    `$ ./xanalyzer --target @${username}`,
    `> Initializing neural scan engine...`,
    `> Resolving profile fingerprint...`,
    `> Scanning posting patterns [████████░░░] 72%`,
    `> Running linguistic DNA analysis...`,
    `> Calibrating bot signature detector...`,
    `> Estimating IQ from tweet syntax...`,
    `> Measuring chronically-online index...`,
    `> Computing degen risk score...`,
    `> Profiling main-character energy...`,
    `> Calculating ratio vulnerability...`,
    `> Detecting 3am posting habits...`,
    `> Compiling psychological damage report...`,
    ``,
    `// Analysis complete. God help you.`,
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function XAnalyzer() {
  const navigate = useNavigate();
  const [input, setInput]       = useState('');
  const [phase, setPhase]       = useState<'idle' | 'scanning' | 'results'>('idle');
  const [username, setUsername] = useState('');
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [shareState, setShareState] = useState<'idle' | 'capturing' | 'done'>('idle');
  const inputRef   = useRef<HTMLInputElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = () => {
    const u = input.trim().replace(/^@/, '');
    if (!u) return;
    setUsername(u);
    setPhase('scanning');
    setScanLines([]);
    setStats(null);
    setResultsVisible(false);
    setAvatarUrl('');
    setShareState('idle');

    const lines = buildScanLines(u);
    lines.forEach((line, i) => {
      setTimeout(() => {
        setScanLines(prev => [...prev, line]);
        if (i === lines.length - 1) {
          setTimeout(() => {
            const computed = analyzeUsername(u);
            setStats(computed);
            setPhase('results');
            setTimeout(() => setResultsVisible(true), 80);

            // Pre-load avatar as data URL for html2canvas
            fetch(`https://unavatar.io/x/${u}`)
              .then(r => r.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onload = () => setAvatarUrl(reader.result as string);
                reader.readAsDataURL(blob);
              })
              .catch(() => {
                // fallback: ui-avatars (no CORS issues)
                fetch(`https://ui-avatars.com/api/?name=${u}&background=020408&color=00ff41&bold=true&size=128`)
                  .then(r => r.blob())
                  .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => setAvatarUrl(reader.result as string);
                    reader.readAsDataURL(blob);
                  })
                  .catch(() => setAvatarUrl(''));
              });
          }, 500);
        }
      }, i * SCAN_DELAY);
    });
  };

  const handleReset = () => {
    setPhase('idle');
    setInput('');
    setScanLines([]);
    setStats(null);
    setResultsVisible(false);
    setAvatarUrl('');
    setShareState('idle');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleShareImage = async () => {
    if (!shareCardRef.current || shareState === 'capturing') return;
    setShareState('capturing');

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#020408',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Try writing image to clipboard (Chrome / Edge)
        if (navigator.clipboard && (navigator.clipboard as any).write) {
          try {
            await (navigator.clipboard as any).write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setShareState('done');
            setTimeout(() => setShareState('idle'), 3000);
            return;
          } catch {
            // clipboard write failed — fall through to download
          }
        }

        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xanalyzer-${username}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setShareState('done');
        setTimeout(() => setShareState('idle'), 3000);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      setShareState('idle');
    }
  };

  const profile = stats ? getProfile(stats) : null;
  const verdict = stats && profile ? generateVerdict(username, stats, profile) : '';

  // CSS color class helper
  const profileColorClass = profile
    ? (profile.color === '#00ff41' ? 'green' : profile.color === '#00e5ff' ? 'purple' : profile.color === '#3b82f6' ? 'blue' : 'orange')
    : 'green';

  return (
    <div className="xa-page">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* Hidden share card for html2canvas */}
      {phase === 'results' && stats && profile && (
        <ShareCard
          cardRef={shareCardRef}
          username={username}
          stats={stats}
          profile={profile}
          avatarUrl={avatarUrl}
          verdict={verdict}
        />
      )}

      {/* Top bar */}
      <div className="xa-topbar container">
        <button className="xa-back" onClick={() => navigate('/')}>
          <span className="text-dim">←</span> Back to Portfolio
        </button>
        <span className="xa-brand">
          <span className="text-dim">~/</span><span className="text-green">X</span>
          <span className="text-dim">Analyzer</span>
        </span>
        <span className="xa-disclaimer text-dim">// for entertainment only</span>
      </div>

      <div className="xa-content container">

        {/* Header */}
        <div className="xa-hero">
          <span className="section-eyebrow text-green">// deep_scan.exe</span>
          <h1 className="xa-title">
            X Profile <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="xa-subtitle text-dim">
            Paste any X username. We'll reveal how much of your brain is left,
            whether you're actually a bot, and your exact degen risk score.
            <br />
            <span style={{ fontSize: '12px' }}>Powered by quantum tweet analysis &amp; vibes.</span>
          </p>
        </div>

        {/* Search */}
        {phase === 'idle' && (
          <div className="xa-search-wrap">
            <div className="xa-search glass">
              <span className="xa-search-prefix text-green">@</span>
              <input
                ref={inputRef}
                className="xa-input"
                placeholder="username"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                autoFocus
                spellCheck={false}
                autoCapitalize="none"
              />
              <button className="btn btn--glow xa-btn" onClick={handleAnalyze} disabled={!input.trim()}>
                Analyze →
              </button>
            </div>
            <p className="xa-hint text-dim">Try your own username, your enemy's, or just type "elonmusk"</p>
            <div className="xa-teasers">
              {[
                { icon: 'IQ', label: 'Brain Power Score' },
                { icon: 'AI', label: 'AI Content %' },
                { icon: '>>', label: 'Bot Probability' },
                { icon: 'DG', label: 'Degen Score' },
                { icon: '!!', label: 'Chronically Online' },
                { icon: 'MC', label: 'Main Character Energy' },
                { icon: 'R8', label: 'Ratio Vulnerability' },
                { icon: '//', label: 'Toxicity Level' },
                { icon: '*',  label: 'Night Posting %' },
                { icon: '$',  label: 'Clout Chasing Index' },
              ].map(t => (
                <div key={t.label} className="xa-teaser glass">
                  <span className="xa-teaser-icon text-dim">{t.icon}</span>
                  <span className="xa-teaser-label">{t.label}</span>
                  <span className="xa-teaser-val text-dim">???</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning */}
        {phase === 'scanning' && (
          <div className="xa-scanning">
            <div className="terminal glass xa-terminal">
              <div className="terminal__titlebar">
                <div className="terminal__dots">
                  <span className="tdot tdot--r" /><span className="tdot tdot--y" /><span className="tdot tdot--g" />
                </div>
                <span className="terminal__title">xanalyzer.sh — analyzing @{username}</span>
                <span className="terminal__tag">SCANNING</span>
              </div>
              <div className="terminal__body xa-terminal-body">
                {scanLines.map((line, i) => (
                  <div key={i} className={`xa-scan-line ${line.startsWith('$') ? 'text-green' : line.startsWith('//') ? 'text-purple' : line === '' ? '' : 'text-dim'}`}>
                    {line}
                  </div>
                ))}
                <span className="t-cursor">&#9608;</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && stats && profile && (
          <div className={`xa-results ${resultsVisible ? 'xa-results--visible' : ''}`}>

            {/* Profile card */}
            <div className="xa-profile-card glass">
              <div className="xa-profile-left">
                <div className="xa-avatar-wrap">
                  <img
                    src={avatarUrl || `https://unavatar.io/x/${username}`}
                    alt={username}
                    className="xa-avatar"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=020408&color=00ff41&bold=true&size=128`;
                    }}
                  />
                  <span className={`xa-avatar-badge text-${profileColorClass}`}>{profile.icon}</span>
                </div>
                <div>
                  <div className="xa-handle text-green">@{username}</div>
                  <div className={`xa-type-badge xa-type-badge--${profileColorClass}`}>{profile.label}</div>
                  <div className="xa-iq-display">
                    <span className="text-dim" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>IQ Score:</span>
                    <span className={`xa-iq-num ${stats.iq < 80 ? 'text-orange' : stats.iq > 130 ? 'text-green' : 'text-purple'}`}>{stats.iq}</span>
                  </div>
                </div>
              </div>
              <div className="xa-profile-right">
                <div className="xa-ai-split">
                  <div className="xa-ai-block">
                    <div className="xa-ai-pct text-purple">{stats.aiContent}%</div>
                    <div className="xa-ai-label text-dim">AI Generated</div>
                  </div>
                  <div className="xa-ai-divider" />
                  <div className="xa-ai-block">
                    <div className="xa-ai-pct text-green">{stats.humanContent}%</div>
                    <div className="xa-ai-label text-dim">Actually Human</div>
                  </div>
                </div>
                <div className="xa-content-bar-track">
                  <div className="xa-content-bar-fill xa-content-bar-fill--ai"    style={{ width: `${stats.aiContent}%` }} />
                  <div className="xa-content-bar-fill xa-content-bar-fill--human" style={{ width: `${stats.humanContent}%` }} />
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="xa-stats-grid">
              <StatRow label="Bot Probability"          value={stats.botProb}   color="orange" desc="Likelihood you're a bot in a trench coat"              active={resultsVisible} />
              <StatRow label="Chronically Online Index" value={stats.online}    color="purple" desc="% of your brain permanently colonized by Twitter"        active={resultsVisible} />
              <StatRow label="Degen Score"              value={stats.degen}     color="purple" desc="How deep in the rabbit hole you actually are"            active={resultsVisible} />
              <StatRow label="Main Character Energy"    value={stats.mainChar}  color="blue"   desc="Conviction that the timeline revolves around you"        active={resultsVisible} />
              <StatRow label="Ratio Vulnerability"      value={stats.ratio}     color="orange" desc="Probability your next post gets ratioed hard"            active={resultsVisible} />
              <StatRow label="Toxicity Level"           value={stats.toxicity}  color="orange" desc="Measured in community notes per 1000 tweets"             active={resultsVisible} />
              <StatRow label="Night Posting %"          value={stats.nightPost} color="blue"   desc="Posts sent between 2am–5am (based on vibes)"            active={resultsVisible} />
              <StatRow label="Clout Chasing Index"      value={stats.clout}     color="green"  desc="Desperation for likes, follows, and that blue checkmark" active={resultsVisible} />
            </div>

            {/* Verdict */}
            <div className="xa-verdict glass">
              <div className="xa-verdict-eyebrow text-dim">// final_verdict.txt</div>
              <div className="xa-verdict-text">{verdict}</div>
            </div>

            {/* Actions */}
            <div className="xa-actions">
              <button className="btn btn--glow" onClick={handleReset}>
                Analyze Another →
              </button>
              <button
                className={`btn xa-share-btn ${shareState === 'done' ? 'xa-share-btn--done' : 'btn--outline'}`}
                onClick={handleShareImage}
                disabled={shareState === 'capturing'}
              >
                {shareState === 'capturing' && <span className="xa-share-spinner" />}
                {shareState === 'idle'      && 'Share Stats Image'}
                {shareState === 'capturing' && 'Generating image...'}
                {shareState === 'done'      && 'Image Copied! Paste on X →'}
              </button>
            </div>

            <p className="xa-fine-print text-dim">
              * Entirely satirical. No real data accessed. Results generated from username characters only. Do not take your IQ score personally.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
