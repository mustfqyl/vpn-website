"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface UserData {
    authCode: string;
    createdAt: string;
    status?: string;
    role?: string;
}

interface ProfileSettingsProps {
    user: UserData;
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileSettings = ({ user, isOpen, onClose }: ProfileSettingsProps) => {
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedSettings, setCopiedSettings] = useState(false);

    const downloadCode = () => {
        const element = document.createElement("a");
        const file = new Blob([`SECURE VPN ACCESS CODE\n------------------------\nCode: ${user.authCode}\n\nKEEP THIS FILE SAFE. IT IS YOUR ONLY ACCESS KEY.`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "secure-vpn-access-code.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "DELETE MY ACCOUNT") return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/me", { method: "DELETE" });
            if (res.ok) {
                window.location.href = "/";
            } else {
                alert("An error occurred while deleting the account.");
                setIsDeleting(false);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the account.");
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "grid", placeItems: "center",
            zIndex: 100,
            animation: "fadeIn 0.2s ease",
            padding: "1rem"
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: "var(--background)",
                border: "1px solid var(--card-border)",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "480px",
                maxHeight: "90vh",
                overflowY: "auto",
                animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
                {/* Header */}
                <div style={{
                    position: "sticky", top: 0, background: "var(--background-glass)", backdropFilter: "blur(12px)", zIndex: 10,
                    padding: "0.75rem 1rem", borderBottom: "1px solid var(--card-border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Settings
                    </h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--foreground-muted)", cursor: "pointer", padding: "0.4rem" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: "1rem" }}>
                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        {/* Status Card */}
                        <div style={{
                            padding: "1rem",
                            background: "var(--accent-soft)",
                            borderRadius: "12px",
                            border: "1px solid var(--accent)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem"
                        }}>
                            <div>
                                <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 700 }}>Status</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", textTransform: "capitalize" }}>
                                    {user.status || 'Inactive'}
                                </div>
                            </div>
                            <a href="/billing" style={{
                                width: "100%", padding: "0.6rem",
                                borderRadius: "8px", background: "var(--accent)", color: "var(--background)",
                                fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none", textAlign: "center",
                                transition: "all 0.2s ease"
                            }} className="hover-lift">Extend Duration</a>
                        </div>

                        {/* Info Card */}
                        <div 
                            onClick={async () => {
                                const success = await copyToClipboard(user.authCode);
                                if (success) {
                                    setCopiedSettings(true);
                                    setTimeout(() => setCopiedSettings(false), 800);
                                }
                            }}
                            style={{
                                padding: "1rem",
                                background: copiedSettings ? "var(--success-soft)" : "var(--background)",
                                borderRadius: "12px",
                                border: copiedSettings ? "1px solid var(--success)" : "1px solid var(--card-border)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                transform: copiedSettings ? "scale(0.98)" : "scale(1)",
                                boxShadow: copiedSettings ? "0 4px 12px rgba(34, 197, 94, 0.1)" : "none"
                            }}
                            className="hover-lift"
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: "0.625rem", color: copiedSettings ? "var(--success)" : "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 700, transition: "color 0.2s ease" }}>
                                        {copiedSettings ? "¡COPIED!" : "Access Code"}
                                    </div>
                                    <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: copiedSettings ? "var(--success)" : "var(--accent)", fontFamily: "monospace", marginTop: "0.25rem" }}>
                                        {user.authCode}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadCode();
                                        }}
                                        style={{
                                            background: "rgba(0,0,0,0.05)",
                                            border: "1px solid var(--card-border)",
                                            borderRadius: "6px",
                                            padding: "0.3rem",
                                            cursor: "pointer",
                                            color: "var(--foreground-muted)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s ease"
                                        }}
                                        className="hover-lift"
                                        title="Download as .txt"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    </button>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={copiedSettings ? "var(--success)" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginTop: "0.25rem" }}>
                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                    </svg>
                                </div>
                            </div>
                            <div style={{ height: "1px", background: "var(--card-border)", opacity: 0.5 }} />
                            <div>
                                <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 700 }}>Joined</div>
                                <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div style={{
                        padding: "0.75rem",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        background: "rgba(239, 68, 68, 0.02)",
                        borderRadius: "10px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--error)", fontWeight: 700 }}>Danger Zone</div>
                            <span style={{ fontSize: "0.625rem", opacity: 0.6 }}>Delete Account</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                            <input
                                type="text"
                                placeholder="Type 'DELETE MY ACCOUNT'"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                style={{ flex: 1, padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--card-border)", background: "var(--background)", color: "var(--error)", fontSize: "0.6875rem" }}
                            />
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== "DELETE MY ACCOUNT" || isDeleting}
                                style={{
                                    padding: "0.4rem 0.6rem", borderRadius: "4px", fontSize: "0.6875rem", fontWeight: 700,
                                    border: "none", background: deleteConfirmation === "DELETE MY ACCOUNT" ? "var(--error)" : "transparent",
                                    color: deleteConfirmation === "DELETE MY ACCOUNT" ? "white" : "var(--foreground-muted)",
                                    cursor: "pointer"
                                }}
                            >
                                {isDeleting ? "..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
