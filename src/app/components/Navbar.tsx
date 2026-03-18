"use client";

import Link from "next/link";
import { useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { siteConfig } from "@/lib/siteConfig";
import { ProfileSettings } from "@/app/dashboard/components/ProfileSettings";
import { Menu, X, Shield } from "lucide-react";

interface NavbarProps {
  hideLinks?: boolean;
  isLoggedIn?: boolean;
  isAuthLoading?: boolean;
}

export default function Navbar({ hideLinks = false, isLoggedIn: initialIsLoggedIn, isAuthLoading = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (initialIsLoggedIn !== undefined) return initialIsLoggedIn;
    if (typeof window !== "undefined") {
      return document.cookie.split(";").some((c) => c.trim().startsWith("auth_status=1"));
    }
    return false;
  });
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (initialIsLoggedIn !== undefined) {
      setIsLoggedIn(initialIsLoggedIn);
      return;
    }
    // Synchronous check using the non-httpOnly auth_status cookie
    const hasAuth = document.cookie.split(";").some((c) => c.trim().startsWith("auth_status=1"));
    setIsLoggedIn(hasAuth);
  }, [initialIsLoggedIn]);

  useEffect(() => {
    // Background fetch to verify auth and get full user data
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setIsLoggedIn(true);
          setUser(data);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const ThemeSwitcher = () => {
    const { theme, toggleTheme, mounted } = useTheme();
    return (
      <button
        onClick={toggleTheme}
        style={{
          width: "36px",
          height: "36px",
          flexShrink: 0,
          borderRadius: "8px",
          background: "none",
          border: "1px solid var(--card-border)",
          display: "grid",
          placeItems: "center",
          transition: "border-color 0.2s ease",
          color: "var(--foreground-muted)",
          cursor: "pointer",
        }}
        aria-label="Toggle Theme"
      >
        {mounted ? (
          theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )
        ) : (
          <div style={{ width: "15px", height: "15px" }} />
        )}
      </button>
    );
  };

  const Divider = () => (
    <div style={{ width: "1px", height: "18px", background: "var(--card-border)", flexShrink: 0 }} />
  );

  return (
    <>
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
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}>
        <div style={{ padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
              <div style={{ width: "24px", height: "24px", background: "var(--foreground)", borderRadius: "6px", display: "grid", placeItems: "center", color: "var(--background)", boxShadow: "0 0 15px rgba(255,255,255,0.2)" }}>
                <Shield size={14} strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em", color: "var(--foreground)" }}>
                {siteConfig.name.replace("VPN", "")}
              </span>
            </Link>

            {/* Center Nav — desktop only, only on public pages */}
            {!hideLinks && (
              <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-only">
                <Link href="/#features" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Solutions</Link>
                <Link href="/#pricing" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Pricing</Link>
                <Link href="/blog" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Blog</Link>
                <Link href="/download" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>Downloads</Link>
                <Divider />
                <ThemeSwitcher />
              </nav>
            )}

            {/* Right action group */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>

              {/* Desktop buttons */}
              <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "140px", justifyContent: "flex-end" }}>
                {hideLinks && (
                  <>
                    <ThemeSwitcher />
                    <Divider />
                  </>
                )}
                {isAuthLoading && !isLoggedIn ? (
                  <div style={{ width: "100px", height: "32px", background: "var(--card-border)", borderRadius: "100px", animation: "pulse 2s infinite", opacity: 0.5 }} />
                ) : isLoggedIn ? (
                  pathname === "/dashboard" ? (
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--background-glass)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "100px",
                        color: "var(--foreground)",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        letterSpacing: "0.025em",
                        whiteSpace: "nowrap",
                      }}
                      aria-label="Profile Settings"
                    >
                      Settings
                    </button>
                  ) : (
                    <Link href="/dashboard" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", borderRadius: "100px", whiteSpace: "nowrap" }}>
                      Dashboard
                    </Link>
                  )
                ) : (
                  <>
                    <Link href="/auth/login" className="link-subtle" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>Sign in</Link>
                    <Link href="/auth/register" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", borderRadius: "100px", boxShadow: "0 0 15px var(--accent-glow)", background: "var(--foreground)", color: "var(--background)", whiteSpace: "nowrap" }}>
                      Join
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile buttons */}
              <div className="mobile-only" style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "54px", justifyContent: "flex-end" }}>
                {hideLinks && <ThemeSwitcher />}
                {isAuthLoading && !isLoggedIn && (
                  <div style={{ width: "32px", height: "32px", background: "var(--card-border)", borderRadius: "50%", animation: "pulse 2s infinite", opacity: 0.5 }} />
                )}
                {isLoggedIn && (
                  <>
                    <Divider />
                    {pathname === "/dashboard" ? (
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "var(--background-glass)",
                          border: "1px solid var(--card-border)",
                          borderRadius: "100px",
                          color: "var(--foreground)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                        aria-label="Profile Settings"
                      >
                        Settings
                      </button>
                    ) : hideLinks ? (
                      <Link href="/dashboard" className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "100px", whiteSpace: "nowrap" }}>
                        Dashboard
                      </Link>
                    ) : null}
                  </>
                )}
                {!hideLinks && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ background: "none", border: "none", color: "var(--foreground)", padding: "0.5rem", cursor: "pointer", display: "flex" }}
                    aria-label="Toggle Menu"
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: "absolute",
            top: "calc(var(--header-height) + 12px)",
            left: 0,
            right: 0,
            background: "var(--background)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            zIndex: 99,
            animation: "fadeInUp 0.3s ease",
          }}>
            {!hideLinks && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link href="/#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Solutions</Link>
                  <ThemeSwitcher />
                </div>
                <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pricing</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Blog</Link>
                <Link href="/download" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Downloads</Link>
                <div style={{ height: "1px", background: "var(--card-border)" }} />
              </>
            )}
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: "center", padding: "0.8rem", borderRadius: "100px" }}>
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

      {/* Global Profile Settings Modal */}
      {user && (
        <ProfileSettings
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}
