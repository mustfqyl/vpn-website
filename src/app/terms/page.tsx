"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function TermsPage() {
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
    return (
        <div style={{ minHeight: "100vh" }}>
            <Navbar isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />

            {/* Content */}
            <main style={{ maxWidth: "700px", margin: "0 auto", padding: "calc(var(--header-height) + 40px) 1.5rem 4rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                    Terms of Service
                </h1>
                <p style={{ color: "var(--foreground-muted)", marginBottom: "3rem" }}>
                    Last updated: February 2026
                </p>

                <div style={{ lineHeight: "1.8", color: "var(--foreground-muted)" }}>
                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using SecureVPN, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            2. Service Description
                        </h2>
                        <p>
                            SecureVPN provides virtual private network services that encrypt your internet
                            connection and protect your online privacy. We offer various subscription plans
                            with different features and pricing.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            3. Acceptable Use
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            You agree not to use SecureVPN for:
                        </p>
                        <ul style={{ paddingLeft: "1.5rem" }}>
                            <li>Any illegal activities under applicable law</li>
                            <li>Distribution of malware or harmful software</li>
                            <li>Harassment, abuse, or harm to others</li>
                            <li>Copyright infringement or intellectual property theft</li>
                            <li>Sending spam or unsolicited communications</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            4. Account Responsibility
                        </h2>
                        <p>
                            You are responsible for maintaining the security of your account credentials.
                            You must not share your account with others. Each subscription allows connection
                            from up to 3 devices simultaneously.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            5. Subscription & Billing
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Subscriptions automatically renew unless cancelled before the renewal date.
                            You may cancel your subscription at any time through your account dashboard.
                        </p>
                        <p>
                            Refunds are available within 7 days of initial purchase if you are unsatisfied
                            with the service. Contact support for refund requests.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            6. Service Availability
                        </h2>
                        <p>
                            We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.
                            We reserve the right to perform maintenance and updates as needed. We are not
                            liable for any damages resulting from service interruptions.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            7. Termination
                        </h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these terms.
                            You may terminate your account at any time by contacting support.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            8. Limitation of Liability
                        </h2>
                        <p>
                            SecureVPN is provided &quot;as is&quot; without warranties of any kind. We are not liable
                            for any indirect, incidental, or consequential damages arising from use of our service.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                            9. Contact
                        </h2>
                        <p>
                            For questions about these terms, contact us at{" "}
                            <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: "var(--foreground)" }}>
                                {siteConfig.contactEmail}
                            </a>
                        </p>
                    </section>
                </div>

                <div className="divider" style={{ margin: "3rem 0" }} />

                <Link href="/" className="link-subtle" style={{ fontSize: "0.875rem" }}>
                    ← Back to home
                </Link>
            </main>

            <Footer />
        </div>
    );
}
