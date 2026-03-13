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
  Shield, 
  Download,
  Copy,
  Check
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { copyToClipboard } from "@/lib/clipboard";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  // Auth logic removed as Navbar handles its own state
  // If this page needed isLoggedIn for content, it would be added back here.

  const copyCommand = async (cmd: string) => {
    const success = await copyToClipboard(cmd);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      >
        {mounted ? (
          theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )
        ) : <div style={{ width: "15px", height: "15px" }} />}
      </button>
    );
  };

  const platforms = [
    { id: "windows", name: "Windows", icon: <Monitor size={24} />, version: "2.4.1", link: "/download/setup.exe" },
    { id: "apple", name: "macOS / iOS", icon: <Apple size={24} />, version: "2.3.8", link: "https://apps.apple.com/app/securevpn" },
    { id: "android", name: "Android", icon: <Smartphone size={24} />, version: "2.5.0", link: "/download/app.apk" },
    { id: "linux", name: "Linux CLI", icon: <Terminal size={24} />, version: "1.9.2", command: "curl -sL https://securevpn.com/install.sh | sudo bash" }
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Navbar />

      <main className="pt-mobile-hero" style={{ paddingTop: "140px", paddingBottom: "100px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ marginBottom: "60px", textAlign: "left" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 8vw, 2.5rem)", fontWeight: 700, marginBottom: "0.5rem" }}>Downloads</h1>
            <p style={{ color: "var(--foreground-muted)", fontSize: "1rem" }}>Select your operating system to get started.</p>
          </div>

          <div className="grid-mobile-1" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {platforms.map((p) => (
              <div key={p.id} className="card" style={{ 
                padding: "1.25rem 1.5rem", background: "var(--background-secondary)", 
                border: "1px solid var(--card-border)", borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.2s ease",
                flexWrap: "wrap",
                gap: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1, minWidth: "200px" }}>
                  <div style={{ color: "var(--foreground-muted)" }}>{p.icon}</div>
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{p.name}</h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--foreground-subtle)", marginTop: "0.25rem" }}>Version {p.version}</div>
                  </div>
                </div>

                {p.command ? (
                  <button 
                    onClick={() => copyCommand(p.command!)} 
                    style={{ 
                      background: "var(--accent-soft)", border: "1px solid var(--card-border)", 
                      color: "var(--foreground)", padding: "0.6rem 1.2rem", borderRadius: "8px",
                      fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem",
                      cursor: "pointer"
                    }}
                  >
                    {copied ? <Check size={14} style={{ color: "var(--success)" }} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Command"}
                  </button>
                ) : (
                  <Link href={p.link!} className="btn btn-primary" style={{ 
                    padding: "0.6rem 1.5rem", fontSize: "0.8rem", borderRadius: "8px",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <Download size={14} />
                    Download
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "60px", padding: "2rem", borderTop: "1px solid var(--card-border)", color: "var(--foreground-muted)" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>System Requirements</h4>
            <ul className="grid-mobile-1" style={{ fontSize: "0.8rem", listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <li>• Windows 10 or higher</li>
              <li>• macOS 11.0 Big Sur or higher</li>
              <li>• Android 8.0 or higher</li>
              <li>• Any major Linux distribution</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
