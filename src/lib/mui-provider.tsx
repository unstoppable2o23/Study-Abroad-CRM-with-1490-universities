"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useThemeMode } from "./theme-context";
import { getTheme } from "./theme";

export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useThemeMode();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const theme = getTheme(hydrated ? mode : "dark");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
