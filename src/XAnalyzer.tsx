import { useEffect, useRef, useState } from 'react';

// ─── Deterministic hash from username ────────────────────────────────────────
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

  const aiContent   = n(1, 18, 82);
  const botProb     = n(2,  4, 52);
  const online      = n(3, 30, 96);
  const degen       = n(4,  8, 91);
  const mainChar    = n(5, 14, 88);
  const ratio       = n(6,  8, 72);
  const toxicity    = n(7,  5, 68);
  const nightPost   = n(8, 12, 87);
  const iq          = n(9, 58, 168);
  const clout       = n(10, 10, 90);

  return { aiContent, humanContent: 100 - aiContent, botProb, online, degen, mainChar, ratio, toxicity, nightPost, iq, clout };
}

type Stats = ReturnType<typeof analyzeUsername>;

function getProfile(s: Stats) {
  if (s.botProb > 45)   return { label: 'Definitely a Bot',         color: 'orange', icon: '>>' };
  if (s.degen > 75)     return { label: 'Certified Degen',           color: 'purple', icon: 'DG' };
  if (s.online > 82)    return { label: 'Touch Grass Urgently',      color: 'orange', icon: '!!' };
  if (s.mainChar > 75)  return { label: 'Main Character Syndrome',   color: 'blue',   icon: 'MC' };
  if (s.aiContent > 68) return { label: 'AI Content Farm',           color: 'purple', icon: 'AI' };
  if (s.iq > 135)       return { label: 'Galaxy-Brained Poster',     color: 'green',  icon: 'IQ' };
  if (s.ratio > 58)     return { label: 'Professional Ratio Target', color: 'orange', icon: 'R8' };
  if (s.toxicity > 55)  return { label: 'Twitter Villain Era',       color: 'orange', icon: '//' };
  return                       { label: 'Suspiciously Normal',        color: 'green',  icon: 'OK' };
}

