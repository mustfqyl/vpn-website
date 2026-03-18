"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

import Navbar from "@/app/components/Navbar";

export default function LoginPage() {
    const router = useRouter();
    const [authCode, setAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            <div className="bg-glow" />

            <Navbar hideLinks />

            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                paddingTop: "var(--header-height)"
            }}>
                <div style={{ width: "100%", maxWidth: "440px" }} className="animate-fadeUp">
                    <div className="card" style={{ padding: "3rem 2.5rem" }}>
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                                Welcome Back
                            </h1>
                            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9375rem" }}>
                                Enter your access code to access your secure network infrastructure.
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                padding: "1rem",
                                borderRadius: "10px",
                                background: "rgba(239, 68, 68, 0.05)",
                                border: "1px solid var(--error)",
                                color: "var(--error)",
                                fontSize: "0.875rem",
                                marginBottom: "2rem",
                                textAlign: "center"
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "0.8125rem",
                                    fontWeight: 700,
                                    marginBottom: "0.6rem",
                                    color: "var(--foreground-subtle)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    Access Code
                                </label>
                                <input
                                    type="text"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value.toUpperCase().slice(0, 14))}
                                    className="input"
                                    placeholder="XXXX-XXXX-XXXX"
                                    required
                                    maxLength={14}
                                    style={{ textAlign: "center", letterSpacing: "0.1em", fontWeight: 700 }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: "100%", padding: "1rem" }}
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </button>
                        </form>
                    </div>

                    <p style={{
                        textAlign: "center",
                        marginTop: "2.5rem",
                        fontSize: "0.875rem",
                        color: "var(--foreground-muted)"
                    }}>
                        By continuing, you adhere to our <Link href="/terms" style={{ color: "var(--foreground)" }}>Standard Terms</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
