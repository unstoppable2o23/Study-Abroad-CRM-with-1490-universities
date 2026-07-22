"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Grid, Paper, Typography, Box, CircularProgress, Link as MuiLink, Collapse, IconButton, LinearProgress, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GroupsIcon from "@mui/icons-material/Groups";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";

interface DashboardData {
  organizations: { total: number; active: number; expired: number; expiring: number };
  users: { total: number; admins: number; counselors: number; students: number };
  education: { countries: number; universities: number; courses: number; careers: number };
  assessments: { total: number; completed: number; pending: number };
  ai: { conversations: number; knowledgeDocuments: number };
}

type SectionId = "org" | "users" | "edu" | "assess" | "ai";

const SECTION_META: Record<SectionId, { gradient: string; glow: string; icon: React.ReactNode; accent: string; label: string; link?: string }> = {
  org: {
    gradient: "linear-gradient(135deg, #667eea, #764ba2)", glow: "rgba(102,126,234,0.3)",
    icon: <BusinessIcon />, accent: "#667eea", label: "Organizations", link: "/super-admin/organizations",
  },
  users: {
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)", glow: "rgba(240,147,251,0.3)",
    icon: <PeopleIcon />, accent: "#f093fb", label: "Users", link: "/super-admin/users",
  },
  edu: {
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)", glow: "rgba(79,172,254,0.3)",
    icon: <SchoolIcon />, accent: "#4facfe", label: "Education Library", link: "/super-admin/countries",
  },
  assess: {
    gradient: "linear-gradient(135deg, #43e97b, #38f9d7)", glow: "rgba(67,233,123,0.3)",
    icon: <AssignmentIcon />, accent: "#43e97b", label: "Psychometric Assessments",
  },
  ai: {
    gradient: "linear-gradient(135deg, #fa709a, #fee140)", glow: "rgba(250,112,154,0.3)",
    icon: <PsychologyIcon />, accent: "#fa709a", label: "AI & Knowledge",
  },
};

const CARD_CONFIG: Record<SectionId, {
  bg: string; border: string; icon: React.ReactNode; textColor: string; label: string;
}[]> = {
  org: [
    { bg: "linear-gradient(135deg, rgba(102,126,234,0.15), rgba(102,126,234,0.05))", border: "#667eea", icon: <BusinessIcon />, textColor: "#667eea", label: "Total Organizations" },
    { bg: "linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))", border: "#4caf50", icon: <BusinessIcon />, textColor: "#4caf50", label: "Active" },
    { bg: "linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,152,0,0.05))", border: "#ff9800", icon: <BusinessIcon />, textColor: "#ff9800", label: "Expiring Soon" },
    { bg: "linear-gradient(135deg, rgba(244,67,54,0.15), rgba(244,67,54,0.05))", border: "#f44336", icon: <BusinessIcon />, textColor: "#f44336", label: "Expired" },
  ],
  users: [
    { bg: "linear-gradient(135deg, rgba(156,39,176,0.15), rgba(156,39,176,0.05))", border: "#9c27b0", icon: <GroupsIcon />, textColor: "#9c27b0", label: "All Users" },
    { bg: "linear-gradient(135deg, rgba(0,150,136,0.15), rgba(0,150,136,0.05))", border: "#009688", icon: <AdminPanelSettingsIcon />, textColor: "#009688", label: "Administrators" },
    { bg: "linear-gradient(135deg, rgba(233,30,99,0.15), rgba(233,30,99,0.05))", border: "#e91e63", icon: <SupportAgentIcon />, textColor: "#e91e63", label: "Counselors" },
    { bg: "linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))", border: "#ffc107", icon: <PersonIcon />, textColor: "#ffc107", label: "Students" },
  ],
  edu: [
    { bg: "linear-gradient(135deg, rgba(33,150,243,0.15), rgba(33,150,243,0.05))", border: "#2196f3", icon: <SchoolIcon />, textColor: "#2196f3", label: "Countries" },
    { bg: "linear-gradient(135deg, rgba(233,30,99,0.15), rgba(233,30,99,0.05))", border: "#e91e63", icon: <SchoolIcon />, textColor: "#e91e63", label: "Universities" },
    { bg: "linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,152,0,0.05))", border: "#ff9800", icon: <SchoolIcon />, textColor: "#ff9800", label: "Courses" },
    { bg: "linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))", border: "#4caf50", icon: <SchoolIcon />, textColor: "#4caf50", label: "Careers" },
  ],
  assess: [
    { bg: "linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))", border: "#4caf50", icon: <AssignmentIcon />, textColor: "#4caf50", label: "Total Tests" },
    { bg: "linear-gradient(135deg, rgba(33,150,243,0.15), rgba(33,150,243,0.05))", border: "#2196f3", icon: <AssignmentIcon />, textColor: "#2196f3", label: "Completed" },
    { bg: "linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,152,0,0.05))", border: "#ff9800", icon: <AssignmentIcon />, textColor: "#ff9800", label: "Pending" },
  ],
  ai: [
    { bg: "linear-gradient(135deg, rgba(250,112,154,0.15), rgba(250,112,154,0.05))", border: "#fa709a", icon: <PsychologyIcon />, textColor: "#fa709a", label: "Conversations" },
    { bg: "linear-gradient(135deg, rgba(254,225,64,0.15), rgba(254,225,64,0.05))", border: "#f5af19", icon: <PsychologyIcon />, textColor: "#f5af19", label: "Knowledge Docs" },
  ],
};

