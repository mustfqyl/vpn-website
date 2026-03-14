"use client";

import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="section reveal" style={{ background: "var(--background-secondary)", borderTop: "1px solid var(--card-border)" }}>
      <div className="container">
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            marginBottom: "1rem",
            color: "var(--foreground)"
          }}>
            Simple Plans. Premium Value.
          </h2>
          <p style={{ marginBottom: "4rem" }}>
            Highest-tier privacy, simplified for everyone.
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
          {/* Trial Plan */}
          <div className="card" style={{
            padding: "2.5rem 2rem",
            background: "var(--background)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease"
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontSize: "0.6875rem",
                color: "var(--foreground-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "0.75rem"
              }}>Trial</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>€0</span>
                <span style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>/3 days</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>Try risk-free</p>
            </div>

            <div style={{ width: "100%", height: "1px", background: "var(--card-border)", marginBottom: "1.5rem" }} />

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
                "Same",
                "as",
                "premium",
                "plan",
                "for three days :)"
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/auth/register?plan=Trial" className="btn btn-secondary" style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              fontSize: "0.875rem"
            }}>
              Start Free Trial
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="card" style={{
            padding: "2.5rem 2rem",
            background: "var(--background)",
            border: "2px solid var(--accent)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 0 60px -15px rgba(139, 92, 246, 0.15)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease"
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontSize: "0.6875rem",
                color: "var(--foreground-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "0.75rem"
              }}>Premium</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>€2.50</span>
                <span style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>/mo</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "0.5rem" }}>Unlimited privacy</p>
            </div>

            <div style={{ width: "100%", height: "1px", background: "var(--card-border)", marginBottom: "1.5rem" }} />

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
                "Always No-Log",
                "Unlimited Data",
                "3 Devices",
                "EU & USA Locations"
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--foreground)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/auth/register?plan=Premium" className="btn btn-primary" style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              fontSize: "0.875rem"
            }}>
              Get Premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
