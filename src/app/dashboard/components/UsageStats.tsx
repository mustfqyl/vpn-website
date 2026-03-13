"use client";

interface UsageStatsProps {
    user: {
        status: string;
        plan: string;
        role: string;
        expiresAt: string | null;
        usage: {
            usedGB: number;
            limitGB: number | null;
        };
    };
    daysRemaining: number;
}

export const UsageStats = ({ user, daysRemaining }: UsageStatsProps) => {
    const usagePercent = user.usage.limitGB ? Math.min(100, (user.usage.usedGB / user.usage.limitGB) * 100) : 0;
    const isUnlimited = user.usage.limitGB === null;

    return (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div className="grid-mobile-1" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem"
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span className="status-dot" style={{
                            background: user.status === "active" ? "var(--success)" :
                                user.status === "limited" ? "var(--warning)" :
                                    "var(--error)",
                            width: "6px", height: "6px"
                        }} />
                        <span style={{ fontSize: "1rem", fontWeight: 600, textTransform: "capitalize" }}>
                            {user.status === "active" ? "Active" :
                                user.status === "limited" ? "Data Limit Reached" :
                                    user.status === "expired" ? "Subscription Expired" :
                                        user.status === "disabled" ? "Disabled by Admin" : "Payment Required"}
                        </span>
                    </div>
                    <p style={{ fontSize: "0.8125rem" }}>
                        {user.status === "active" || user.status === "limited"
                            ? `${user.plan} • ${user.expiresAt ? (daysRemaining > 0 ? `Node access valid for ${daysRemaining} days` : "Subscription Expired") : "Unlimited Access"}`
                            : user.status === "disabled"
                                ? "Your account has been disabled by an administrator. Please contact support."
                                : "Extend your subscription to restore access"
                        }
                    </p>
                </div>

                {user.role === 'TRIAL' && (
                    <a
                        href="/billing"
                        className="btn btn-premium"
                        style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.8125rem",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        Upgrade to Premium
                    </a>
                )}

                {user.role !== 'TRIAL' && user.status !== "active" && user.status !== "limited" && user.status !== "disabled" && (
                    <a
                        href="/billing"
                        className="btn btn-primary"
                        style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.8125rem",
                            textDecoration: "none",
                            display: "inline-block"
                        }}
                    >
                        Extend Subscription
                    </a>
                )}
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--card-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--foreground-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Data Throughput</span>
                    <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        {user.usage.usedGB.toFixed(2)} GB {isUnlimited ? 'Transferred' : `/ ${user.usage.limitGB?.toFixed(2)} GB`}
                    </span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "var(--accent-soft)", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{
                        width: `${isUnlimited ? 100 : usagePercent}%`,
                        height: "100%",
                        background: isUnlimited ? "var(--success)" : usagePercent > 90 ? "var(--error)" : "var(--foreground)",
                        borderRadius: "10px",
                        transition: "width 1s ease-in-out"
                    }}></div>
                </div>
            </div>
        </div>
    );
};
