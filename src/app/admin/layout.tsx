"use client";

import { useState, useEffect } from "react";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton, Button, useMediaQuery, useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon, People as PeopleIcon, SupportAgent as CounselorIcon,
  VerifiedUser as VerifierIcon, Assignment as TestIcon, School as UniversityIcon,
  Work as CareerIcon, Analytics as AnalyticsIcon, Assessment as ReportIcon, Assignment as AssignmentIcon,
  Menu as MenuIcon, Logout as LogoutIcon, School as SchoolLogo,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeMode } from "@/lib/theme-context";
import { useBranding } from "@/lib/branding-context";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { label: "Students", href: "/admin/students", icon: <PeopleIcon /> },
  { label: "Counselors", href: "/admin/counselors", icon: <CounselorIcon /> },
  { label: "Document Verifiers", href: "/admin/document-verifiers", icon: <VerifierIcon /> },
  { label: "Tests", href: "/admin/tests", icon: <TestIcon /> },
  { label: "Universities", href: "/admin/universities", icon: <UniversityIcon /> },
  { label: "Careers", href: "/admin/careers", icon: <CareerIcon /> },
  { label: "Analytics", href: "/admin/analytics", icon: <AnalyticsIcon /> },
  { label: "Reports", href: "/admin/reports", icon: <ReportIcon /> },
  { label: "Entrance Exams", href: "/admin/exam-types", icon: <AssignmentIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const branding = useBranding();
  const accentColor = branding.brandColor || "#667eea";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.success) setAdminName(d.data.fullName || d.data.email);
    });
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const drawerContent = (dark: boolean) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: dark ? "#0a0a1a" : "#fff" }}>
      <Box sx={{ p: 2.5, textAlign: "center", borderBottom: "1px solid", borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
          {branding.logo ? (
            <Box component="img" src={branding.logo} alt={branding.orgName} sx={{ width: 32, height: 32, borderRadius: 1.5, objectFit: "contain" }} />
          ) : (
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: `linear-gradient(135deg, ${accentColor}, #764ba2)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <SchoolLogo fontSize="small" />
            </Box>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? "#fff" : "#1a1a2e" }}>{branding.orgName}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>{adminName || ""}</Typography>
      </Box>
      <List sx={{ flex: 1, px: { xs: 0.5, md: 1 }, py: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={active}
                onClick={() => { router.push(item.href); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2, mx: 0.5, my: 0.25, transition: "all 0.2s",
                  bgcolor: active ? (dark ? "rgba(102,126,234,0.1)" : "rgba(102,126,234,0.08)") : "transparent",
                  "&:hover": { bgcolor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
                  "& .MuiListItemIcon-root": { color: active ? "#667eea" : (dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)") },
                  "& .MuiListItemText-primary": { color: active ? (dark ? "#fff" : "#1a1a2e") : (dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"), fontWeight: active ? 700 : 500, fontSize: "0.9rem" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {active && <Box sx={{ width: 4, height: 24, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", ml: 1 }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
      <List sx={{ px: { xs: 0.5, md: 1 }, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login")); }}
            sx={{ borderRadius: 2, "&:hover": { bgcolor: dark ? "rgba(244,67,54,0.08)" : "rgba(244,67,54,0.04)" } }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontSize: "0.9rem", color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" } } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, bgcolor: "transparent", backdropFilter: "blur(12px)", borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1, display: { md: "none" }, color: isDark ? "text.secondary" : "text.primary" }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: isDark ? "#fff" : "#1a1a2e" }}>Admin Portal</Typography>
          <ThemeToggle />
          <Button onClick={() => router.push("/dashboard")} sx={{ ml: 1, color: "text.secondary", "&:hover": { color: "primary.main" } }}>Student View</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box", width: DRAWER_WIDTH,
              bgcolor: "background.default", borderRight: "1px solid", borderColor: "divider",
            },
          }}
        >
          {isMobile ? drawerContent(isDark) : <><Toolbar />{drawerContent(isDark)}</>}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8, minWidth: 0 }}>
        <Box sx={{ position: "fixed", top: "10vh", right: "-5vw", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(102,126,234,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
