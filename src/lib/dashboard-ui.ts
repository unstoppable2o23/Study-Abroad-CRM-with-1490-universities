import type { Theme } from "@mui/material";

export const accent = "#667eea";
export const accentDark = "#764ba2";
export const accentGradient = `linear-gradient(135deg, ${accent}, ${accentDark})`;

export const glassBg: Record<string, any> = { bgcolor: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" };

export const glassBorder = "1px solid rgba(255,255,255,0.75)";

export const cardSx: Record<string, any> = {
  borderRadius: 3,
  border: glassBorder,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
  transition: "all 0.25s ease",
  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
};

export const gradientIcon = (color: string = accent): Record<string, any> => ({
  width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
  background: color === accent ? accentGradient : `linear-gradient(135deg, ${color}, ${color}dd)`,
  color: "#fff", flexShrink: 0,
});

export const sectionHeaderSx: Record<string, any> = {
  display: "flex", alignItems: "center", gap: 1.5, mb: 2.5,
};

export const sectionTitleSx: Record<string, any> = {
  fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.3px",
};

export const kpiValueSx: Record<string, any> = {
  fontWeight: 900, fontSize: "2rem", letterSpacing: "-1px", lineHeight: 1.1, color: "#1a1a2e",
};

export const kpiLabelSx: Record<string, any> = {
  fontWeight: 600, color: "text.secondary", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.6px",
};

export const chipStatusSx = (color: string): Record<string, any> => ({
  fontWeight: 700, fontSize: "0.72rem", bgcolor: `${color}12`, color, height: 24,
});

export const tableRowHoverSx = (color: string = accent): Record<string, any> => ({
  transition: "background 0.15s",
  "&:hover": { bgcolor: `${color}06`, cursor: "pointer" },
  "&:last-child td, &:last-child th": { border: 0 },
});

export const tableHeadSx: Record<string, any> = {
  fontWeight: 700, color: "text.secondary", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px",
  borderBottom: "2px solid", borderColor: "divider", py: 1.5,
};

export const pageContainerSx: Record<string, any> = { py: 4 };

export const fadeInSx: Record<string, any> = {
  animation: "dashFadeIn 0.35s ease forwards",
};

export const staggerFadeIn = (index: number): Record<string, any> => ({
  animation: "dashStaggerIn 0.4s ease forwards",
  animationDelay: `${index * 0.05}s`,
  opacity: 0,
});
