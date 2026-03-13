"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";


export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('loading');

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email'),
            type: formData.get('type'),
            message: formData.get('message'),
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                setFormStatus('success');
                setFormMessage(result.message || 'Message sent successfully!');
                (e.target as HTMLFormElement).reset();
            } else {
                setFormStatus('error');
                setFormMessage(result.error || 'Failed to send message.');
            }
        } catch (err) {
            setFormStatus('error');
            setFormMessage('A network error occurred.');
        }
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />

            <Navbar />

            {/* Content */}
            <main className="container" style={{ padding: "160px 1.5rem 80px" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "5rem",
                    alignItems: "start"
                }}>
                    {/* Left Side: Information */}
                    <div>
                        <h1 style={{
                            fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
                            fontWeight: 600,
                            lineHeight: "1.1",
                            marginBottom: "1.5rem",
                            letterSpacing: "-0.03em",
                            background: "linear-gradient(to bottom, var(--foreground) 50%, var(--foreground-muted))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            Support & Architecture.
                        </h1>
                        <p style={{
                            color: "var(--foreground-muted)",
                            fontSize: "1.125rem",
                            lineHeight: "1.6",
                            marginBottom: "3rem",
                            maxWidth: "400px"
                        }}>
                            We provide boutique, high-performance network security. If you have questions about your specific configuration or tier, reach out.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                            <div>
                                <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "0.75rem" }}>
                                    Direct Inquiry
                                </h3>
                                <a href={`mailto:${siteConfig.contactEmail}`} style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)" }}>
                                    {siteConfig.contactEmail}
                                </a>
                            </div>

                            <div>
                                <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "0.75rem" }}>
                                    Secure Discord
                                </h3>
                                <Link href="#" className="link-subtle" style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                                    Join Global Discord
                                </Link>
                            </div>
                        </div>

                        <div className="divider" style={{ margin: "4rem 0" }} />

                        <Link href="/" className="link-subtle" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Return to HQ
                        </Link>
                    </div>

                    {/* Right Side: Form */}
                    <div className="card" style={{ padding: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "2rem" }}>Send a Protocol</h2>
                        
                        {formStatus === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--success-soft)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Transmission Success</h3>
                                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9375rem' }}>{formMessage}</p>
                                <button 
                                    onClick={() => setFormStatus('idle')}
                                    className="btn btn-secondary" 
                                    style={{ marginTop: '2rem', width: '100%' }}
                                >
                                    New Communication
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {formStatus === 'error' && (
                                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--error-soft)', color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        {formMessage}
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="input"
                                        placeholder="name@company.com"
                                        required
                                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nature of Inquiry</label>
                                    <select
                                        name="type"
                                        className="input"
                                        required
                                        defaultValue=""
                                        style={{ background: "rgba(255, 255, 255, 0.03)", appearance: "none", cursor: "pointer" }}
                                    >
                                        <option value="" disabled>Select Inquiry Type</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="billing">Billing & Sales</option>
                                        <option value="strategic">Strategic Partnership</option>
                                        <option value="media">Media & Press</option>
                                        <option value="vulnerability">Vulnerability Report</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Detailed Message</label>
                                    <textarea
                                        name="message"
                                        className="input"
                                        placeholder="How can we assist your network security?"
                                        required
                                        rows={5}
                                        style={{ resize: "none", minHeight: "150px", background: "rgba(255, 255, 255, 0.03)" }}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={formStatus === 'loading'}
                                    style={{ height: "3.5rem", fontSize: "1rem", fontWeight: 600 }}
                                >
                                    {formStatus === 'loading' ? 'Transmitting...' : 'Initialize Communication'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
