"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Branding {
  logo: string | null;
  brandColor: string | null;
  colors: Record<string, string> | null;
  orgName: string;
}

const defaultBranding: Branding = {
  logo: null,
  brandColor: null,
  colors: null,
  orgName: "Study Abroad CRM",
};

const BrandingContext = createContext<Branding>(defaultBranding);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);

  useEffect(() => {
    fetch("/api/organizations/branding")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setBranding({
            logo: d.data.logo || null,
            brandColor: d.data.brandColor || null,
            colors: d.data.colors || null,
            orgName: d.data.name || "Study Abroad CRM",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
