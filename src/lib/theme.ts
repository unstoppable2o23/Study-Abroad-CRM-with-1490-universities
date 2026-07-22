"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    glass: { bg: string; border: string; hover: string };
  }
  interface PaletteOptions {
    glass?: { bg: string; border: string; hover: string };
  }
}

const common = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, letterSpacing: "-0.3px" },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    caption: { fontWeight: 500, letterSpacing: "0.3px" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 20px",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        },
        contained: {
          boxShadow: "0 4px 14px rgba(102,126,234,0.25)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(102,126,234,0.35)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlined: {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        sizeSmall: {
          padding: "4px 12px",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.75rem",
          transition: "all 0.2s ease",
        },
        filled: {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "2px solid",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "rgba(102,126,234,0.04)",
          },
          "&:last-child .MuiTableCell-body": {
            borderBottom: "none",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          borderBottom: "1px solid",
        },
        head: {
          padding: "10px 16px",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          minHeight: 48,
          padding: "8px 16px",
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            fontWeight: 700,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 24px 20px",
          gap: 8,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          fontWeight: 700,
          padding: "20px 24px 0",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: "rgba(67,233,123,0.08)",
          border: "1px solid rgba(67,233,123,0.2)",
        },
        standardError: {
          backgroundColor: "rgba(244,67,54,0.08)",
          border: "1px solid rgba(244,67,54,0.2)",
        },
        standardWarning: {
          backgroundColor: "rgba(255,152,0,0.08)",
          border: "1px solid rgba(255,152,0,0.2)",
        },
        standardInfo: {
          backgroundColor: "rgba(79,172,254,0.08)",
          border: "1px solid rgba(79,172,254,0.2)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: "0.75rem",
          fontWeight: 500,
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          marginTop: 4,
        },
        list: {
          padding: "4px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 0",
          padding: "8px 16px",
          fontWeight: 500,
          transition: "all 0.15s ease",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            transition: "all 0.2s ease",
            "& fieldset": {
              transition: "border-color 0.2s ease",
            },
            "&:hover fieldset": {
              borderWidth: 2,
            },
            "&.Mui-focused fieldset": {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.15s ease",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          overflow: "hidden",
        },
        bar: {
          borderRadius: 4,
          transition: "transform 0.4s ease",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { transition: "background-color 0.3s ease, color 0.3s ease" },
      },
    },
  } as any,
};

export function getTheme(mode: "dark" | "light") {
  return createTheme({
    ...common,
    palette:
      mode === "dark"
        ? {
            mode: "dark",
            primary: { main: "#667eea" },
            secondary: { main: "#f093fb" },
            background: { default: "#0a0a1a", paper: "#1a1a2e" },
            error: { main: "#f44336" },
            warning: { main: "#ff9800" },
            success: { main: "#43e97b" },
            info: { main: "#4facfe" },
            text: { primary: "#fff", secondary: "rgba(255,255,255,0.55)", disabled: "rgba(255,255,255,0.25)" },
            divider: "rgba(255,255,255,0.08)",
            glass: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", hover: "rgba(255,255,255,0.1)" },
          }
        : {
            mode: "light",
            primary: { main: "#667eea" },
            secondary: { main: "#9c27b0" },
            background: { default: "#f0f2f5", paper: "#fff" },
            error: { main: "#f44336" },
            warning: { main: "#ff9800" },
            success: { main: "#43e97b" },
            info: { main: "#4facfe" },
            text: { primary: "#1a1a2e", secondary: "rgba(0,0,0,0.55)", disabled: "rgba(0,0,0,0.25)" },
            divider: "rgba(0,0,0,0.08)",
            glass: { bg: "#fff", border: "rgba(0,0,0,0.06)", hover: "rgba(0,0,0,0.03)" },
          },
    components: {
      ...common.components,
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#1a1a2e" : "#fff",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "rgba(26,26,46,0.96)" : "#fff",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#1a1a2e" : "#fff",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "rgba(26,26,46,0.96)" : "#fff",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
            backgroundColor: mode === "dark" ? "#0a0a1a" : "#f0f2f5",
          },
        },
      },
    },
  });
}
