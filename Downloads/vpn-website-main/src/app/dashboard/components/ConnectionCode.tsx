import { useState } from "react";
import { Key } from "lucide-react";

interface DeviceListProps {
    subscriptionUrl: string | null;
    copySuccess: boolean;
    onCopy: (text: string) => void;
}

export const ConnectionCode = ({ subscriptionUrl, copySuccess, onCopy }: DeviceListProps) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="card" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "visible" }}>
            <div className="grid-mobile-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10, marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "40px" }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "var(--accent-soft)", display: "grid", placeItems: "center",
                        color: "var(--accent)"
                    }}>
                        <Key size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 style={{ 
                            fontSize: "0.9rem", 
                            color: "var(--foreground)", 
                            fontWeight: 700, 
                            margin: 0, 
                            lineHeight: "1.2",
                            fontFamily: "'Outfit', sans-serif"
                        }}>Connection Code</h3>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--foreground-muted)", marginTop: "2px" }}>
                            Your unique subscription key
                        </p>
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <button 
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                            width: "32px", height: "32px", borderRadius: "10px",
                            background: "var(--accent-soft)", display: "grid", placeItems: "center",
                            border: "1px solid var(--card-border)", cursor: "pointer",
                            transition: "all 0.2s ease", color: "var(--foreground-muted)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.color = "var(--foreground)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--card-border)";
                            e.currentTarget.style.color = "var(--foreground-muted)";
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </button>

                    {showInfo && (
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 10px)",
                            right: "0",
                            width: "240px",
                            padding: "1rem",
                            background: "var(--background)",
                            border: "1px solid var(--card-border)",
                            borderRadius: "12px",
                            boxShadow: "var(--shadow-lg)",
                            zIndex: 100,
                            fontSize: "0.75rem",
                            lineHeight: "1.5",
                            color: "var(--foreground-muted)",
                            animation: "fadeInUp 0.3s ease"
                        }}>
                            <div style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>How to use?</div>
                            Copy this code and paste it into your VPN client's connection field to establish a secure tunnel. Each code is unique to your subscription.
                        </div>
                    )}
                </div>
            </div>

            {subscriptionUrl ? (
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1}}>
                    <div 
                        onClick={() => onCopy(subscriptionUrl)}
                        style={{
                            position: "relative",
                            padding: "1rem",
                            background: copySuccess ? "rgba(16, 185, 129, 0.05)" : "var(--background-glass)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "16px",
                            border: `1px solid ${copySuccess ? "var(--success)" : "var(--card-border)"}`,
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: "1.25rem",
                            boxShadow: copySuccess ? "0 10px 30px -10px rgba(16, 185, 129, 0.2)" : "var(--shadow-md)",
                            overflow: "hidden",
                            transform: "translateZ(0)",
                            flex: 1,
                            marginBottom: "1rem"
                        }}
                        onMouseEnter={(e) => {
                            if (!copySuccess) {
                                e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
                                e.currentTarget.style.borderColor = "var(--accent)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!copySuccess) {
                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                e.currentTarget.style.borderColor = "var(--card-border)";
                            }
                        }}
                    >
                        {/* Matrix-like Background Pattern */}
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `radial-gradient(var(--card-border) 1px, transparent 1px)`,
                            backgroundSize: "20px 20px",
                            opacity: 0.1,
                            zIndex: 0,
                            pointerEvents: "none"
                        }} />

                        {/* Shimmer Effect */}
                        {!copySuccess && (
                            <div className="shimmer-effect" style={{
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "50%",
                                height: "100%",
                                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)",
                                transform: "skewX(-25deg)",
                                animation: "shimmer 3s infinite",
                                zIndex: 1,
                                pointerEvents: "none"
                            }} />
                        )}

                        <div style={{
                            position: "relative",
                            zIndex: 2,
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            color: copySuccess ? "var(--success)" : "var(--foreground)",
                            wordBreak: "break-all",
                            lineHeight: "1.6",
                            letterSpacing: "-0.01em",
                            textAlign: "center"
                        }}>
                            {subscriptionUrl}
                        </div>

                        {/* Divider */}
                        <div style={{ width: "100%", height: "1px", background: "var(--card-border)", opacity: 0.5 }} />
                        
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: copySuccess ? "var(--success)" : "var(--foreground-muted)",
                            transition: "color 0.2s ease"
                        }}>
                            {copySuccess ? (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Connection Code Copied</span>
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Tap to copy code</span>
                                </>
                            )}
                        </div>

                        <style jsx>{`
                            @keyframes shimmer {
                                0% { left: -100%; }
                                20% { left: 200%; }
                                100% { left: 200%; }
                            }
                        `}</style>
                    </div>
                </div>
            ) : (
                <div style={{ padding: "2rem 0", color: "var(--foreground-muted)", fontSize: "0.875rem", position: "relative", zIndex: 1 }}>
                    No active connection code found.
                </div>
            )}
        </div>
    );
};
