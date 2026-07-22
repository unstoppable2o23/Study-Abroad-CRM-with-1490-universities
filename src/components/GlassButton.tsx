"use client";

import { Button, type ButtonProps } from "@mui/material";
import { useThemeMode } from "@/lib/theme-context";

type GlassButtonProps = ButtonProps & {
  href?: string;
};

export default function GlassButton({ children, sx, ...props }: GlassButtonProps) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Button
      {...props}
      className="glass-btn"
      sx={{
        position: "relative",
        px: 3,
        py: 1.2,
        borderRadius: "999px",
        border: "none",
        background: isDark
          ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
          : "linear-gradient(135deg, rgba(102,126,234,0.12), rgba(255,255,255,0.4))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: isDark ? "#fff" : "#1a1a2e",
        fontWeight: 700,
        fontSize: "0.95rem",
        overflow: "hidden",
        transition: "transform 0.3s cubic-bezier(0.25,1,0.5,1), box-shadow 0.3s ease",
        transform: "translateY(0)",
        cursor: "pointer",
        zIndex: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "1.5px",
          background: `conic-gradient(from var(--glass-angle, -75deg) at 50% 50%,
            transparent 0deg,
            ${isDark ? "rgba(102,126,234,0.6)" : "rgba(102,126,234,0.5)"} 90deg,
            transparent 180deg,
            ${isDark ? "rgba(240,147,251,0.4)" : "rgba(240,147,251,0.3)"} 270deg,
            transparent 360deg
          )`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 2,
          animation: "glass-rotate 4s linear infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            ${isDark ? "rgba(255,255,255,0.15)" : "rgba(102,126,234,0.1)"} 0%,
            transparent 60%
          )`,
          pointerEvents: "none",
          zIndex: 1,
        },
        "&:hover": {
          transform: "translateY(-2px) scale(1.03)",
          boxShadow: isDark
            ? "0 8px 32px rgba(102,126,234,0.25)"
            : "0 8px 32px rgba(102,126,234,0.15)",
          "--glass-angle": "-125deg",
        },
        "&:active": {
          transform: "translateY(0) scale(0.97)",
        },
        ...sx,
      } as any}
      onMouseMove={(e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-y", `${y}%`);
      }}
    >
      <span style={{ position: "relative", zIndex: 3 }}>{children}</span>
    </Button>
  );
}