// ─── Animated progress bar ────────────────────────────────────────────────────
const Bar = ({ value, color, active }: { value: number; color: string; active: boolean }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setW(value), 120);
    return () => clearTimeout(t);
  }, [active, value]);

  return (
    <div className="xbar-track">
      <div
        className={`xbar-fill xbar-fill--${color}`}
        style={{ width: `${w}%`, transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </div>
  );
};

// ─── Stat row ─────────────────────────────────────────────────────────────────
const StatRow = ({
  label, value, suffix = '%', color, desc, active,
}: {
  label: string; value: number; suffix?: string; color: string; desc: string; active: boolean;
}) => (
  <div className="xstat-row">
    <div className="xstat-header">
      <span className="xstat-label">{label}</span>
      <span className={`xstat-value text-${color}`}>{value}{suffix}</span>
    </div>
    <Bar value={value > 100 ? (value / 200) * 100 : value} color={color} active={active} />
    <span className="xstat-desc text-dim">{desc}</span>
  </div>
);

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
export default function XAnalyzer({ onBack }: { onBack: () => void }) {
  const [input, setInput]         = useState('');
  const [phase, setPhase]         = useState<'idle' | 'scanning' | 'results'>('idle');
  const [username, setUsername]   = useState('');
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    const u = input.trim().replace(/^@/, '');
    if (!u) return;
    setUsername(u);
    setPhase('scanning');
    setScanLines([]);
    setStats(null);
    setResultsVisible(false);

    const lines = buildScanLines(u);
    lines.forEach((line, i) => {
      setTimeout(() => {
        setScanLines(prev => [...prev, line]);
        if (i === lines.length - 1) {
          setTimeout(() => {
            setStats(analyzeUsername(u));
            setPhase('results');
            setTimeout(() => setResultsVisible(true), 80);
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const profile = stats ? getProfile(stats) : null;

  return (
    <div className="xa-page">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* Back nav */}
      <div className="xa-topbar container">
        <button className="xa-back" onClick={onBack}>
          <span className="text-dim">←</span> Back to Portfolio
        </button>
        <span className="xa-brand">
          <span className="text-dim">~/</span><span className="text-green">X</span>
          <span className="text-dim">Analyzer</span>
        </span>
        <span className="xa-disclaimer text-dim">// for entertainment only</span>
      </div>

      <div className="xa-content container">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="xa-hero">
          <span className="section-eyebrow text-green">// deep_scan.exe</span>
          <h1 className="xa-title">
            X Profile <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="xa-subtitle text-dim">
            Paste any X username. We'll reveal how much of your brain is left,
            whether you're actually a bot, and your exact degen risk score.
            <br />
            <span className="text-dim" style={{ fontSize: '12px' }}>Powered by quantum tweet analysis &amp; vibes.</span>
          </p>
        </div>

        {/* ── Search box ─────────────────────────────────────────────────── */}
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
              <button
                className="btn btn--glow xa-btn"
                onClick={handleAnalyze}
                disabled={!input.trim()}
              >
                Analyze →
              </button>
            </div>
            <p className="xa-hint text-dim">
              Try your own username, your enemy's, or just type "elonmusk"
            </p>

            {/* Fun stat teasers */}
            <div className="xa-teasers">
              {[
                { icon: 'IQ', label: 'Brain Power Score' },
                { icon: 'AI', label: 'AI Content %' },
                { icon: '>>', label: 'Bot Probability' },
                { icon: 'DG', label: 'Degen Score' },
                { icon: '!!', label: 'Chronically Online Index' },
                { icon: 'MC', label: 'Main Character Energy' },
                { icon: 'R8', label: 'Ratio Vulnerability' },
                { icon: '//', label: 'Twitter Toxicity Level' },
                { icon: '*', label: 'Night Posting %' },
                { icon: '$', label: 'Clout Chasing Index' },
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

        {/* ── Scanning terminal ───────────────────────────────────────────── */}
        {phase === 'scanning' && (
          <div className="xa-scanning">
            <div className="terminal glass xa-terminal">
              <div className="terminal__titlebar">
                <div className="terminal__dots">
                  <span className="tdot tdot--r" />
                  <span className="tdot tdot--y" />
                  <span className="tdot tdot--g" />
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

        {/* ── Results ────────────────────────────────────────────────────── */}
        {phase === 'results' && stats && profile && (
          <div className={`xa-results ${resultsVisible ? 'xa-results--visible' : ''}`}>

            {/* Profile header */}
            <div className="xa-profile-card glass">
              <div className="xa-profile-left">
                <div className="xa-avatar-wrap">
                  <img
                    src={`https://unavatar.io/x/${username}`}
                    alt={username}
                    className="xa-avatar"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=020408&color=00ff41&bold=true&size=128`;
                    }}
                  />
                  <span className={`xa-avatar-badge text-${profile.color}`}>{profile.icon}</span>
                </div>
                <div>
                  <div className="xa-handle text-green">@{username}</div>
                  <div className={`xa-type-badge xa-type-badge--${profile.color}`}>
                    {profile.label}
                  </div>
                  <div className="xa-iq-display">
                    <span className="text-dim" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>IQ Score:</span>
                    <span className={`xa-iq-num ${stats.iq < 80 ? 'text-orange' : stats.iq > 130 ? 'text-green' : 'text-purple'}`}>
                      {stats.iq}
                    </span>
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
                  <div className="xa-content-bar-fill xa-content-bar-fill--ai" style={{ width: `${stats.aiContent}%` }} />
                  <div className="xa-content-bar-fill xa-content-bar-fill--human" style={{ width: `${stats.humanContent}%` }} />
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="xa-stats-grid">
              <StatRow label="Bot Probability"         value={stats.botProb}   color="orange" desc="Likelihood you're a bot in a trench coat" active={resultsVisible} />
              <StatRow label="Chronically Online Index" value={stats.online}   color="purple" desc="% of your brain permanently colonized by Twitter" active={resultsVisible} />
              <StatRow label="Degen Score"              value={stats.degen}    color="purple" desc="How deep in the rabbit hole you actually are" active={resultsVisible} />
              <StatRow label="Main Character Energy"    value={stats.mainChar} color="blue"   desc="Conviction that the timeline revolves around you" active={resultsVisible} />
              <StatRow label="Ratio Vulnerability"      value={stats.ratio}    color="orange" desc="Probability your next post gets ratioed hard" active={resultsVisible} />
              <StatRow label="Toxicity Level"           value={stats.toxicity} color="orange" desc="Measured in community notes per 1000 tweets" active={resultsVisible} />
              <StatRow label="Night Posting %"          value={stats.nightPost} color="blue"  desc="Posts sent between 2am–5am (based on vibes)" active={resultsVisible} />
              <StatRow label="Clout Chasing Index"      value={stats.clout}    color="green"  desc="Desperation for likes, follows, and that blue checkmark" active={resultsVisible} />
            </div>

            {/* Fun verdict */}
            <div className="xa-verdict glass">
              <div className="xa-verdict-eyebrow text-dim">// final_verdict.txt</div>
              <div className="xa-verdict-text">
                {generateVerdict(username, stats, profile)}
              </div>
            </div>

            {/* Actions */}
            <div className="xa-actions">
              <button className="btn btn--glow" onClick={handleReset}>
                Analyze Another →
              </button>
              <button
                className="btn btn--outline"
                onClick={() => {
                  const text = `I just ran my X profile through the analyzer. Results: IQ ${stats.iq} | ${stats.aiContent}% AI Content | ${stats.botProb}% Bot Probability | "${profile.label}" — check yours at internxbt.vercel.app`;
                  navigator.clipboard?.writeText(text);
                  alert('Results copied! Share it on X.');
                }}
              >
                Copy &amp; Share Results
              </button>
            </div>

            <p className="xa-fine-print text-dim">
              * This analysis is entirely satirical and for entertainment purposes only. No real data was accessed.
              Results are algorithmically generated from your username characters. Please do not take your IQ score personally.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

function generateVerdict(username: string, s: Stats, profile: { label: string }) {
  const lines: string[] = [];

  if (s.botProb > 45) {
    lines.push(`@${username} — our systems flagged you as ${s.botProb}% bot. If you're human, we're sorry. If you're a bot, you're doing great.`);
  } else if (s.aiContent > 65) {
    lines.push(`@${username} posts like a language model that was trained on LinkedIn posts and crypto shills. ${s.aiContent}% of your content could have been written by ChatGPT on a Monday morning.`);
  } else if (s.online > 80) {
    lines.push(`@${username} — you are ${s.online}% chronically online. Your friends (if any exist offline) are worried. Touch grass. We're begging you.`);
  } else if (s.degen > 72) {
    lines.push(`@${username} is a certified degen with a ${s.degen}% degen score. You've probably explained "number go up" to at least three family members at Thanksgiving.`);
  } else if (s.mainChar > 70) {
    lines.push(`@${username} radiates ${s.mainChar}% main character energy. Every subtweet you post, you think is being read by 40,000 people. (It isn't.)`);
  } else if (s.iq > 130) {
    lines.push(`@${username} has an estimated IQ of ${s.iq}. Either you're genuinely smart, or you just use big words and hope no one checks. Either way, respect.`);
  } else if (s.ratio > 55) {
    lines.push(`@${username} has a ${s.ratio}% ratio vulnerability. You are one bad hot take away from being the main character (not in a good way). Tread carefully.`);
  } else {
    lines.push(`@${username} — you're "${profile.label}". Against all odds, you've managed to exist on this platform without fully losing your mind. We're as surprised as you are.`);
  }

  return lines[0];
}
