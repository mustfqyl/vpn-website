"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer style={{
      padding: "6rem 0 4rem",
      borderTop: "1px solid var(--card-border)",
      background: "var(--background)",
      position: "relative",
      zIndex: 10
    }}>
      <div className="container">
        <div className="grid-mobile-1" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          marginBottom: "4rem"
        }}>
          <div style={{ gridColumn: "span 1" }}>
            <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "24px", height: "24px", background: "var(--accent)", borderRadius: "4px" }} />
              {siteConfig.name}
            </Link>
            <p style={{ maxWidth: "350px", fontSize: "0.9375rem", color: "var(--foreground-muted)" }}>
              We take pleasure in working to make an uncensored and private internet, which we believe everyone has a right to, as accessible as possible in the simplest way.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Product</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
              <Link href="/#features" className="link-subtle">Solutions</Link>
              <Link href="/#pricing" className="link-subtle">Pricing</Link>
              <Link href="/blog" className="link-subtle">Blog</Link>
              <Link href="/servers" className="link-subtle">Servers</Link>
              <Link href="/download" className="link-subtle">Downloads</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Company</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
              <Link href="/privacy" className="link-subtle">Privacy Policy</Link>
              <Link href="/terms" className="link-subtle">Terms of Service</Link>
              <Link href="/contact" className="link-subtle">Corporate Contact</Link>
            </nav>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "2rem",
          borderTop: "1px solid var(--card-border)",
          fontSize: "0.75rem",
          color: "var(--foreground-subtle)",
          fontWeight: 500
        }}>
          <span>© {new Date().getFullYear()} {siteConfig.name} - All rights reserved.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="#" className="link-subtle">Twitter.</Link>
            <Link href="#" className="link-subtle">GitHub.</Link>
            <Link href="#" className="link-subtle">Discord.</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
