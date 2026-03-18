"use client";

export default function Features() {
  const features = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>,
      title: "ML-KEM-768 post-quantum encryption",
      description: "Leveraging state-of-the-art cryptographic standards to ensure your data remains purely private and unreachable."
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
      title: "Pure Velocity",
      description: "A network optimized for simple, lightning-fast transitions across any global application."
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>,
      title: "No Oversubscription",
      description: "Our infrastructure guarantees maximum performance even during peak intervals. No compromises."
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
      title: "Trusted Zero-Log",
      description: "Architected for honesty. We maintain zero browsing logs, ensuring your trust is never broken."
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 9-10 10L2 12z" /></svg>,
      title: "Boutique Service",
      description: "Instead of offering standard service to a large number of users, we choose to offer premium service to a select group of users."
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      title: "Limited Customers",
      description: "Our service is limited to a certain number of users, aiming to provide maximum performance to each customer; currently, our maximum subscriber count is 1000."
    },
  ];

  return (
    <section id="features" className="section reveal">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "8rem" }}>
          <h2 style={{
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            marginBottom: "1.5rem",
            background: "linear-gradient(to bottom, var(--foreground), var(--foreground-muted))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Elegant Performance
          </h2>
          <p style={{ maxWidth: "550px", margin: "0 auto" }}>
            Stripping away complexity to provide the world&apos;s most intuitive and powerful security infrastructure.
          </p>
        </div>

        <div className="reveal grid-mobile-1" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem"
        }}>
          {features.map((feature, i) => (
            <div key={i} className="card premium-card">
              <div style={{ color: "var(--foreground)", marginBottom: "1.5rem", opacity: 0.9 }}>{feature.icon}</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", fontWeight: 600 }}>{feature.title}</h3>
              <p style={{ fontSize: "0.9375rem", color: "var(--foreground-muted)", lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
