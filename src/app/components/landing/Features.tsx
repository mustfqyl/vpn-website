"use client";

const FEATURE_DATA = [
  {
    title: "Quantum-Safe",
    label: "Security",
    description: "ML-KEM-768 encryption protocols built for the post-quantum era.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  {
    title: "10Gbps Core",
    label: "Network",
    description: "Hypersonic global backbone optimized for absolute zero-latency.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    )
  },
  {
    title: "RAM-Only",
    label: "Privacy",
    description: "Stateless infrastructure that physically cannot store user logs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    )
  },
  {
    title: "Stealth Mode",
    label: "Obfuscation",
    description: "Advanced protocol masking to bypass even the strictest firewalls.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  },
  {
    title: "Global Edge",
    label: "Jurisdiction",
    description: "Strategic presence in 100+ secure jurisdictions worldwide.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  {
    title: "Multi-Link",
    label: "Connectivity",
    description: "Seamless synchronization across up to 10 simultaneous devices.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    )
  }
];

export default function Features() {
  return (
    <section id="features" className="section reveal" style={{ padding: "10rem 0", background: "var(--background)" }}>
      <div className="container">
        <div style={{ marginBottom: "8rem" }}>
          <h2 style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            marginBottom: "2rem",
            color: "var(--foreground)"
          }}>
            Minimalist.<br />
            <span style={{ opacity: 0.4 }}>Absolute.</span>
          </h2>
          <p style={{
            fontSize: "1.125rem",
            color: "var(--foreground-muted)",
            maxWidth: "500px",
            lineHeight: 1.5
          }}>
            Stripping away the complexity of digital security. Performance and privacy, refined to their purest form.
          </p>
        </div>

        <div className="studio-grid">
          {FEATURE_DATA.map((f, i) => (
            <div key={i} className="studio-card">
              <div className="card-top">
                <div className="icon-container">{f.icon}</div>
                <span className="card-label">{f.label}</span>
              </div>
              <div className="card-content">
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .studio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--card-border);
          border-left: 1px solid var(--card-border);
        }

        .studio-card {
          padding: 4rem 3rem;
          border-right: 1px solid var(--card-border);
          border-bottom: 1px solid var(--card-border);
          transition: background 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4rem;
          min-height: 400px;
        }

        .studio-card:hover {
          background: var(--card-bg);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-container {
          color: var(--accent);
        }

        .card-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--foreground-muted);
          opacity: 0.6;
        }

        .card-content {
          margin-top: auto;
        }

        h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          letter-spacing: -0.03em;
          color: var(--foreground);
        }

        p {
          font-size: 1rem;
          line-height: 1.5;
          color: var(--foreground-muted);
          max-width: 240px;
        }

        @media (max-width: 1024px) {
          .studio-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .studio-grid {
            grid-template-columns: 1fr;
            border-left: none;
            border-top: none;
          }
          .studio-card {
            border-left: none;
            border-right: none;
            padding: 3rem 1.5rem;
            min-height: auto;
            gap: 2.5rem;
          }
          section {
            padding: 6rem 0 !important;
          }
          h2 {
            margin-bottom: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
}
