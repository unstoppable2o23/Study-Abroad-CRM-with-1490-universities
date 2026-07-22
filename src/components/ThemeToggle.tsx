"use client";

import { IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { mode, toggle } = useThemeMode();

  return (
    <IconButton
      onClick={toggle}
      sx={{
        color: mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
        transition: "all 0.3s",
        "&:hover": {
          color: mode === "dark" ? "#667eea" : "#667eea",
          bgcolor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(102,126,234,0.08)",
        },
      }}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
