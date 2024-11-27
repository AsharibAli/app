"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BannerContextType {
  isVisible: boolean;
  showBanner: () => void;
  hideBanner: () => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const BANNER_STORAGE_KEY = "bannerLastShown";
  const SHOW_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkBannerVisibility = () => {
      const lastShown = localStorage.getItem(BANNER_STORAGE_KEY);
      const currentTime = Date.now();

      if (!lastShown || currentTime - parseInt(lastShown) > SHOW_INTERVAL) {
        setIsVisible(true);
        localStorage.setItem(BANNER_STORAGE_KEY, currentTime.toString());
      }
    };

    // Check visibility after a short delay to ensure proper hydration
    const timer = setTimeout(checkBannerVisibility, 100);
    return () => clearTimeout(timer);
  }, []);

  const showBanner = () => {
    setIsVisible(true);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  const hideBanner = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  return (
    <BannerContext.Provider value={{ isVisible, showBanner, hideBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error("useBanner must be used within a BannerProvider");
  }
  return context;
}
