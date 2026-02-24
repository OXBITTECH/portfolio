import './App.css';

// Components (will be extracted to separate files soon)
const Navbar = () => (
  <nav className="glass" style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '2px' }} className="text-gradient">OXBIT.TECH</div>
    <div style={{ display: 'flex', gap: '30px' }}>
      <a href="#home" style={{ textDecoration: 'none', color: 'inherit' }}>Home</a>
      <a href="#services" style={{ textDecoration: 'none', color: 'inherit' }}>Services</a>
      <a href="#projects" style={{ textDecoration: 'none', color: 'inherit' }}>Web3</a>
      <a href="#contact" style={{ textDecoration: 'none', color: 'var(--neon-cyan)' }}>Contact</a>
    </div>
  </nav>
);

const Hero = () => (
  <section id="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 20px' }}>
    <div className="animate-float" style={{ border: '2px solid var(--neon-cyan)', borderRadius: '50%', padding: '10px', marginBottom: '30px', boxShadow: '0 0 20px var(--neon-cyan)' }}>
      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OXBIT" alt="Avatar" style={{ width: '120px', borderRadius: '50%' }} />
    </div>
    <h1 style={{ fontSize: '4rem', marginBottom: '10px' }} className="glitch-text">
      TECH <span className="text-gradient">ENGINEER</span>
    </h1>
    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '30px' }}>
      Discord Architect | Web3 Developer | Content Creator | Social Media Manager
    </p>
    <div style={{ display: 'flex', gap: '20px' }}>
      <button className="neon-border" style={{ padding: '12px 30px', background: 'transparent', color: 'var(--neon-cyan)', cursor: 'pointer', borderRadius: '5px' }}>View Services</button>
      <button style={{ padding: '12px 30px', background: 'var(--neon-cyan)', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Connect Wallet</button>
    </div>
  </section>
);

const ServiceCard = ({ title, desc, icon }: { title: string, desc: string, icon: string }) => (
  <div className="glass" style={{ padding: '40px', textAlign: 'left', transition: '0.3s', cursor: 'default' }}>
    <div style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--neon-cyan)' }}>{icon}</div>
    <h3 style={{ marginBottom: '15px', color: 'var(--neon-cyan)' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

const Services = () => (
  <section id="services" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '60px' }}>TECH <span className="text-gradient">CAPABILITIES</span></h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
      <ServiceCard
        icon="⚡"
        title="Discord DAO Setup"
        desc="Professional-grade server architecture for DAOs and Web3 communities. Automated governance, security, and custom bot integration."
      />
      <ServiceCard
        icon="🔗"
        title="Web3 Development"
        desc="Discord bot development, smart contract interaction tools, and custom technical solutions for the crypto ecosystem."
      />
      <ServiceCard
        icon="📽️"
        title="Content Creation"
        desc="High-quality tech and crypto content. Deep analysis, educational videos, and community-driven storytelling."
      />
      <ServiceCard
        icon="📱"
        title="Social Media Manager"
        desc="Strategic growth and management for Web3 brands. Community engagement, ambassador program scaling, and trend analysis."
      />
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ padding: '50px 20px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
    <div style={{ marginBottom: '30px', fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">OXBIT TECH</div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
      <a href="https://github.com/OXBITTECH" style={{ color: 'inherit', fontSize: '1.5rem' }}>GitHub</a>
      <a href="#" style={{ color: 'inherit', fontSize: '1.5rem' }}>Twitter</a>
      <a href="#" style={{ color: 'inherit', fontSize: '1.5rem' }}>Discord</a>
    </div>
    <p style={{ color: 'var(--text-secondary)' }}>© 2026 OXBIT TECH. All nodes operational.</p>
  </footer>
);

function App() {
  return (
    <div className="App">
      <div className="grid-bg"></div>
      <Navbar />
      <Hero />
      <Services />
      <Footer />
    </div>
  );
}

export default App;
