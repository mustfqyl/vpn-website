"use client";

import Link from "next/link";

interface HeroProps {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  nodeStats: { total: number; active: number } | null;
}

export default function Hero({ isLoggedIn, isAuthLoading, nodeStats }: HeroProps) {
  return (
    <section className="pt-mobile-hero" style={{
      paddingTop: "240px",
      paddingBottom: "100px",
      textAlign: "center",
      position: "relative",
      zIndex: 1
    }}>
      <div className="container">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/servers" className="badge animate-fadeUp" style={{
            marginBottom: "2rem",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 1.25rem",
            border: "1px solid var(--card-border)",
            transition: "all 0.3s ease",
            background: "var(--accent-soft)"
          }}>
            {(() => {
              if (!nodeStats) {
                return (
                  <>
                    <span className="status-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--foreground-muted)", display: "block" }} />
                    <span style={{ color: "var(--foreground-muted)", fontWeight: 700, fontSize: "0.7rem" }}>CHECKING SYSTEM STATUS...</span>
                  </>
                );
              }

              if (nodeStats.active === nodeStats.total && nodeStats.total > 0) {
                return (
                  <>
                    <span className="status-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", display: "block" }} />
                    <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "0.7rem" }}>ALL SYSTEMS OPERATIONAL</span>
                  </>
                );
              }

              if (nodeStats.active === 0 && nodeStats.total > 0) {
                return (
                  <>
                    <span className="status-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--error)", display: "block", animation: "pulse 1s infinite" }} />
                    <span style={{ color: "var(--error)", fontWeight: 700, fontSize: "0.7rem" }}>MAJOR SYSTEM OUTAGE</span>
                  </>
                );
              }

              const offlinePercentage = ((nodeStats.total - nodeStats.active) / nodeStats.total) * 100;
              if (offlinePercentage > 49) {
                return (
                  <>
                    <span className="status-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--warning)", display: "block" }} />
                    <span style={{ color: "var(--warning)", fontWeight: 700, fontSize: "0.7rem" }}>PARTIAL SYSTEM OUTAGE</span>
                  </>
                );
              }

              return (
                <>
                  <span className="status-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", display: "block" }} />
                  <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "0.7rem" }}>ALL SYSTEMS OPERATIONAL</span>
                </>
              );
            })()}
          </Link>

          <h1 className="animate-reveal-up" style={{
            fontSize: "clamp(3rem, 10vw, 5.5rem)",
            marginBottom: "1.5rem",
            background: "linear-gradient(to bottom, var(--foreground) 50%, var(--foreground-muted))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.05,
            fontWeight: 800
          }}>
            See<br />the unseen.
          </h1>

          <p className="animate-fadeUp" style={{
            fontSize: "clamp(1.125rem, 4vw, 1.25rem)",
            color: "var(--foreground-muted)",
            maxWidth: "550px",
            margin: "0 auto 3.5rem",
            animationDelay: "0.1s"
          }}>
            Experience the elegance of uncompromising security and simplicity. Our premium network is engineered for those who demand absolute trust.
          </p>

          <div className="animate-fadeUp" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
            animationDelay: "0.2s",
            padding: "0 1rem"
          }}>
            {isAuthLoading ? (
              <div style={{ minWidth: "160px", height: "48px", background: "var(--accent-soft)", borderRadius: "8px", animation: "pulse 2s infinite" }} />
            ) : isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ minWidth: "160px", width: "calc(100% - 2rem)", maxWidth: "300px" }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/register" className="btn btn-primary" style={{ minWidth: "160px", width: "calc(100% - 2rem)", maxWidth: "300px" }}>
                Join Now
              </Link>
            )}
            <Link href="#features" className="btn btn-secondary" style={{ minWidth: "160px", width: "calc(100% - 2rem)", maxWidth: "300px" }}>
              Our Philosophy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}