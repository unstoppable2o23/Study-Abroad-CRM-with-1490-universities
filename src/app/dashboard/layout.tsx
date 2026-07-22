"use client";

import { useState, useMemo } from "react";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton, useMediaQuery, useTheme, Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon, Person as PersonIcon, School as UniversityIcon,
  Assignment as TestIcon, Description as DocumentIcon, Work as CareerIcon,
  Menu as MenuIcon, Logout as LogoutIcon, School as SchoolLogo,
  Psychology as PsychologyIcon, Search as SearchIcon, Computer as TechIcon,
  Book as CourseIcon, Business as AppIcon, ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeMode } from "@/lib/theme-context";
import { useBranding } from "@/lib/branding-context";
import { useStudentFeatures } from "@/lib/use-features";
import { accent, accentDark, accentGradient, glassBg, glassBorder } from "@/lib/dashboard-ui";

const DRAWER_WIDTH = 260;
const MINI_DRAWER_WIDTH = 72;

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, feature: null },
  { label: "Profile", href: "/dashboard/profile", icon: <PersonIcon />, feature: null },
  { label: "Universities", href: "/dashboard/universities", icon: <UniversityIcon />, feature: "universities" },
  { label: "Courses", href: "/dashboard/courses", icon: <CourseIcon />, feature: "courses" },
  { label: "Tests", href: "/dashboard/tests", icon: <PsychologyIcon />, feature: "psychometric-tests" },
  { label: "Entrance Exams", href: "/dashboard/exam-types", icon: <TestIcon />, feature: "exam-types" },
  { label: "Documents", href: "/dashboard/documents", icon: <DocumentIcon />, feature: "documents" },
  { label: "Applications", href: "/dashboard/applications", icon: <AppIcon />, feature: "applications" },
  { label: "Careers", href: "/dashboard/careers", icon: <CareerIcon />, feature: "careers" },
  { label: "AI Search", href: "/dashboard/ai-search", icon: <SearchIcon />, feature: "ai-search" },
  { label: "Technology", href: "/dashboard/technology", icon: <TechIcon />, feature: "technology" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const enabledFeatures = useStudentFeatures();
  const branding = useBranding();
  const accentColor = branding.brandColor || accent;

  const navItems = useMemo(() => {
    if (!enabledFeatures) return allNavItems;
    return allNavItems.filter(item => !item.feature || enabledFeatures.has(item.feature));
  }, [enabledFeatures]);

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const drawerW = collapsed && !isMobile ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

  const bgt = (alpha: string) => isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;

  const drawerContent = (dark: boolean, mini: boolean) => (
    <Box sx={{
      height: "100%", display: "flex", flexDirection: "column",
      bgcolor: dark ? "#0c0c1e" : "#fff",
      borderRight: "1px solid", borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    }}>
      <Box sx={{
        p: mini ? 1.5 : 2.5, textAlign: "center",
        borderBottom: "1px solid", borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", justifyContent: mini ? "center" : "center", gap: 1,
      }}>
        {branding.logo ? (
          <Box component="img" src={branding.logo} alt={branding.orgName} sx={{ width: mini ? 28 : 34, height: mini ? 28 : 34, borderRadius: 1.5, objectFit: "contain" }} />
        ) : (
          <Box sx={{
            width: mini ? 28 : 34, height: mini ? 28 : 34, borderRadius: 1.5,
            background: `linear-gradient(135deg, ${accentColor}, ${accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            transition: "all 0.3s", flexShrink: 0,
          }}>
            <SchoolLogo sx={{ fontSize: mini ? 16 : 20 }} />
          </Box>
        )}
        {!mini && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, ml: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: dark ? "#fff" : "#1a1a2e", fontSize: "0.95rem" }}>
              {branding.orgName}
            </Typography>
            {!isMobile && (
              <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: bgt("0.35"), "&:hover": { color: accentColor } }}>
                  <ChevronLeftIcon sx={{ fontSize: 18, transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <List sx={{ flex: 1, px: mini ? 0.5 : 1, py: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.25 }}>
              <Tooltip title={mini ? item.label : ""} placement="right" arrow>
                <ListItemButton
                  selected={active}
                  onClick={() => { router.push(item.href); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    borderRadius: 2, mx: 0.5, my: 0.25, transition: "all 0.2s",
                    minHeight: 44, justifyContent: mini ? "center" : "flex-start",
                    px: mini ? 1 : 1.5,
                    bgcolor: active
                      ? (dark ? `rgba(102,126,234,0.12)` : `rgba(102,126,234,0.08)`)
                      : "transparent",
                    "&:hover": {
                      bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: active ? accentColor : bgt("0.35"),
                      minWidth: mini ? 0 : 40,
                      justifyContent: "center",
                      transition: "color 0.2s",
                    },
                    "& .MuiListItemText-primary": {
                      color: active
                        ? (dark ? "#fff" : "#1a1a2e")
                        : bgt("0.55"),
                      fontWeight: active ? 700 : 500,
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {!mini && <ListItemText primary={item.label} />}
                  {active && !mini && (
                    <Box sx={{
                      width: 3, height: 20, borderRadius: 2,
                      background: `linear-gradient(180deg, ${accentColor}, ${accentDark})`,
                      ml: 1, flexShrink: 0,
                    }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
      <List sx={{ px: mini ? 0.5 : 1, py: 1 }}>
        <ListItem disablePadding>
          <Tooltip title={mini ? "Logout" : ""} placement="right" arrow>
            <ListItemButton
              onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login")); }}
              sx={{
                borderRadius: 2, mx: 0.5, minHeight: 44, justifyContent: mini ? "center" : "flex-start",
                transition: "all 0.2s",
                "&:hover": { bgcolor: dark ? "rgba(244,67,54,0.08)" : "rgba(244,67,54,0.04)" },
                "& .MuiListItemIcon-root": { color: bgt("0.35"), minWidth: mini ? 0 : 40, justifyContent: "center" },
                "& .MuiListItemText-primary": { fontSize: "0.875rem", color: bgt("0.55") },
              }}
            >
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              {!mini && <ListItemText primary="Logout" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );

  const showBack = pathname !== "/dashboard";
  const pageTitle = navItems.find((i) => isActive(i.href))?.label || "Dashboard";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: isDark ? "#080816" : "#f6f7fb" }}>
      <AppBar position="fixed" elevation={0} sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        bgcolor: isDark ? "rgba(8,8,22,0.8)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid", borderColor: "divider",
        ml: { md: `${drawerW}px` },
        width: { md: `calc(100% - ${drawerW}px)` },
        transition: "width 0.25s ease, margin 0.25s ease",
      }}>
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 0.5, display: { md: "none" }, color: "text.secondary" }}>
            <MenuIcon />
          </IconButton>
          {showBack && (
            <IconButton onClick={() => router.back()} sx={{ mr: 0.5, color: "text.secondary", "&:hover": { color: "primary.main" } }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5, color: "text.secondary" }}>
              {pageTitle !== "Dashboard" && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 500, "&:hover": { color: "text.primary", cursor: "pointer" } }} onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>/</Typography>
                </>
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{pageTitle}</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", display: { sm: "none" }, flex: 1 }}>
              {pageTitle}
            </Typography>
          </Box>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerW, flexShrink: 0, whiteSpace: "nowrap",
          transition: "width 0.25s ease",
          "& .MuiDrawer-paper": {
            width: drawerW, boxSizing: "border-box",
            bgcolor: isDark ? "#0c0c1e" : "#fff",
            borderRight: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            transition: "width 0.25s ease",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        {drawerContent(isDark, collapsed && !isMobile)}
      </Drawer>

      <Box component="main" sx={{
        flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0,
        transition: "margin-left 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}>
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: isDark
            ? `linear-gradient(135deg, #050510 0%, #0a0a2e 30%, #0f0f3a 60%, #080818 100%)`
            : `linear-gradient(135deg, #0a0a2e 0%, #12124a 30%, #1a1a5e 60%, #0a0a2e 100%)`,
          "&::before": {
            content: '""',
            position: "absolute", inset: 0,
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 30% 5%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1.5px 1.5px at 50% 15%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1px 1px at 70% 8%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 90% 25%, rgba(255,255,255,0.7), transparent),
              radial-gradient(1.5px 1.5px at 15% 40%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 45% 35%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 75% 55%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1.5px 1.5px at 5% 60%, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 35% 70%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 60% 50%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 85% 75%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 20% 85%, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 55% 90%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1.5px 1.5px at 80% 40%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 40% 45%, rgba(200,180,255,0.6), transparent),
              radial-gradient(1px 1px at 65% 80%, rgba(180,200,255,0.5), transparent),
              radial-gradient(1.5px 1.5px at 25% 10%, rgba(180,180,255,0.7), transparent),
              radial-gradient(1px 1px at 95% 60%, rgba(200,200,255,0.4), transparent),
              radial-gradient(1px 1px at 10% 75%, rgba(255,200,200,0.5), transparent)
            `,
            animation: "twinkle 4s ease-in-out infinite alternate",
          },
          "&::after": {
            content: '""',
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 20% 30%, rgba(102,126,234,0.06) 0%, transparent 50%),
                         radial-gradient(ellipse at 80% 70%, rgba(118,75,162,0.05) 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 50%, rgba(120,80,200,0.03) 0%, transparent 60%)`,
          },
        }} />
        <Toolbar />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
