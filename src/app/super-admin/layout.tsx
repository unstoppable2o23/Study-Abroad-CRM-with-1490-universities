"use client";

import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Button, Divider, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeMode } from "@/lib/theme-context";
import { useState } from "react";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Dashboard", path: "/super-admin", icon: <DashboardIcon /> },
  { label: "Organizations", path: "/super-admin/organizations", icon: <BusinessIcon /> },
  { label: "Admins", path: "/super-admin/admins", icon: <AdminPanelSettingsIcon /> },
  { label: "Students", path: "/super-admin/students", icon: <PeopleIcon /> },
  { label: "Careers", path: "/super-admin/careers", icon: <WorkIcon /> },
  { label: "Courses", path: "/super-admin/courses", icon: <SchoolIcon /> },
  { label: "Universities", path: "/super-admin/universities", icon: <SchoolIcon /> },
  { label: "Countries", path: "/super-admin/countries", icon: <PublicIcon /> },
  { label: "Audit Log", path: "/super-admin/audit", icon: <DescriptionIcon /> },
  { label: "Settings", path: "/super-admin/settings", icon: <SettingsIcon /> },
  { label: "Entrance Exams", path: "/super-admin/exam-types", icon: <AssignmentIcon /> },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const isActive = (href: string) => pathname === href || (href !== "/super-admin" && pathname.startsWith(href));

  const drawerContent = (dark: boolean) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: dark ? "#0a0a1a" : "#fff" }}>
      <Box sx={{ p: 2.5, textAlign: "center", borderBottom: "1px solid", borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <SchoolIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? "#fff" : "#1a1a2e" }}>Super Admin</Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1, px: { xs: 0.5, md: 1 }, py: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { router.push(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: 2, mb: 0.25, transition: "all 0.2s",
                bgcolor: active ? (dark ? "rgba(102,126,234,0.1)" : "rgba(102,126,234,0.08)") : "transparent",
                "&:hover": { bgcolor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
                "& .MuiListItemIcon-root": { color: active ? "#667eea" : (dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)") },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { color: active ? (dark ? "#fff" : "#1a1a2e") : (dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"), fontWeight: active ? 700 : 500, fontSize: "0.9rem" } } }} />
              {active && <Box sx={{ width: 4, height: 24, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", ml: 1 }} />}
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
      <List sx={{ px: { xs: 0.5, md: 1 }, py: 1 }}>
        <ListItemButton
          onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login")); }}
          sx={{ borderRadius: 2, "&:hover": { bgcolor: dark ? "rgba(244,67,54,0.08)" : "rgba(244,67,54,0.04)" } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontSize: "0.9rem", color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" } } }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "transparent", backdropFilter: "blur(12px)", borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1, display: { md: "none" }, color: "text.secondary" }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>Super Admin Portal</Typography>
          <ThemeToggle />
          <Button onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login")); }} sx={{ ml: 1, color: "text.secondary", "&:hover": { color: "primary.main" } }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "background.default", borderRight: "1px solid", borderColor: "divider" },
        }}
      >
        <Toolbar />
        {drawerContent(isDark)}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Toolbar />
        <Box sx={{ position: "fixed", top: "10vh", right: "-5vw", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(102,126,234,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
