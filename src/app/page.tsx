"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { siteConfig } from "@/lib/siteConfig";
import { Apple, Monitor, Smartphone, Terminal, ChevronDown, Menu, X, Check, AlertTriangle, CloudRain, Cpu, Shield, Zap, Wind, Users, ArrowLeft, Server } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [nodeStats, setNodeStats] = useState<{ total: number; active: number } | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetch('/api/user/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => { /* Network error — silently ignore */ })
      .finally(() => setIsAuthLoading(false));

    // Fetch live node status for pulse indicator
    fetch('/api/server/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.nodes) {
          const total = data.nodes.length;
          const active = data.nodes.filter((n: any) => n.status === 'connected').length;
          setNodeStats({ total, active });
        }
      })
      .catch(() => { /* Silent failure */ });
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen no-select">
      <Navbar />

      {/* Hero Section */}
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

                // If some nodes are down but not >49%
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
              Pure Privacy.<br />Simply Fast.
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

      {/* Corporate Divider / Stats */}
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
            {[
              { value: "50+", label: "Strategic Global Nodes" },
              { value: "Low-Lat", label: "Ultra Speed Response" },
              { value: "Zero", label: "Trusted Zero Logs" },
              { value: "Elite", label: "Premium 24/7 Care" },
            ].map((stat, i) => (
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

      {/* Features / Solutions */}
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
            {[
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
            ].map((feature, i) => (
              <div key={i} className="card premium-card">
                <div style={{ color: "var(--foreground)", marginBottom: "1.5rem", opacity: 0.9 }}>{feature.icon}</div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", fontWeight: 600 }}>{feature.title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--foreground-muted)", lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Core Architecture */}
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
            {/* WireGuard Card */}
            <div className="card premium-card" style={{ padding: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "var(--foreground)", opacity: 0.9, display: "flex" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <div className="badge" style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}>Daily Performance</div>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>WireGuard®</h3>
              <p style={{ color: "var(--foreground-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
                WireGuard is built for pure speed and reliability. It ensures your connection is always instant and won&apos;t drain your device&apos;s battery, making it the perfect choice for high-definition streaming, lag-free gaming, and everyday secure browsing.
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "Lag-free Streaming & Gaming",
                  "Ultra-Low Battery Consumption",
                  "Instant 'Always-On' Connectivity"
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ByeDPI Card */}
            <div className="card premium-card" style={{ padding: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "var(--foreground)", opacity: 0.9, display: "flex" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <div className="badge" style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}>DPI Filter Bypass</div>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>ByeDPI</h3>
              <p style={{ color: "var(--foreground-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
                ByeDPI is a unique tool that overcomes Deep Packet Inspection (DPI) without a tunnel. It cleverly fragments and modifies your request packets to slip past national-level firewalls and ISP blocks with zero performance overhead.
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "Nation-Level Firewall Bypassing",
                  "Zero Performance or Speed Loss",
                  "Lightweight Packet Manipulation"
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* VLESS Card */}
            <div className="card premium-card" style={{ padding: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "var(--foreground)", opacity: 0.9, display: "flex" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m14 12-4-2.5" /></svg>
                </div>
                <div className="badge" style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}>Maximum Stealth</div>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>VLESS</h3>
              <p style={{ color: "var(--foreground-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
                VLESS is designed to bypass the toughest network restrictions and censorship. By masking your traffic as standard web activity, it allows you to stay connected and private even in highly monitored environments like schools, offices, or restricted regions.
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "Bypasses Censorship & Restrictions",
                  "Undetectable Stealth Traffic",
                  "Works on Any Restricted Network"
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Access */}
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

      <Footer />

      <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.reveal-active {
          opacity: 1;
          transform: translateY(0);
        }

        .animate-reveal-up {
          animation: revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes revealUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mobile-only { display: none; }
        .desktop-only { display: flex; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </div>
  );
}