function AnimatedCount({ value, label }: { value: number; label?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const steps = 40;
    const step = Math.max(1, Math.floor(value / steps));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(interval); }
      setDisplay(start);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);
  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", lineHeight: 1.1, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
        {display.toLocaleString()}
      </Typography>
      {label && <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</Typography>}
    </Box>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/super-admin/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); });
  }, []);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "#667eea" }} />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)" }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "fixed", top: "-10vh", right: "-5vw", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "pulse-glow 8s ease-in-out infinite" }} />
      <Box sx={{ position: "fixed", bottom: "-10vh", left: "-5vw", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(240,147,251,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "pulse-glow 10s ease-in-out infinite" }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 4 }}>
        <Box sx={{ width: 8, height: 40, borderRadius: 4, background: "linear-gradient(180deg, #667eea, #764ba2, #f093fb)" }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #fff, #667eea, #f093fb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Platform Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.35)" }}>Real-time snapshot of your platform</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {(Object.keys(SECTION_META) as SectionId[]).map((sectionId) => {
          const meta = SECTION_META[sectionId];
          const configs = CARD_CONFIG[sectionId];
          const raw = data[sectionId === "org" ? "organizations" : sectionId === "users" ? "users" : sectionId === "edu" ? "education" : sectionId === "assess" ? "assessments" : "ai"] as Record<string, number>;
          const entries = Object.entries(raw).filter(([k]) => k !== "__typename");
          const total = entries.reduce((a, [, v]) => a + v, 0);

          return (
            <Grid size={{ xs: 12 }} key={sectionId}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { borderColor: "rgba(255,255,255,0.1)" } }}>
                <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", background: meta.gradient, color: "#fff", boxShadow: `0 4px 12px ${meta.glow}` }}>
                      {meta.icon}
                    </Box>
                    <Box>
                      {meta.link ? (
                        <MuiLink component={Link} href={meta.link} underline="none" sx={{ color: "#fff", "&:hover": { opacity: 0.8 } }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem" }}>{meta.label}</Typography>
                        </MuiLink>
                      ) : (
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>{meta.label}</Typography>
                      )}
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>{entries.length} metrics</Typography>
                    </Box>
                  </Box>
                  <Chip label={`${total.toLocaleString()} total`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)" }} />
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    {entries.map(([key, value], idx) => {
                      const cardKey = `${sectionId}-${key}`;
                      const open = !!expanded[cardKey];
                      const cfg = configs[idx] || configs[0];
                      const isHovered = hoveredCard === cardKey;
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cardKey}>
                          <Paper
                            onClick={() => toggle(cardKey)}
                            onMouseEnter={() => setHoveredCard(cardKey)}
                            onMouseLeave={() => setHoveredCard(null)}
                            elevation={0}
                            sx={{
                              p: 2.5, borderRadius: 2.5, cursor: "pointer", position: "relative", overflow: "hidden",
                              background: cfg.bg,
                              border: "1px solid",
                              borderColor: open ? cfg.border : "rgba(255,255,255,0.06)",
                              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                              transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
                              boxShadow: isHovered ? `0 12px 32px ${cfg.border}22` : "none",
                              "&::before": {
                                content: '""',
                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                background: meta.gradient,
                                opacity: open || isHovered ? 1 : 0,
                                transition: "opacity 0.3s",
                              },
                            }}
                          >
                            <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", opacity: 0.08, background: `radial-gradient(circle, ${cfg.textColor}, transparent 70%)` }} />
                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                              <AnimatedCount value={value} label={cfg.label} />
                              <IconButton size="small" sx={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s", bgcolor: "rgba(255,255,255,0.06)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
                                <ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
                              </IconButton>
                            </Box>
                            <Collapse in={open} timeout={300} unmountOnExit>
                              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                {entries.map(([k, v]) => (
                                  <Box key={k} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, px: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.8rem" }}>
                                      {k.replace(/([A-Z])/g, " $1").trim()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", fontSize: "0.8rem" }}>{v.toLocaleString()}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
