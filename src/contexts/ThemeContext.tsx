import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface PartnerBranding {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  favicon_url: string | null;
  pdf_cover_logo_url: string | null;
  pdf_footer_text: string | null;
}

interface ThemeContextType {
  partner: PartnerBranding | null;
  isPartnerThemed: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ partner: null, isPartnerThemed: false });

function isValidColor(color: string | null | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3,8})$/.test(color) || /^(rgb|hsl)/.test(color);
}

function hexToHSL(hex: string): string | null {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return null;
  }
}

function applyThemeTokens(partner: PartnerBranding | null) {
  const root = document.documentElement;

  if (!partner) {
    // Remove partner overrides
    root.style.removeProperty("--partner-primary");
    root.style.removeProperty("--partner-secondary");
    root.style.removeProperty("--partner-accent");
    root.classList.remove("partner-themed");
    return;
  }

  if (isValidColor(partner.primary_color)) {
    const hsl = hexToHSL(partner.primary_color!);
    if (hsl) root.style.setProperty("--partner-primary", hsl);
  }
  if (isValidColor(partner.secondary_color)) {
    const hsl = hexToHSL(partner.secondary_color!);
    if (hsl) root.style.setProperty("--partner-secondary", hsl);
  }
  if (isValidColor(partner.accent_color)) {
    const hsl = hexToHSL(partner.accent_color!);
    if (hsl) root.style.setProperty("--partner-accent", hsl);
  }

  root.classList.add("partner-themed");
}

function applyFavicon(url: string | null) {
  const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (!url) {
    if (existing) existing.href = "/favicon.ico";
    return;
  }
  if (existing) {
    existing.href = url;
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = url;
    document.head.appendChild(link);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  // Fetch org's partner_id
  const { data: orgPartner } = useQuery({
    queryKey: ["org-partner-id", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("partner_id")
        .eq("id", orgId!)
        .single();
      return data?.partner_id ?? null;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch partner branding
  const { data: partner = null } = useQuery({
    queryKey: ["partner-branding", orgPartner],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("id, name, brand_name, logo_url, primary_color, secondary_color, accent_color, favicon_url, pdf_cover_logo_url, pdf_footer_text")
        .eq("id", orgPartner!)
        .single();
      return (data as PartnerBranding) ?? null;
    },
    enabled: !!orgPartner,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    applyThemeTokens(partner);
    applyFavicon(partner?.favicon_url ?? null);
    return () => {
      applyThemeTokens(null);
      applyFavicon(null);
    };
  }, [partner]);

  return (
    <ThemeContext.Provider value={{ partner, isPartnerThemed: !!partner }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
