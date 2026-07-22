"use client";

import { useEffect, useState, useCallback } from "react";
import { Grid, Paper, Typography, Box, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PublicIcon from "@mui/icons-material/Public";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";
import { useThemeMode } from "@/lib/theme-context";

interface DashboardData {
  students: { total: number; active: number; inactive: number };
  documents: { pending: number };
  assessments: { total: number; pending: number; completed: number };
  applications: { total: number; submitted: number; visa: number };
  popularUniversities: { universityId: string; _count: number }[];
  preferredCountries: { country: string; _count: number }[];
  recentActivity: { id: string; type: string; description: string; createdAt: string; student: { id: string; fullName: string } }[];
}

const SECTION_META = [
  { key: "metrics1", gradient: "linear-gradient(135deg, #667eea, #764ba2)", glow: "rgba(102,126,234,0.3)", label: "Student Statistics" },
  { key: "metrics2", gradient: "linear-gradient(135deg, #43e97b, #38f9d7)", glow: "rgba(67,233,123,0.3)", label: "Assessments" },
  { key: "metrics3", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)", glow: "rgba(79,172,254,0.3)", label: "Applications" },
];

const METRIC_CARDS = [
  [
    { label: "Total Students", key: "total", color: "#667eea", icon: <PeopleIcon /> },
    { label: "Active", key: "active", color: "#4caf50", icon: <TrendingUpIcon /> },
    { label: "Inactive", key: "inactive", color: "#ff9800", icon: <PeopleIcon /> },
    { label: "Pending Docs", parent: "documents", key: "pending", color: "#f44336", icon: <SchoolIcon /> },
  ],
  [
    { label: "Total Assigned", parent: "assessments", key: "total", color: "#4caf50", icon: <AssessmentIcon /> },
    { label: "Pending", parent: "assessments", key: "pending", color: "#ff9800", icon: <AssessmentIcon /> },
    { label: "Completed", parent: "assessments", key: "completed", color: "#2196f3", icon: <AssessmentIcon /> },
    { label: "Applications", parent: "applications", key: "total", color: "#9c27b0", icon: <SchoolIcon /> },
  ],
  [
    { label: "Submitted", parent: "applications", key: "submitted", color: "#2196f3", icon: <SchoolIcon /> },
    { label: "Visa Processing", parent: "applications", key: "visa", color: "#ff9800", icon: <SchoolIcon /> },
  ],
];

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 40;
    const step = Math.max(1, Math.floor(value / steps));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(interval); }
      setDisplay(start);
    }, 1000 / steps);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  useEffect(() => {
    fetch("/api/admin/dashboard").then(r => r.json()).then(d => { if (d.success) setData(d.data); });
  }, []);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const t = isDark;
  const cardBg = t ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";
  const borderColor = t ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const borderLight = t ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const c = (dark: string, light: string) => t ? dark : light;

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "#667eea" }} />
        <Typography variant="body2" sx={{ color: "text.disabled" }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  const getVal = (card: typeof METRIC_CARDS[0][0]) => {
    if (card.parent === "documents") return data.documents?.pending ?? 0;
    if (card.parent === "assessments") return (data.assessments as any)[card.key] ?? 0;
    if (card.parent === "applications") return (data.applications as any)[card.key] ?? 0;
    return (data.students as any)[card.key] ?? 0;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box sx={{ width: 8, height: 40, borderRadius: 4, background: "linear-gradient(180deg, #667eea, #764ba2, #f093fb)" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.5px", background: `linear-gradient(135deg, ${c("#fff","#1a1a2e")}, #667eea, #f093fb)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Organization Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">Manage your students, assessments, and applications</Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {SECTION_META.map((section, sIdx) => {
          const cards = METRIC_CARDS[sIdx];
          return (
            <Grid size={{ xs: 12 }} key={section.key}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", bgcolor: cardBg, border: `1px solid ${borderColor}`, backdropFilter: "blur(12px)" }}>
                <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${borderColor}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", background: section.gradient, color: "#fff", boxShadow: `0 4px 12px ${section.glow}` }}>
                      {cards[0].icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "1rem" }}>{section.label}</Typography>
                  </Box>
                  <Chip label={`${cards.length} metrics`} size="small" sx={{ bgcolor: t ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: "text.secondary", fontWeight: 600, border: `1px solid ${borderColor}` }} />
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    {cards.map((card) => {
                      const val = getVal(card);
                      const cardKey = `section-${sIdx}-${card.label}`;
                      const open = !!expanded[cardKey];
                      const isHovered = hovered === cardKey;
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cardKey}>
                          <Paper
                            onClick={() => toggle(cardKey)}
                            onMouseEnter={() => setHovered(cardKey)}
                            onMouseLeave={() => setHovered(null)}
                            elevation={0}
                            sx={{
                              p: 2.5, borderRadius: 2.5, cursor: "pointer", position: "relative", overflow: "hidden",
                              background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                              border: "1px solid",
                              borderColor: open ? card.color : borderColor,
                              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                              transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
                              boxShadow: isHovered ? `0 12px 32px ${card.color}22` : "none",
                              "&::before": {
                                content: '""',
                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                background: section.gradient,
                                opacity: open || isHovered ? 1 : 0,
                                transition: "opacity 0.3s",
                              },
                            }}
                          >
                            <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", opacity: 0.06, background: `radial-gradient(circle, ${card.color}, transparent 70%)` }} />
                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                              <Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", lineHeight: 1.1, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
                                  <AnimatedCount value={val} />
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5, fontSize: "0.8rem" }}>{card.label}</Typography>
                              </Box>
                              <IconButton size="small" sx={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s", bgcolor: t ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", "&:hover": { bgcolor: t ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" } }}>
                                <ExpandMoreIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                              </IconButton>
                            </Box>
                            <Collapse in={open} timeout={300} unmountOnExit>
                              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${borderColor}` }}>
                                {cards.map((c) => {
                                  const v = getVal(c);
                                  return (
                                    <Box key={c.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, px: 0.5 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.8rem" }}>{c.label}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.8rem" }}>{v.toLocaleString()}</Typography>
                                    </Box>
                                  );
                                })}
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

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, backdropFilter: "blur(12px)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #4facfe, #00f2fe)", color: "#fff" }}>
                  <PublicIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.95rem" }}>Preferred Countries</Typography>
              </Box>
            </Box>
            {data.preferredCountries.length === 0 ? (
              <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>No data yet</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderColor: borderColor, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Country</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", borderColor: borderColor, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Students</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.preferredCountries.slice(0, 5).map((c, i) => (
                      <TableRow key={c.country} sx={{ "&:hover": { bgcolor: "rgba(79,172,254,0.06)" } }}>
                        <TableCell sx={{ borderColor: borderLight }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ["#667eea", "#4facfe", "#43e97b", "#fa709a", "#f5af19"][i] }} />
                            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>{c.country}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: borderLight }}>
                          <Chip label={c._count} size="small" sx={{ fontWeight: 700, bgcolor: "rgba(79,172,254,0.12)", color: "#4facfe", border: "1px solid rgba(79,172,254,0.2)" }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, backdropFilter: "blur(12px)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f093fb, #f5576c)", color: "#fff" }}>
                  <TrendingUpIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.95rem" }}>Recent Activity</Typography>
              </Box>
            </Box>
            {data.recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>No recent activity</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderColor: borderColor, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderColor: borderColor, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderColor: borderColor, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentActivity.slice(0, 5).map((a) => (
                      <TableRow key={a.id} sx={{ "&:hover": { bgcolor: "rgba(240,147,251,0.06)" } }}>
                        <TableCell sx={{ borderColor: borderLight }}>
                          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>{a.student?.fullName || "-"}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: borderLight }}>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                            {a.description}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: borderLight }}>
                          <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
                            {new Date(a.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
