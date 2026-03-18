"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { siteConfig } from "@/lib/siteConfig";
import {
  Apple,
  Monitor,
  Smartphone,
  Terminal,
  ChevronDown,
  Menu,
  X,
  Shield
} from "lucide-react";

interface NavbarProps {
  hideLinks?: boolean;
}

export default function Navbar({ hideLinks = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDownloadsOpen, setMobileDownloadsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/user/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const ThemeSwitcher = () => {
    const { theme, toggleTheme, mounted } = useTheme();
    return (
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn active"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "none",
          border: "1px solid var(--card-border)",
          display: "grid",
          placeItems: "center",
          transition: "all 0.2s ease",
          color: "var(--foreground-muted)",
          cursor: "pointer"
        }}
        aria-label="Toggle Theme"
      >
        {mounted ? (
          theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )
        ) : (
          <div style={{ width: "15px", height: "15px" }} />
        )}
      </button>
    );
  };

  return (
    <header style={{
      position: "fixed",
      top: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 3rem)",
      maxWidth: "1000px",
      zIndex: 100,
      backgroundColor: "var(--background-glass)",
      WebkitBackdropFilter: "blur(24px)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "100px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    }}>
      <div className="container" style={{ padding: "0 1.5rem" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "24px", height: "24px", background: "var(--foreground)", borderRadius: "6px", display: "grid", placeItems: "center", color: "var(--background)", boxShadow: "0 0 15px rgba(255,255,255,0.2)" }}>
              <Shield size={14} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em", color: "var(--foreground)" }}>{siteConfig.name.replace('VPN', '')}</span>
          </Link>

          {/* Center Navigation */}
          {!hideLinks && (
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-only">
              <Link href="/#features" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Solutions</Link>
              <Link href="/#pricing" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Pricing</Link>
              <Link href="/blog" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Blog</Link>
              <Link href="/download" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Downloads</Link>
              <div style={{ width: "2px", height: "18px", background: "var(--card-border)" }} />
              <ThemeSwitcher />
            </nav>
          )}

          {/* Action Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {hideLinks && (
                <>
                  <ThemeSwitcher />
                  <div style={{ width: "2px", height: "18px", background: "var(--card-border)" }} />
                </>
              )}
              {isAuthLoading ? (
                <div style={{ width: "100px", height: "36px", background: "var(--card-border)", borderRadius: "100px", animation: "pulse 2s infinite" }} />
              ) : isLoggedIn ? (
                pathname === "/dashboard" ? (
                  <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/")} className="btn btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", borderRadius: "100px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground)" }}>
                    Sign Out
                  </button>
                ) : (
                  <Link href="/dashboard" className="btn" style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", borderRadius: "100px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground)" }}>
                    Dashboard
                  </Link>
                )
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <Link href="/auth/login" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "var(--foreground-muted)" }}>Sign in</Link>
                  <Link href="/auth/register" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", borderRadius: "100px", boxShadow: "0 0 15px var(--accent-glow)", background: "var(--foreground)", color: "var(--background)" }}>
                    Join
                  </Link>
                </div>
              )}
            </div>

            <div className="mobile-only" style={{ marginLeft: "1rem" }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: "none", border: "none", color: "var(--foreground)", padding: "0.5rem", cursor: "pointer", display: "flex" }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "absolute",
          top: "var(--header-height)",
          left: 0,
          right: 0,
          background: "var(--background-glass)",
          WebkitBackdropFilter: "blur(60px)",
          backdropFilter: "blur(60px)",
          borderBottom: "1px solid var(--card-border)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          zIndex: 99,
          animation: "fadeInUp 0.3s ease"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: "var(--accent-soft)", border: "1px solid var(--card-border)", color: "var(--foreground)", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", display: "flex" }}
            >
              <X size={20} />
            </button>
          </div>
          {!hideLinks && (
            <>
              <Link href="/#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Solutions</Link>
              <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pricing</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Blog</Link>


              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button
                  onClick={() => setMobileDownloadsOpen(!mobileDownloadsOpen)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                    color: "var(--foreground)",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer"
                  }}
                >
                  Downloads
                  <ChevronDown
                    size={16}
                    style={{ transform: mobileDownloadsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", opacity: 0.5 }}
                  />
                </button>

                {mobileDownloadsOpen && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "1.25rem",
                    paddingLeft: "1.25rem",
                    paddingTop: "0.5rem",
                    animation: "fadeIn 0.3s ease"
                  }}>
                    <Link href="/download#apple" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Apple size={18} style={{ opacity: 0.7 }} />
                      Apple Client
                    </Link>
                    <Link href="/download#windows" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Monitor size={18} style={{ opacity: 0.7 }} />
                      Windows Client
                    </Link>
                    <Link href="/download#android" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Smartphone size={18} style={{ opacity: 0.7 }} />
                      Android Client
                    </Link>
                    <Link href="/download#linux" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Terminal size={18} style={{ opacity: 0.7 }} />
                      Linux Client
                    </Link>
                  </div>
                )}
              </div>

              <div style={{ height: "1px", background: "var(--card-border)" }} />
            </>
          )}
          {isAuthLoading ? (
            <div style={{ height: "48px", background: "var(--accent-soft)", borderRadius: "8px", animation: "pulse 2s infinite" }} />
          ) : isLoggedIn ? (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: "center", padding: "0.8rem" }}>
              Go to Dashboard
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sign in</Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: "center", padding: "0.8rem" }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
