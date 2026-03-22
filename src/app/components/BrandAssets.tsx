"use client";

import React, { useId } from "react";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
}

/**
 * OculveLogo — Theme-aware logo using CSS-styled SVG stops.
 * This ensures maximum compatibility and prevents hydration issues.
 */
export const OculveLogo: React.FC<LogoProps> = ({
  className,
  style,
  height = 32
}) => {
  const id = useId().replace(/:/g, "");
  const gradId = `oculve-logo-grad-${id}`;

  return (
    <svg
      className={`oculve-brand-logo ${className || ""}`}
      style={{ height, width: "auto", aspectRatio: "360 / 80", display: "block", ...style }}
      viewBox="0 0 360 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="oculve-logo-stop-1" />
          <stop offset="100%" className="oculve-logo-stop-2" />
        </linearGradient>
      </defs>
      <text
        x="4" y="66"
        fill={`url(#${gradId})`}
        fontFamily="-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif"
        fontWeight="800" fontSize="76"
        letterSpacing="-2"
      >oculve</text>
    </svg>
  );
};

export const OculveIcon: React.FC<LogoProps> = ({
  className,
  style,
  height = 24
}) => {
  const id = useId().replace(/:/g, "");
  const gradId = `oculve-icon-grad-${id}`;

  return (
    <svg
      className={`oculve-brand-icon ${className || ""}`}
      style={{ height, width: height, display: "block", ...style }}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="oculve-logo-stop-1" />
          <stop offset="100%" className="oculve-logo-stop-2" />
        </linearGradient>
      </defs>
      <text
        x="48" y="48" textAnchor="middle" dominantBaseline="central"
        fill={`url(#${gradId})`}
        fontFamily="-apple-system,sans-serif"
        fontWeight="800" fontSize="58"
        letterSpacing="-1"
      >o</text>
    </svg>
  );
};
