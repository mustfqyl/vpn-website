"use client";
import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { X, LogOut, Shield, Download, Copy, Trash2, ExternalLink, Calendar } from "lucide-react";

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
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/me", { method: "DELETE" });
            if (res.ok) {
                window.location.href = "/";
            } else {
                alert("An error occurred while deleting the account.");
                setIsDeleting(false);
                setShowConfirmDelete(false);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the account.");
            setIsDeleting(false);
            setShowConfirmDelete(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "grid", placeItems: "center",
            zIndex: 1000,
            padding: "1rem"
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: "var(--background)",
                border: "1px solid var(--card-border)",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "380px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative"
            }}>
                
                {/* Formal Deletion Popup Overlay */}
                {showConfirmDelete && (
                    <div style={{
                        position: "absolute", inset: 0, zIndex: 100,
                        background: "var(--background)", display: "flex", flexDirection: "column",
                        padding: "1.5rem", animation: "fadeIn 0.2s ease"
                    }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--error)" }}>
                                <Trash2 size={24} />
                                <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>FINAL WARNING</h3>
                            </div>
                            <div style={{ 
                                padding: "1rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.05)",
                                border: "1px solid rgba(239, 68, 68, 0.1)", fontSize: "0.75rem", color: "var(--foreground)",
                                lineHeight: "1.6", fontWeight: 500
                            }}>
                                <p style={{ marginBottom: "0.75rem" }}><strong>THIS ACTION IS IRREVERSIBLE.</strong></p>
                                <p>By proceeding, you acknowledge that all remaining subscription time and node access will be <strong>PERMANENTLY FORFEITED</strong> without any possibility of refund or recovery.</p>
                                <p style={{ marginTop: "0.75rem" }}>SecureVPN assumes no responsibility for data loss or service termination resulting from this action.</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{
                                    width: "100%", padding: "0.85rem", borderRadius: "12px",
                                    background: "var(--error)", color: "white", border: "none",
                                    fontSize: "0.8125rem", fontWeight: 800, cursor: "pointer"
                                }}
                            >
                                {isDeleting ? "TERMINATING..." : "I UNDERSTAND, DELETE MY ACCOUNT"}
                            </button>
                            <button 
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={isDeleting}
                                style={{
                                    width: "100%", padding: "0.85rem", borderRadius: "12px",
                                    background: "var(--background-glass)", color: "var(--foreground)",
                                    border: "1px solid var(--card-border)", fontSize: "0.8125rem", fontWeight: 800,
                                    cursor: "pointer"
                                }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}

                {/* Compact Header */}
                <div style={{
                    padding: "1rem 1.25rem",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid var(--card-border)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Shield size={18} color="var(--accent)" strokeWidth={2.5} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 800 }}>Account</span>
                    </div>
                    <button onClick={onClose} style={{ 
                        background: "none", border: "none", color: "var(--foreground-muted)", 
                        cursor: "pointer", padding: "0.25rem"
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* Compact Status Bar */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.75rem", background: "var(--accent-soft)", 
                        borderRadius: "12px", border: "1px solid var(--card-border)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} />
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "capitalize" }}>{user.status || 'Active'}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--foreground-muted)" }}>
                            <Calendar size={14} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Compact Access Code */}
                    <div style={{
                        padding: "1rem", background: "var(--background-glass)", 
                        borderRadius: "16px", border: "1px solid var(--card-border)",
                        display: "flex", flexDirection: "column", gap: "0.5rem"
                    }}>
                        <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Access Code</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em" }}>{user.authCode}</span>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button onClick={async () => {
                                    const success = await copyToClipboard(user.authCode);
                                    if (success) {
                                        setCopiedSettings(true);
                                        setTimeout(() => setCopiedSettings(false), 1500);
                                    }
                                }} style={{ background: "none", border: "none", color: copiedSettings ? "var(--success)" : "var(--foreground)", cursor: "pointer" }}>
                                    <Copy size={16} />
                                </button>
                                <button onClick={downloadCode} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer" }}>
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <a href="/billing" style={{
                            padding: "0.75rem", borderRadius: "12px", background: "var(--accent)", color: "var(--background)",
                            fontSize: "0.8125rem", fontWeight: 800, textDecoration: "none", textAlign: "center",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                        }}>
                             Extend <ExternalLink size={14} />
                        </a>
                        <button onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/";
                        }} style={{
                            padding: "0.75rem", borderRadius: "12px", background: "var(--background-glass)",
                            border: "1px solid var(--card-border)", color: "var(--foreground)",
                            fontSize: "0.8125rem", fontWeight: 800, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                        }}>
                            Logout <LogOut size={14} />
                        </button>
                    </div>

                    {/* Minimal Danger Zone */}
                    <div style={{
                        marginTop: "0.25rem", padding: "0.75rem", borderRadius: "12px",
                        border: "1px solid rgba(239, 68, 68, 0.1)", background: "rgba(239, 68, 68, 0.02)"
                    }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--error)", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase" }}>Quick Delete Account</div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                            <input
                                type="text"
                                placeholder="'DELETE MY ACCOUNT'"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                style={{ flex: 1, padding: "0.4rem 0.5rem", borderRadius: "6px", border: "1px solid var(--card-border)", background: "var(--background)", color: "var(--error)", fontSize: "0.6875rem" }}
                            />
                            <button onClick={() => setShowConfirmDelete(true)} disabled={deleteConfirmation !== "DELETE MY ACCOUNT" || isDeleting} style={{
                                padding: "0.4rem 0.75rem", borderRadius: "6px", fontSize: "0.6875rem", fontWeight: 800,
                                border: "none", background: deleteConfirmation === "DELETE MY ACCOUNT" ? "var(--error)" : "rgba(239, 68, 68, 0.1)",
                                color: deleteConfirmation === "DELETE MY ACCOUNT" ? "white" : "rgba(239, 68, 68, 0.3)",
                                cursor: "pointer"
                            }}>
                                {isDeleting ? "..." : "Del"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
