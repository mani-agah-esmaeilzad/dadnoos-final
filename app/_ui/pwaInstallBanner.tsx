'use client'

import { useEffect, useState } from "react";
import { useIsMobile } from "@/app/_lib/hooks/use-mobile";

export default function PwaInstallBanner() {
  const isMobile = useIsMobile();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isMobile) {
      const dismissed = localStorage.getItem("pwaBannerDismissed");
      if (!dismissed) setShowBanner(true);
    }
  }, [isMobile]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwaBannerDismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="relative mt-20 bg-white dark:bg-neutral-800 text-black dark:text-white px-4 py-3 rounded-2xl shadow-lg max-w-md w-[90%] text-center">
        <p>برای تجربه بهتر، برنامه را روی گوشی خود نصب کنید</p>
        <button
          onClick={handleDismiss}
          className="mt-2 px-4 py-2 bg-[#C8A276] dark:bg-[#8a844f] text-white rounded-lg"
        >
          بستن
        </button>
      </div>
    </div>
  );
}
