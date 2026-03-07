import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import XAnalyzer from './XAnalyzer';

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplayed(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplayed(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

// ─── Counter Hook ─────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= target) { clearInterval(timer); return target; }
        return c + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

// ─── InView Hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <a href="#home" className="navbar__brand">
        <span className="brand-tilde">~/</span>
        <span className="brand-name">David</span>
      </a>
      <div className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
        {['home', 'stack', 'services', 'logs', 'contact'].map(l => (
          <a key={l} href={`#${l}`} className="navbar__link" onClick={() => setMenuOpen(false)}>
            {l}
          </a>
        ))}
        <button
          className="navbar__link navbar__link--analyzer"
          onClick={() => { setMenuOpen(false); navigate('/xanalyzer'); }}
        >
          X Analyzer
        </button>
      </div>
      <div className="navbar__right">
        <div className="navbar__status">
          <span className="status-dot" />
          <span>open_to_work</span>
        </div>
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const role = useTypewriter([
    'Discord Infrastructure',
    'Community Architect',
    'Web3 Operator',
    'Growth Systems Builder',
    'Project Advisor',
    'Crypto Twitter Manager',
    'Web3 Intern',
  ]);

  const { ref: statsRef, inView: statsIn } = useInView(0.1);
  const c1 = useCounter(25, 2000, statsIn);
  const c2 = useCounter(500, 2000, statsIn);
  const c3 = useCounter(40, 2000, statsIn);
  const c4 = useCounter(6, 2000, statsIn);

  return (
    <section id="home" className="hero">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      <div className="hero__inner">
        <div className="hero__left">
          <div className="hero__profile">
            <img
              src="https://unavatar.io/x/Internxbt"
              alt="David"
              className="hero__avatar"
            />
            <div className="hero__avatar-meta">
              <span className="hero__avatar-name">David</span>
              <span className="hero__avatar-handle">@Internxbt</span>
            </div>
          </div>
          <div className="hero__eyebrow">
            <span className="eyebrow-dot" />
            Web3 Operator
          </div>
          <h1 className="hero__heading">
            <span className="glitch" data-text="David">David</span>
            <span className="hero__slash"> / </span>
            <span className="hero__intern">intern</span>
          </h1>
          <p className="hero__roles">
            <span className="role-tag">Web3 Operator</span>
            <span className="role-sep">•</span>
            <span className="role-tag">Community Architect</span>
            <span className="role-sep">•</span>
            <span className="role-tag">Discord Infrastructure</span>
            <span className="role-sep">•</span>
            <span className="role-tag">Crypto Ambassador</span>
            <span className="role-sep">•</span>
            <span className="role-tag">X/Twitter Manager</span>
          </p>
          <p className="hero__desc">
            I build and scale Web3 communities through infrastructure,
            growth systems, and community architecture.
          </p>
          <div className="hero__actions">
            <a href="#contact" className="btn btn--glow">Contact</a>
          </div>
          <div className="hero__socials">
            <a href="#" className="soc-btn" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://x.com/Internxbt" className="soc-btn" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            <a href="https://t.me/iamtwcp" className="soc-btn" target="_blank" rel="noopener noreferrer">Telegram</a>
          </div>
        </div>

        <div className="hero__right">
          <div className="terminal glass">
            <div className="terminal__titlebar">
              <div className="terminal__dots">
                <span className="tdot tdot--r" />
                <span className="tdot tdot--y" />
                <span className="tdot tdot--g" />
              </div>
              <span className="terminal__title">operator.sh</span>
              <span className="terminal__tag">LIVE</span>
            </div>
            <div className="terminal__body">
              <div className="t-line">
                <span className="t-prompt">$</span> whoami
              </div>
              <div className="t-output t-green">David — Web3 Operator</div>
              <div className="t-line">
                <span className="t-prompt">$</span> cat specialization.txt
              </div>
              <div className="t-output t-purple">
                {role}<span className="t-cursor">&#9608;</span>
              </div>
              <div className="t-line">
                <span className="t-prompt">$</span> ./status --check
              </div>
              <div className="t-output">
                <span className="t-green">✓</span> Discord Infrastructure<br />
                <span className="t-green">✓</span> Community Architecture<br />
                <span className="t-green">✓</span> Web3 Growth Systems<br />
                <span className="t-green">✓</span> Twitter/X Management<br />
                <span className="t-green">✓</span> Crypto Project Intern<br />
                <span className="t-dim"># Available for new projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={statsRef} className="hero__stats">
        <div className="stat-item">
          <div className="stat-num">{c1}+</div>
          <div className="stat-label">Communities Built</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">{c2}K+</div>
          <div className="stat-label">Members Managed</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">{c3}+</div>
          <div className="stat-label">Discord Systems Deployed</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">{c4}+</div>
          <div className="stat-label">Years in Web3</div>
        </div>
      </div>
    </section>
  );
};

// ─── Tech Stack ───────────────────────────────────────────────────────────────
const stackData = [
  {
    category: '// Infrastructure',
    color: 'green' as const,
    items: [
      { name: 'Discord Bots', icon: '>_' },
      { name: 'Webhooks', icon: '{}' },
      { name: 'Automation Systems', icon: '//' },
      { name: 'Role Systems', icon: '[]' },
      { name: 'Anti-Raid Protection', icon: '><' },
    ],
  },
  {
    category: '// Web3 Tools',
    color: 'purple' as const,
    items: [
      { name: 'Galxe', icon: '.*' },
      { name: 'Zealy', icon: '>>' },
      { name: 'Guild.xyz', icon: '/g' },
      { name: 'Snapshot', icon: '[]' },
      { name: 'Collab.land', icon: '&&' },
    ],
  },
  {
    category: '// Tech',
    color: 'blue' as const,
    items: [
      { name: 'Node.js', icon: '{}' },
      { name: 'REST APIs', icon: '~=' },
      { name: 'Automation Scripts', icon: '<>' },
      { name: 'AI Workflows', icon: 'AI' },
      { name: 'Data Analytics', icon: '/\\' },
    ],
  },
];

const TechStack = () => (
  <section id="stack" className="section tech-stack">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow text-green">// tech.stack</span>
        <h2 className="section-title">My <span className="text-gradient">Arsenal</span></h2>
        <p className="section-sub">The tools and systems I deploy to build Web3 communities</p>
      </div>
      <div className="stack-grid">
        {stackData.map(cat => (
          <div key={cat.category} className={`stack-panel glass stack-panel--${cat.color}`}>
            <div className="stack-panel__header">
              <span className={`stack-label text-${cat.color}`}>{cat.category}</span>
            </div>
            <div className="stack-items">
              {cat.items.map(item => (
                <div key={item.name} className="stack-item">
                  <span className="stack-item__icon">{item.icon}</span>
                  <span className="stack-item__name">{item.name}</span>
                  <span className={`stack-item__dot text-${cat.color}`}>●</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Services ─────────────────────────────────────────────────────────────────
const servicesData = [
  {
    id: '01',
    title: 'Discord Infrastructure',
    icon: '>_',
    color: 'green' as const,
    desc: 'Full server architecture built for scale. Role systems, automation, bot integration, anti-raid protection, and community funnels designed for Web3 projects.',
    features: ['Server architecture', 'Role systems', 'Bot integration', 'Anti-raid protection', 'Community funnels'],
  },
  {
    id: '02',
    title: 'Community Leadership',
    icon: '[]',
    color: 'purple' as const,
    desc: 'End-to-end community management with moderation teams, engagement strategy, growth campaigns, and culture building that converts holders into loyal members.',
    features: ['Moderation teams', 'Engagement strategy', 'Growth campaigns', 'Community culture', 'Ambassador programs'],
  },
  {
    id: '03',
    title: 'Project Advisory',
    icon: '//',
    color: 'blue' as const,
    desc: 'Strategic advisory for Web3 projects covering go-to-market, ambassador programs, incentive design, and community token mechanics.',
    features: ['Go-to-market strategy', 'Ambassador programs', 'Incentive design', 'Token mechanics', 'Launch strategy'],
  },
  {
    id: '04',
    title: 'Content Systems',
    icon: '<<',
    color: 'orange' as const,
    desc: 'Alpha threads, educational content, and growth campaigns that position your project in front of the right Web3 audience. I also work directly as an intern inside crypto projects — running and managing their X/Twitter accounts day-to-day.',
    features: ['Alpha threads', 'Educational content', 'Growth campaigns', 'Twitter/X account management', 'Community newsletters'],
  },
  {
    id: '05',
    title: 'Crypto Project Ambassador',
    icon: '{}',
    color: 'green' as const,
    desc: 'Representing your project across Web3 communities, X/Twitter, and Telegram. I become the face of your brand — driving awareness, recruiting contributors, and building trust with your target audience.',
    features: ['Community representation', 'X/Twitter amplification', 'KOL outreach', 'Telegram promotion', 'Brand advocacy', 'Contributor recruitment'],
  },
];

const Services = () => (
  <section id="services" className="section services">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow text-green">// services.available</span>
        <h2 className="section-title">What I <span className="text-gradient">Build</span></h2>
        <p className="section-sub">Every engagement is treated as a system, not a task</p>
      </div>
      <div className="services-grid">
        {servicesData.map(s => (
          <div key={s.id} className={`service-card glass service-card--${s.color}`}>
            <div className="service-card__top">
              <span className="service-id text-dim">{s.id}</span>
              <span className="service-icon">{s.icon}</span>
            </div>
            <h3 className="service-card__title">{s.title}</h3>
            <p className="service-card__desc">{s.desc}</p>
            <ul className="service-features">
              {s.features.map(f => (
                <li key={f} className="service-feature">
                  <span className={`feature-dot text-${s.color}`}>▸</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);


// ─── Discord Showcase ─────────────────────────────────────────────────────────
const discordChannels = [
  { cat: 'INFORMATION', channels: ['# announcements', '# server-rules', '# get-roles', '# roadmap', '# whitelist-info'] },
  { cat: 'COMMUNITY', channels: ['# introductions', '# general', '# gm-gm', '# events', '# alpha-chat'] },
  { cat: 'HOLDERS (token-gated)', channels: ['# og-lounge', '# whale-room', '# alpha-calls', '# treasury-updates'] },
  { cat: 'LAUNCH ZONE', channels: ['# mint-alerts', '# analytics', '# collab-drops', '# airdrop-tracker'] },
  { cat: 'AMBASSADORS', channels: ['# ambassador-lounge', '# tasks', '# leaderboard', '# applications'] },
  { cat: 'SUPPORT', channels: ['# help-desk', '# create-ticket', '# verify-wallet'] },
];

const discordRoles = [
  { name: 'Core Team', color: '#f59e0b', icon: '●' },
  { name: 'Whale (500+ tokens)', color: '#00ff41', icon: '●' },
  { name: 'OG Holder', color: '#8b5cf6', icon: '●' },
  { name: 'Ambassador', color: '#3b82f6', icon: '●' },
  { name: 'Whitelist', color: '#f97316', icon: '●' },
  { name: 'Contributor', color: '#10b981', icon: '●' },
  { name: 'Member', color: '#6b7280', icon: '●' },
];

const DiscordShowcase = () => (
  <section className="section discord-showcase">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow text-green">// discord.infrastructure</span>
        <h2 className="section-title">Discord Systems <span className="text-gradient">I Build</span></h2>
        <p className="section-sub">Server architecture designed for Web3 communities at scale</p>
      </div>

      <div className="discord-demo glass">
        <div className="discord-demo__titlebar">
          <div className="terminal__dots">
            <span className="tdot tdot--r" />
            <span className="tdot tdot--y" />
            <span className="tdot tdot--g" />
          </div>
          <span className="discord-demo__title">
            <span className="text-purple">◈</span> ProjectName — Discord Server Architecture
          </span>
        </div>
        <div className="discord-demo__body">
          <div className="discord-sidebar">
            {discordChannels.map(cat => (
              <div key={cat.cat} className="discord-cat">
                <div className="discord-cat__name text-dim">{cat.cat}</div>
                {cat.channels.map(ch => (
                  <div key={ch} className="discord-channel">
                    <span className="discord-channel__name">{ch}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="discord-main">
            <div className="discord-roles-title text-dim">// ROLE HIERARCHY</div>
            <div className="discord-roles">
              {discordRoles.map(r => (
                <div key={r.name} className="discord-role" style={{ borderColor: r.color }}>
                  <span className="discord-role__icon">{r.icon}</span>
                  <span className="discord-role__name" style={{ color: r.color }}>{r.name}</span>
                </div>
              ))}
            </div>
            <div className="discord-systems">
              <div className="discord-systems__title text-dim">// AUTOMATION SYSTEMS</div>
              {[
                { icon: '{}', name: 'Wallet Verification', desc: 'Collab.land / Guild.xyz → auto role on connect' },
                { icon: '><', name: 'Anti-Raid System', desc: 'Rate limit + account age + CAPTCHA gate' },
                { icon: '//', name: 'Whale Detector', desc: 'On-chain balance check → instant role upgrade' },
                { icon: '>>', name: 'Mint & Launch Alerts', desc: 'Live bot push for mint, listing, price events' },
                { icon: '/\\', name: 'Community Analytics', desc: 'Activity, retention & growth dashboards' },
                { icon: 'XP', name: 'Quest Engine', desc: 'Zealy / Galxe tasks → XP → reward pipeline' },
              ].map(s => (
                <div key={s.name} className="discord-system-item">
                  <span className="system-icon">{s.icon}</span>
                  <div>
                    <div className="system-name text-green">{s.name}</div>
                    <div className="system-desc text-dim">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="discord-features-grid">
        {[
          { icon: '{}', title: 'Token-Gated Access', desc: 'Holders-only channels that unlock automatically based on on-chain balance. Works with any EVM token or NFT collection.' },
          { icon: '>>', title: 'Launch Infrastructure', desc: 'Full mint-day setup: countdown bots, mint alerts, live supply trackers, and holder verification flows.' },
          { icon: '[]', title: 'Whitelist Management', desc: 'Automated WL collection, verification, and role distribution. Integrates with premint, allowlist tools, and custom forms.' },
          { icon: 'XP', title: 'Quest & XP Systems', desc: 'Zealy and Galxe integration with custom XP logic, leaderboards, and on-chain reward pipelines.' },
          { icon: '//', title: 'Ambassador Programs', desc: 'Full ambassador tracking system: task boards, contribution scoring, leaderboards, and tiered reward flows.' },
          { icon: '><', title: 'Anti-Raid & Security', desc: 'Multi-layer protection: CAPTCHA, account age filters, phone verification, slowmode, and auto-ban on suspicious patterns.' },
          { icon: '~=', title: 'Whale & Holder Rooms', desc: 'Exclusive channels gated by token thresholds. Auto-upgrades roles as holders accumulate more tokens.' },
          { icon: 'DAO', title: 'Governance Integration', desc: 'Snapshot voting alerts, proposal channels, delegate tracking, and DAO announcement pipelines inside Discord.' },
          { icon: '/\\', title: 'Analytics & Reporting', desc: 'Live dashboards tracking member growth, retention rate, message activity, and engagement per channel.' },
          { icon: '&&', title: 'Collab & Partnership Drops', desc: 'Cross-server partnership channels, collab role drops, and announcement pipelines for co-marketing campaigns.' },
          { icon: '$', title: 'Airdrop Coordination', desc: 'Airdrop eligibility tracking, wallet collection flows, and automated role-based distribution notifications.' },
          { icon: '!', title: 'Price & On-Chain Alerts', desc: 'Floor price bots, whale wallet trackers, and smart contract event alerts delivered straight into your server.' },
        ].map(f => (
          <div key={f.title} className="discord-feature glass">
            <div className="discord-feature__icon">{f.icon}</div>
            <h4 className="discord-feature__title">{f.title}</h4>
            <p className="discord-feature__desc text-dim">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);



// ─── Operator Logs ────────────────────────────────────────────────────────────
const logs = [
  {
    slug: '01',
    date: 'FEB 2026',
    title: 'The Definitive Guide to Building a Web3 Discord from Scratch',
    excerpt: "Most founders treat Discord as an afterthought. Here's the exact architecture I use to build servers that retain members, prevent raids, and convert holders into community members.",
    readTime: '8 min read',
    tags: ['Discord', 'Infrastructure', 'Guide'],
    color: 'green' as const,
  },
  {
    slug: '02',
    date: 'JAN 2026',
    title: 'Community Growth Loops: How to Build Systems That Compound',
    excerpt: "Random campaigns don't build communities. Growth loops do. Here's how to design self-sustaining growth mechanics using ambassadors, quests, and content flywheels.",
    readTime: '6 min read',
    tags: ['Growth', 'Strategy', 'Systems'],
    color: 'purple' as const,
  },
  {
    slug: '03',
    date: 'DEC 2025',
    title: "Ambassador Program Frameworks: Make Founders Think You're a Pro",
    excerpt: "Most ambassador programs fail because they're reward-driven, not role-driven. Here's the framework that generates genuine contributors, not retweet bots.",
    readTime: '7 min read',
    tags: ['Ambassador', 'Framework', 'Community'],
    color: 'blue' as const,
  },
];

const OperatorLogs = () => (
  <section id="logs" className="section operator-logs">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow text-green">// operator.logs</span>
        <h2 className="section-title">Operator <span className="text-gradient">Logs</span></h2>
        <p className="section-sub">Deep dives on Web3 community systems. Make founders think.</p>
      </div>
      <div className="logs-grid">
        {logs.map(l => (
          <article key={l.slug} className={`log-card glass log-card--${l.color}`}>
            <div className="log-card__meta">
              <span className="log-num text-dim">{l.slug}</span>
              <span className="log-date text-dim">{l.date}</span>
              <span className="log-readtime text-dim">{l.readTime}</span>
            </div>
            <h3 className="log-title">{l.title}</h3>
            <p className="log-excerpt text-dim">{l.excerpt}</p>
            <div className="log-footer">
              <div className="log-tags">
                {l.tags.map(t => <span key={t} className={`tag tag--${l.color}`}>{t}</span>)}
              </div>
              <a href="#" className={`log-read text-${l.color}`}>Read →</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// ─── Proposal Modal ───────────────────────────────────────────────────────────
const ProposalModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ project: '', service: '', details: '', contact: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project Proposal: ${form.project || 'New Project'}`);
    const body = encodeURIComponent(
      `Hi David,\n\nI'd like to work with you.\n\nProject: ${form.project}\nService Needed: ${form.service}\n\nDetails:\n${form.details}\n\nMy Contact: ${form.contact}\n\nLooking forward to hearing from you!`
    );
    window.location.href = `mailto:bittech18@gmail.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="section-eyebrow text-green">// send.proposal()</span>
          <button className="modal__close text-dim" onClick={onClose}>✕</button>
        </div>
        <h3 className="modal__title">Send a <span className="text-gradient">Proposal</span></h3>
        <p className="modal__sub text-dim">Fill in the details and your email client will open to send it directly.</p>
        <form className="proposal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label text-dim">Project Name</label>
            <input
              className="form-input"
              placeholder="e.g. CryptoLaunch DAO"
              value={form.project}
              onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-dim">Service Needed</label>
            <select
              className="form-input form-select"
              value={form.service}
              onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              required
            >
              <option value="">Select a service...</option>
              <option>Discord Infrastructure</option>
              <option>Community Leadership</option>
              <option>Project Advisory</option>
              <option>Content Systems</option>
              <option>Crypto Project Ambassador</option>
              <option>Multiple / Custom</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label text-dim">Project Details</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Tell me about your project, goals, and what you need..."
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-dim">Your Contact (Telegram / X / Email)</label>
            <input
              className="form-input"
              placeholder="e.g. @yourhandle"
              value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn--glow btn--full">
            Send Proposal →
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactLinks = [
  {
    icon: 'TG',
    platform: 'Telegram',
    handle: '@iamtwcp',
    desc: 'Best for quick projects',
    color: 'blue' as const,
    href: 'https://t.me/iamtwcp',
  },
  {
    icon: 'X',
    platform: 'X / Twitter',
    handle: '@Internxbt',
    desc: 'Follow for Web3 content',
    color: 'purple' as const,
    href: 'https://x.com/Internxbt',
  },
  {
    icon: '@',
    platform: 'Email',
    handle: 'bittech18@gmail.com',
    desc: 'For formal proposals',
    color: 'green' as const,
    href: 'mailto:bittech18@gmail.com',
  },
];

const Contact = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="contact" className="section contact">
      {showModal && <ProposalModal onClose={() => setShowModal(false)} />}
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow text-green">// contact.init()</span>
          <h2 className="section-title">Let's <span className="text-gradient">Build</span></h2>
          <p className="section-sub">Available for community building, Discord infrastructure, ambassador roles, and growth advisory</p>
        </div>
        <div className="contact-grid">
          <div className="contact-links-list">
            {contactLinks.map(c => (
              <a
                key={c.platform}
                href={c.href}
                className={`contact-link glass contact-link--${c.color}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contact-link__icon">{c.icon}</span>
                <div className="contact-link__info">
                  <div className="contact-link__platform">{c.platform}</div>
                  <div className={`contact-link__handle text-${c.color}`}>{c.handle}</div>
                  <div className="contact-link__desc text-dim">{c.desc}</div>
                </div>
                <span className="contact-link__arrow text-dim">→</span>
              </a>
            ))}
          </div>

          <div className="contact-services glass">
            <div className="contact-services__title text-dim">// available.for()</div>
            {[
              { service: 'Community Building', status: 'OPEN', color: 'green' },
              { service: 'Discord Infrastructure', status: 'OPEN', color: 'green' },
              { service: 'Crypto Project Ambassador', status: 'OPEN', color: 'green' },
              { service: 'Twitter/X Management', status: 'OPEN', color: 'green' },
              { service: 'Growth Advisory', status: 'OPEN', color: 'green' },
              { service: 'Project Consulting', status: 'LIMITED', color: 'orange' },
            ].map(s => (
              <div key={s.service} className="avail-item">
                <span className="avail-service">{s.service}</span>
                <span className={`avail-status avail-status--${s.color}`}>{s.status}</span>
              </div>
            ))}
            <div className="contact-cta">
              <button className="btn btn--glow btn--full" onClick={() => setShowModal(true)}>
                Send a Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="footer">
    <div className="footer__inner container">
      <div className="footer__brand">
        <span className="brand-tilde">~/</span>
        <span className="brand-name">David</span>
      </div>
      <p className="footer__sub text-dim">Web3 Operator • Community Architect • Discord Infrastructure • Crypto Ambassador</p>
      <div className="footer__links">
        {['home', 'stack', 'services', 'logs', 'contact'].map(l => (
          <a key={l} href={`#${l}`}>{l}</a>
        ))}
      </div>
      <p className="footer__copy text-dim">© 2026 David. All systems operational.</p>
    </div>
  </footer>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const HomePage = () => (
  <div className="app">
    <div className="grid-bg" />
    <div className="scanline" />
    <Navbar />
    <Hero />
    <TechStack />
    <Services />
    <DiscordShowcase />
    <OperatorLogs />
    <Contact />
    <Footer />
  </div>
);

const AnalyzerPage = () => (
  <div className="app">
    <div className="grid-bg" />
    <div className="scanline" />
    <XAnalyzer />
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/xanalyzer" element={<AnalyzerPage />} />
    </Routes>
  );
}
