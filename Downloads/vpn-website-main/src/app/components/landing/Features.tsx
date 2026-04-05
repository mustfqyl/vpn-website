"use client";

import { Eye, ShieldAlert, Flame } from "lucide-react";

const PHILOSOPHY_DATA = [
  {
    title: "Our Vision",
    label: "A Borderless Future",
    description: "To construct a universal, transparent digital ecosystem where arbitrary borders, artificial barriers, and draconian censorship simply do not exist. We envision a world where the free flow of information remains uninterrupted, decentralized, and completely unrestricted for every individual on Earth.",
    icon: <Eye size={36} strokeWidth={1} />
  },
  {
    title: "Our Mission",
    label: "The Movement",
    description: "To systematically dismantle oppressive surveillance mechanisms and democratize digital privacy. We strive to elevate secure, anonymous, and high-speed internet access from a privileged luxury to a fundamental, irrefutable human right.",
    icon: <ShieldAlert size={36} strokeWidth={1} />
  },
  {
    title: "Our Purpose",
    label: "True Freedom",
    description: "To fiercely protect freedom of thought and expression. By relying entirely on community-driven support rather than corporate profit models, we guarantee an infrastructure that permanently liberates the internet from state and corporate control.",
    icon: <Flame size={36} strokeWidth={1} />
  }
];

export default function Features() {
  return (
    <section id="features" className="section reveal" style={{ padding: "10rem 0", background: "var(--background)", position: "relative" }}>
      <div className="container">
        <div className="layout-split">
          
          {/* Sticky Left Column */}
          <div className="sticky-header">
            <h2 className="main-title">
              Uncensored.<br />
              <span style={{ color: "var(--foreground-muted)" }}>Unrestricted.</span>
            </h2>
            <div style={{ height: "4px", width: "60px", background: "var(--accent)", margin: "2rem 0", borderRadius: "2px" }} />
            <p className="main-description">
              We firmly believe that access to the internet is an unalienable human right. No authority, corporation, or border should ever compromise your right to information and absolute privacy.
            </p>
          </div>

          {/* Flowing Right Column (No Boxes) */}
          <div className="content-flow">
            {PHILOSOPHY_DATA.map((item, i) => (
              <div key={i} className="flow-item">
                <div className="item-header">
                  <div className="icon-glow">{item.icon}</div>
                  <span className="item-label">{item.title}</span>
                </div>
                
                <h3 className="item-title">{item.label}</h3>
                <p className="item-text">{item.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style jsx>{`
        .layout-split {
          display: flex;
          gap: 6rem;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
        }

        .sticky-header {
          flex: 1;
          position: sticky;
          top: 150px;
          padding-right: 2rem;
        }

        .main-title {
          fontSize: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--foreground);
        }

        .main-description {
          font-size: 1.25rem;
          color: var(--foreground-muted);
          line-height: 1.7;
          max-width: 450px;
        }

        .content-flow {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .flow-item {
          padding: 5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: transform 0.4s ease;
        }

        .flow-item:first-child {
          padding-top: 0;
        }

        .flow-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .icon-glow {
          color: var(--accent);
          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.4));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-label {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--foreground-muted);
        }

        .item-title {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
          line-height: 1.1;
        }

        .item-text {
          font-size: 1.15rem;
          color: var(--foreground-muted);
          line-height: 1.8;
          max-width: 550px;
        }

        @media (max-width: 1024px) {
          .layout-split {
            flex-direction: column;
            gap: 4rem;
          }
          .sticky-header {
            position: relative;
            top: 0;
            padding-right: 0;
            max-width: 100%;
          }
          .main-description {
            max-width: 100%;
          }
          .content-flow {
            width: 100%;
          }
          .flow-item {
            padding: 4rem 0;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 6rem 0 !important;
          }
          .main-title {
            font-size: 3rem;
          }
          .item-title {
            font-size: 2rem;
          }
          .item-text {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </section>
  );
}
