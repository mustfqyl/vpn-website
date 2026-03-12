"use client";

import { useTheme } from "@/context/ThemeContext";

export default function BackgroundEffects() {
  const { theme } = useTheme();

  return (
    <>
      <div className="bg-glow" />
      <div className="theme-assets-container">
        {/* Dark Mode Assets */}
        {theme === "dark" && (
          <div className="dark-assets">
            <div className="mesh-grid" />
            <div className="neon-orb neon-1" />
            <div className="neon-orb neon-2" />
            <div className="float-node node-1" />
            <div className="float-node node-2" />
          </div>
        )}

        {/* Light Mode Assets */}
        {theme === "light" && (
          <div className="light-assets">
            <div className="studio-orb studio-1" />
            <div className="studio-orb studio-2" />
            <div className="studio-orb studio-3" />
          </div>
        )}
      </div>
    </>
  );
}
