"use client";

import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog-posts";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";



export default function BlogIndexPage() {


    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />

            <Navbar />

            {/* Hero Section */}
            <section style={{ padding: "160px 1.5rem 60px", textAlign: "center" }}>
                <div className="container">
                    <h1 style={{
                        fontSize: "clamp(2.5rem, 8vw, 4rem)",
                        fontWeight: 600,
                        lineHeight: "1.1",
                        marginBottom: "1.5rem",
                        letterSpacing: "-0.04em",
                        background: "linear-gradient(to bottom, var(--foreground) 50%, var(--foreground-muted))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Network Briefing.
                    </h1>
                    <p style={{
                        color: "var(--foreground-muted)",
                        fontSize: "1.125rem",
                        maxWidth: "600px",
                        margin: "0 auto",
                        lineHeight: "1.6"
                    }}>
                        Deep dives into protocol architecture, stealth technology, and the future of digital sovereignty.
                    </p>
                </div>
            </section>

            {/* Blog Feed */}
            <main className="container" style={{ padding: "0 1.5rem 120px" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "2.5rem"
                }}>
                    {BLOG_POSTS.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="card"
                            style={{
                                padding: "2rem",
                                display: "flex",
                                flexDirection: "column",
                                transition: "transform 0.3s ease, border-color 0.3s ease",
                                cursor: "pointer",
                                textDecoration: "none",
                                border: "1px solid var(--card-border)"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                                <span style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "var(--accent)",
                                    background: "var(--accent-soft)",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "100px"
                                }}>
                                    {post.category}
                                </span>
                                <span style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                                    {post.readTime}
                                </span>
                            </div>

                            <h2 style={{
                                fontSize: "1.5rem",
                                fontWeight: 600,
                                marginBottom: "1rem",
                                color: "var(--foreground)",
                                lineHeight: "1.3"
                            }}>
                                {post.title}
                            </h2>

                            <p style={{
                                color: "var(--foreground-muted)",
                                fontSize: "0.9375rem",
                                lineHeight: "1.6",
                                marginBottom: "2rem",
                                flexGrow: 1
                            }}>
                                {post.excerpt}
                            </p>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "auto",
                                paddingTop: "1.5rem",
                                borderTop: "1px solid var(--card-border)"
                            }}>
                                <span style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", fontWeight: 500 }}>
                                    {post.date}
                                </span>
                                <div style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: "var(--card-border)",
                                    display: "grid",
                                    placeItems: "center",
                                    transition: "background 0.3s ease"
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </main>

            <Footer />

            <style jsx>{`
                .card:hover {
                    transform: translateY(-8px);
                    border-color: var(--accent) !important;
                }
                .card:hover div:last-child div {
                    background: var(--accent) !important;
                    color: var(--background);
                }
            `}</style>
        </div>
    );
}
