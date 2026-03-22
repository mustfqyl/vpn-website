"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { BLOG_POSTS } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";



export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        if (typeof window !== "undefined") {
            return document.cookie.split(";").some((c) => c.trim().startsWith("auth_status=1"));
        }
        return false;
    });
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/me", { credentials: "include" })
            .then((res) => {
                if (res.ok) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            })
            .catch(() => { /* Silent failure */ })
            .finally(() => setIsAuthLoading(false));
    }, []);

    if (!post) {
        notFound();
    }

    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />

            <Navbar isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />

            <article className="container" style={{ padding: "calc(var(--header-height) + 40px) 1.5rem 120px", maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--accent)", marginBottom: "3rem", textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Feed
                </Link>

                <div style={{ marginBottom: "4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <span style={{
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--accent)"
                        }}>
                            {post.category}
                        </span>
                        <div style={{ width: "4px", height: "4px", background: "var(--card-border)", borderRadius: "50%" }} />
                        <span style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                            {post.date}
                        </span>
                        <div style={{ width: "4px", height: "4px", background: "var(--card-border)", borderRadius: "50%" }} />
                        <span style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                            {post.readTime}
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(2.5rem, 8vw, 4rem)",
                        fontWeight: 700,
                        lineHeight: "1.1",
                        marginBottom: "2rem",
                        color: "var(--foreground)",
                        letterSpacing: "-0.04em"
                    }}>
                        {post.title}
                    </h1>

                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {post.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: "var(--card-border)",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "4px",
                                color: "var(--foreground-muted)"
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="blog-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ ...props }) => <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "2rem", color: "var(--foreground)" }} {...props} />,
                            h2: ({ ...props }) => <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1.5rem", marginTop: "3rem", color: "var(--foreground)" }} {...props} />,
                            h3: ({ ...props }) => <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "1rem", color: "var(--foreground)" }} {...props} />,
                            h4: ({ ...props }) => <h4 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "1rem", color: "var(--foreground)" }} {...props} />,
                            p: ({ ...props }) => <p style={{ marginBottom: "1.5rem", lineHeight: "1.8", color: "var(--foreground-muted)", fontSize: "1.125rem" }} {...props} />,
                            ul: ({ ...props }) => <ul style={{ marginBottom: "2rem", listStyle: "disc", paddingLeft: "1.5rem", color: "var(--foreground-muted)" }} {...props} />,
                            ol: ({ ...props }) => <ol style={{ marginBottom: "2rem", listStyle: "decimal", paddingLeft: "1.5rem", color: "var(--foreground-muted)" }} {...props} />,
                            li: ({ ...props }) => <li style={{ marginBottom: "0.75rem", fontSize: "1.125rem" }} {...props} />,
                            strong: ({ ...props }) => <strong style={{ color: "var(--foreground)", fontWeight: 700 }} {...props} />,
                            em: ({ ...props }) => <em style={{ fontStyle: "italic", color: "var(--foreground-muted)" }} {...props} />,
                            a: ({ ...props }) => <a style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: "4px" }} {...props} />,
                            blockquote: ({ ...props }) => <blockquote style={{ borderLeft: "4px solid var(--accent)", paddingLeft: "1.5rem", fontStyle: "italic", marginLeft: 0, marginBottom: "2rem", color: "var(--foreground-subtle)" }} {...props} />,
                            code: ({ ...props }) => <code style={{ background: "var(--card-border)", padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.9em", fontFamily: "monospace", color: "var(--foreground)" }} {...props} />,
                            pre: ({ ...props }) => <pre style={{ background: "var(--card-border)", padding: "1rem", borderRadius: "8px", overflowX: "auto", marginBottom: "2rem" }} {...props} />,
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <div className="divider" style={{ margin: "5rem 0" }} />

                <div style={{
                    padding: "4rem",
                    textAlign: "center",
                    background: "var(--accent-soft)",
                    borderRadius: "24px",
                    border: "1px solid var(--card-border)"
                }}>
                    <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>Secure your connection today.</h2>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem" }}>Experience the protocols mentioned above in one simple interface.</p>
                    <Link href="/auth/register" className="btn btn-primary" style={{ padding: "1rem 2.5rem" }}>
                        Join Oculve
                    </Link>
                </div>
            </article>

            <Footer />

            <style jsx>{`
                .blog-content {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
            `}</style>
        </div>
    );
}
