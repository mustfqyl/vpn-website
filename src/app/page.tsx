"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Hero from "@/app/components/landing/Hero";
import Stats from "@/app/components/landing/Stats";
import Features from "@/app/components/landing/Features";
import Protocols from "@/app/components/landing/Protocols";
import Pricing from "@/app/components/landing/Pricing";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [nodeStats, setNodeStats] = useState<{ total: number; active: number } | null>(null);

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
          const active = data.nodes.filter((n: { status: string }) => n.status === 'connected').length;
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
      <Navbar isLoggedIn={isLoggedIn} />

      <Hero
        isLoggedIn={isLoggedIn}
        isAuthLoading={isAuthLoading}
        nodeStats={nodeStats}
      />

      <Stats />

      <Features />

      <Protocols />

      <Pricing />

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
