"use client";

export default function Stats() {
  const stats = [
    { value: "Quantum", label: "ML-KEM-768 encryption" },
    { value: "Low-Lat", label: "Ultra Speed Response" },
    { value: "Zero", label: "Trusted Zero Logs" },
    { value: "Pass", label: "Bypass Censorship" },
  ];

  return (
    <section className="reveal" style={{
      padding: "5rem 0",
      borderTop: "1px solid var(--card-border)",
      borderBottom: "1px solid var(--card-border)",
      background: "var(--background-secondary)"
    }}>
      <div className="container">
        <div className="grid-mobile-1" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2.5rem",
          textAlign: "center"
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={{
                fontSize: "3rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--foreground)",
                letterSpacing: "-0.03em"
              }}>{stat.value}</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--foreground-subtle)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
