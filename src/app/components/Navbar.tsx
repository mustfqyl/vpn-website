"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDownloadsOpen, setMobileDownloadsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "var(--accent-soft)",
          border: "1px solid var(--card-border)",
          display: "grid",
          placeItems: "center",
          transition: "all 0.2s ease"
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
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: "var(--background-glass)",
      WebkitBackdropFilter: "blur(40px)",
      backdropFilter: "blur(40px)",
      borderBottom: "1px solid var(--card-border)",
      transition: "all 0.3s ease"
    }}>
      <div className="container">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "var(--header-height)"
        }}>
          <Link href="/" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "22px", height: "22px", background: "var(--accent)", borderRadius: "5px", display: "grid", placeItems: "center", color: "var(--background)", transition: "all 0.3s ease" }}>
              <Shield size={14} strokeWidth={2.5} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontWeight: 800 }}>{siteConfig.name.replace('VPN', '')}</span>
              <span style={{ fontWeight: 400, opacity: 0.6 }}>VPN</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-only">
            <Link href="/#features" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Solutions</Link>
            <Link href="/#pricing" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pricing</Link>
            <Link href="/blog" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Blog</Link>
            <div className="nav-dropdown-trigger">
              <Link href="/download" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Downloads
                <ChevronDown size={12} strokeWidth={3} style={{ opacity: 0.5 }} />
              </Link>
              <div className="nav-dropdown-content">
                <Link href="/download#apple" className="dropdown-item">
                  <Apple size={16} />
                  Apple
                </Link>
                <Link href="/download#windows" className="dropdown-item">
                  <Monitor size={16} />
                  Windows
                </Link>
                <Link href="/download#android" className="dropdown-item">
                  <Smartphone size={16} />
                  Android
                </Link>
                <Link href="/download#linux" className="dropdown-item">
                  <Terminal size={16} />
                  Linux
                </Link>
              </div>
            </div>


            <div style={{ width: "2px", height: "25px", background: "var(--card-border)", margin: "0 0.5rem" }} />
            <ThemeSwitcher />
          </nav>

          {/* Action Group (Signs, Theme, Setup) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "220px" }}>
              {isAuthLoading ? (
                <div style={{ width: "160px", height: "36px", background: "var(--accent-soft)", borderRadius: "8px", animation: "pulse 2s infinite", opacity: 0.5 }} />
              ) : isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-primary" style={{ padding: "0.6rem 1.4rem", fontSize: "0.8125rem", borderRadius: "8px", textAlign: "center", justifyContent: "center" }}>
                  Dashboard
                </Link>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", justifyContent: "flex-end" }}>
                  <Link href="/auth/login" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sign in</Link>
                  <Link href="/auth/register" className="btn btn-primary" style={{ padding: "0.6rem 1.4rem", fontSize: "0.8125rem", borderRadius: "8px" }}>
                    Join Now
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
