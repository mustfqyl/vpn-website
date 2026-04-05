"use client";
import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="section reveal" style={{ background: "var(--background-secondary)", borderTop: "1px solid var(--card-border)" }}>
      <div className="container">
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            marginBottom: "1.5rem",
            color: "var(--foreground)"
          }}>
            Free Forever. Supported by You.
          </h2>
          <p style={{ marginBottom: "4rem", fontSize: "1.125rem", color: "var(--foreground-muted)" }}>
            We've decided to make our high-performance VPN free for everyone. Our infrastructure is now sustained entirely by community donations.
          </p>
        </div>

        <div className="grid-mobile-1" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          maxWidth: "820px",
          margin: "0 auto",
          padding: "0 1rem"
        }}>
          {/* Free Plan Card */}
          <div className="card" style={{
            padding: "2.5rem 2rem",
            background: "var(--background)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center"
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontSize: "0.6875rem",
                color: "var(--success)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "0.75rem"
              }}>Standard Access</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>Free</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>No catch, no logs, just privacy.</p>
            </div>

            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 2rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "left",
              flex: 1
            }}>
              {[
                "Quantum-Safe Encryption",
                "Unlimited Bandwidth",
                "Multiple Locations",
                "All Protocols Supported"
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/auth/register" className="btn btn-secondary" style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              fontSize: "0.875rem"
            }}>
              Get Access Now
            </Link>
          </div>

          {/* Donation Card */}
          <div className="card" style={{
            padding: "2.5rem 2rem",
            background: "var(--background)",
            border: "2px solid var(--accent)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            boxShadow: "0 0 60px -15px rgba(139, 92, 246, 0.15)"
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontSize: "0.6875rem",
                color: "var(--accent)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "0.75rem"
              }}>Support Development</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>Donate</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>Keep our nodes running</p>
            </div>

            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 2rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "left",
              flex: 1
            }}>
              {[
                "Upgrade Node Capacity",
                "New Server Locations",
                "Development Support",
                "Community Badges"
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--foreground)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/donation" className="btn btn-primary" style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              fontSize: "0.875rem"
            }}>
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
