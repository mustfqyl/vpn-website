"use client";

import { useState, useEffect } from "react";
import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from "lucide-react";

interface UsageTrendProps {
    className?: string;
}

interface DataPoint {
    date: string;
    used_bytes: number;
    formattedGB: number;
    displayDate: string;
    fullDate: string;
}

export const UsageTrendChart = ({ className }: UsageTrendProps) => {
    const [data, setData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [totalGB, setTotalGB] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;

        const fetchTrend = async () => {
            try {
                const res = await fetch("/api/user/usage-trend", { 
                    cache: "no-store", 
                    headers: { 'Cache-Control': 'no-cache' } 
                });
                
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.usages && Array.isArray(json.usages)) {
                        
                        let calculatedTotal = 0;

                        // Format the data for recharts
                        const formattedData = json.usages.map((point: any) => {
                            const dateObj = new Date(point.timestamp || point.date);
                            const gb = (point.used_bytes || 0) / (1024 * 1024 * 1024);
                            calculatedTotal += gb;
                            
                            // Short format day name (e.g. "Mon", "Tue")
                            const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            
                            // Full format for tooltip (e.g. "Mon, Oct 24")
                            const fullDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                            return {
                                ...point,
                                displayDate,
                                fullDate,
                                formattedGB: Math.round(gb * 100) / 100 // keep 2 decimal places
                            };
                        });
                        
                        if (isMounted) {
                            setData(formattedData);
                            setTotalGB(Math.round(calculatedTotal * 100) / 100);
                            setLoading(false);
                        }
                    }
                } else {
                     if (isMounted) setError(true);
                }
            } catch {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            } finally {
               if (isMounted) setLoading(false);
            }
        };

        fetchTrend();

        return () => {
             isMounted = false;
        };
    }, []);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{
                    background: "var(--background-glass)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--card-border)",
                    padding: "0.875rem 1rem",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-lg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {dataPoint.fullDate}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                        <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>
                            {payload[0].value}
                        </p>
                        <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 500 }}>GB Used</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`card ${className || ''}`} style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "32px" }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "var(--accent-soft)", display: "grid", placeItems: "center",
                        color: "var(--accent)"
                    }}>
                        <Activity size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 style={{ 
                            fontSize: "0.9rem", 
                            color: "var(--foreground)", 
                            fontWeight: 700, 
                            margin: 0, 
                            lineHeight: "1.2",
                            fontFamily: "'Outfit', sans-serif"
                        }}>Data Usage Trend</h3>
                        {!loading && !error && data.length > 0 && (
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--foreground-muted)", marginTop: "2px" }}>
                                {totalGB} GB · Last 7 Days
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: "220px", width: "100%", position: "relative", marginLeft: "-15px", marginBottom: "-10px" }}>
                {loading ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", paddingLeft: "15px", paddingBottom: "10px", gap: "4%" }}>
                        {/* Skeletal Loading Animation */}
                        {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                            <div key={i} className="animate-pulse" style={{
                                width: "10%",
                                height: `${height}%`,
                                background: "var(--accent)",
                                opacity: 0.1,
                                borderRadius: "4px 4px 0 0"
                            }} />
                        ))}
                    </div>
                ) : error || data.length === 0 ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)", fontSize: "0.8125rem" }}>
                        Trend data unavailable
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 10, left: -5, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsageArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                                </linearGradient>
                            </defs>
                            
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                vertical={false} 
                                stroke="var(--card-border)" 
                                strokeOpacity={0.5} 
                            />
                            
                            <XAxis 
                                dataKey="displayDate" 
                                stroke="var(--card-border)" 
                                tick={{ fill: 'var(--foreground-muted)', fontSize: 10, fontWeight: 500 }} 
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="transparent" 
                                tick={{ fill: 'var(--foreground-muted)', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                dx={-5}
                                tickFormatter={(value) => `${value}`}
                            />
                            
                            <Tooltip 
                                content={<CustomTooltip />} 
                                cursor={{ fill: 'var(--accent)', opacity: 0.05 }} 
                            />
                            
                            <Bar 
                                dataKey="formattedGB" 
                                fill="var(--accent)" 
                                fillOpacity={0.15}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                                isAnimationActive={true}
                            />

                            <Area 
                                type="monotone" 
                                dataKey="formattedGB" 
                                stroke="var(--accent)" 
                                strokeWidth={3}
                                strokeLinecap="round"
                                fill="url(#colorUsageArea)" 
                                fillOpacity={1}
                                isAnimationActive={true}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--background)", stroke: "var(--accent)" }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
            
            {/* Background Glow specific to this card */}
            <div style={{
                position: "absolute",
                bottom: "-20%",
                right: "-10%",
                width: "60%",
                height: "60%",
                background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                opacity: 0.05,
                zIndex: 0,
                pointerEvents: "none"
            }} />
        </div>
    );
};
