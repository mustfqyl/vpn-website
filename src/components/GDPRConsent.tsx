"use client";

import { useState, useEffect } from "react";

export function GDPRConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gdpr-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gdpr-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-2xl border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          Bu web sitesi, deneyiminizi geliştirmek ve VPN hizmetlerimizi sunmak için çerezler ve temel verilerinizi (kullanıcı adı, kullanım verileri) işlemektedir. Devam ederek KVKK/GDPR uyumlu veri işleme politikamızı kabul etmiş olursunuz.
        </p>
        <div className="flex gap-4 shrink-0">
          <button
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}
