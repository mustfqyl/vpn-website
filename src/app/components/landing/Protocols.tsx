"use client";

export default function Protocols() {
  const protocols = [
    {
      id: "WireGuard",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
      badge: "Daily Performance",
      title: "WireGuard®",
      description: "WireGuard is built for pure speed and reliability. It ensures your connection is always instant and won't drain your device's battery, making it the perfect choice for high-definition streaming, lag-free gaming, and everyday secure browsing.",
      items: ["Lag-free Streaming & Gaming", "Ultra-Low Battery Consumption", "Instant 'Always-On' Connectivity"]
    },
    {
      id: "ByeDPI",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
      badge: "DPI Filter Bypass",
      title: "ByeDPI",
      description: "ByeDPI is a unique tool that overcomes Deep Packet Inspection (DPI) without a tunnel. It cleverly fragments and modifies your request packets to slip past national-level firewalls and ISP blocks with zero performance overhead.",
      items: ["Nation-Level Firewall Bypassing", "Zero Performance or Speed Loss", "Lightweight Packet Manipulation"]
    },
    {
      id: "VLESS",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m14 12-4-2.5" /></svg>,
      badge: "Maximum Stealth",
      title: "VLESS",
      description: "VLESS is designed to bypass the toughest network restrictions and censorship. By masking your traffic as standard web activity, it allows you to stay connected and private even in highly monitored environments like schools, offices, or restricted regions.",
      items: ["Bypasses Censorship & Restrictions", "Undetectable Stealth Traffic", "Works on Any Restricted Network"]
    }
  ];

  return (
    <section id="protocols" className="section reveal" style={{ borderTop: "1px solid var(--card-border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h2 style={{
            fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
            marginBottom: "1rem",
            background: "linear-gradient(to right, var(--foreground), var(--foreground-muted))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Core Protocols
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto" }}>
            Carefully selected. We leverage top-tier transit protocols to ensure absolute performance and stealth.
          </p>
        </div>

        <div className="reveal grid-mobile-1" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {protocols.map((protocol) => (
            <div key={protocol.id} className="card premium-card" style={{ padding: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "var(--foreground)", opacity: 0.9, display: "flex" }}>
                  {protocol.icon}
                </div>
                <div className="badge" style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}>{protocol.badge}</div>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>{protocol.title}</h3>
              <p style={{ color: "var(--foreground-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
                {protocol.description}
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {protocol.items.map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
