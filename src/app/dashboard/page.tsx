"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Grid, Paper, Button, Chip, CircularProgress,
  LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Skeleton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon,
  sectionHeaderSx, sectionTitleSx, kpiValueSx, kpiLabelSx, chipStatusSx,
  tableRowHoverSx, tableHeadSx, pageContainerSx, fadeInSx, staggerFadeIn,
} from "@/lib/dashboard-ui";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/dashboard").then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!data || !data.profileExists) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{
          p: { xs: 4, md: 6 }, textAlign: "center", borderRadius: 4, ...glassBg, border: glassBorder,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: "50%",
            background: accentGradient, display: "flex", alignItems: "center",
            justifyContent: "center", mx: "auto", mb: 2.5, color: "#fff",
            boxShadow: "0 8px 24px rgba(102,126,234,0.25)",
          }}>
            <PersonIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}>
            Welcome to Study Abroad CRM
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto", lineHeight: 1.6 }}>
            Complete your profile to get personalized university and career recommendations tailored to your academic background.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/profile")}
            sx={{
              background: accentGradient, px: 4, py: 1.5, borderRadius: 2,
              fontWeight: 700, fontSize: "0.9rem",
              boxShadow: "0 4px 14px rgba(102,126,234,0.35)",
              "&:hover": { boxShadow: "0 6px 20px rgba(102,126,234,0.45)", transform: "translateY(-1px)" },
              transition: "all 0.2s",
            }}
            endIcon={<ChevronRightIcon />}
          >
            Complete Profile
          </Button>
        </Paper>
      </Container>
    );
  }

  const quickActions = [
    { title: "My Profile", path: "/dashboard/profile", icon: <PersonIcon />, color: accent },
    { title: "Psychometric Tests", path: "/dashboard/tests", icon: <AssignmentIcon />, color: "#43e97b" },
    { title: "My Documents", path: "/dashboard/documents", icon: <DescriptionIcon />, color: "#f093fb" },
    { title: "Applications", path: "/dashboard/applications", icon: <TrendingUpIcon />, color: "#4facfe" },
    { title: "University Search", path: "/dashboard/universities", icon: <SchoolIcon />, color: "#fa709a" },
    { title: "Career Guidance", path: "/dashboard/careers", icon: <WorkIcon />, color: "#ff9800" },
    { title: "AI Assistant", path: "/dashboard/ai-search", icon: <PsychologyIcon />, color: "#00f2fe" },
    { title: "Entrance Exams", path: "/dashboard/exam-types", icon: <AssignmentIcon />, color: "#7c4dff" },
  ];

  const statCards = [
    { title: "Tests Assigned", value: data.tests?.assigned || 0, color: accent, icon: <AssignmentIcon />, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
    { title: "Tests Completed", value: data.tests?.completed || 0, color: "#4caf50", icon: <AutoAwesomeIcon />, gradient: "linear-gradient(135deg, #43e97b, #38f9d7)" },
    { title: "Documents", value: data.documents?.total || 0, color: "#9c27b0", icon: <DescriptionIcon />, gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
    { title: "Saved Universities", value: data.savedUniversities || 0, color: "#ff9800", icon: <SchoolIcon />, gradient: "linear-gradient(135deg, #fa709a, #fee140)" },
    { title: "Applications", value: data.applications?.total || 0, color: "#2196f3", icon: <TrendingUpIcon />, gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { title: "Careers Available", value: data.totalCareers || 0, color: "#2e7d32", icon: <WorkIcon />, gradient: "linear-gradient(135deg, #43e97b, #38f9d7)" },
  ];

  const profilePct = data.completion?.percentage || 0;
  const firstName = data.student?.fullName?.split(" ")[0] || "Student";
  const maxVal = Math.max(...statCards.map(s => s.value), 1);

  return (
    <Container maxWidth="xl" disableGutters sx={{ ...pageContainerSx }}>
      {/* Hero Section */}
      <Paper elevation={0} sx={{
        mb: 3, borderRadius: 3, overflow: "hidden",
        ...glassBg, border: glassBorder,
        position: "relative",
      }}>
        <Box sx={{
          position: "absolute", top: "-50%", right: "-10%", width: 300, height: 300,
          borderRadius: "50%", background: `radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: "-30%", left: "-5%", width: 200, height: 200,
          borderRadius: "50%", background: `radial-gradient(circle, rgba(118,75,162,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <Box sx={{ p: { xs: 3, md: 4 }, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 5, height: 40, borderRadius: 3, background: accentGradient }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.75rem" }, letterSpacing: "-0.75px", color: "text.primary" }}>
                  Welcome back, {firstName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Chip
                label={`${profilePct}% Profile Complete`}
                size="small"
                sx={{
                  fontWeight: 700, height: 28,
                  bgcolor: profilePct >= 80 ? "rgba(76,175,80,0.12)" : profilePct >= 50 ? "rgba(255,152,0,0.12)" : "rgba(244,67,54,0.12)",
                  color: profilePct >= 80 ? "#4caf50" : profilePct >= 50 ? "#ff9800" : "#f44336",
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/dashboard/profile")}
                sx={{
                  borderRadius: 2, fontWeight: 600, borderColor: "divider",
                  "&:hover": { borderColor: accent, bgcolor: `${accent}08` },
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900, fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              letterSpacing: "-1px", lineHeight: 1.15, mb: 1.5,
              background: accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Discover. Compare. Apply.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary", maxWidth: 720, lineHeight: 1.7,
              fontSize: { xs: "0.88rem", md: "0.95rem" },
            }}
          >
            Explore leading universities in India and around the world. Discover the right courses, compare programs, explore career opportunities, and manage your entire admission journey with AI-powered guidance.
          </Typography>
        </Box>
      </Paper>

      {/* Profile Completion */}
      <Paper elevation={0} sx={{
        mb: 3, borderRadius: 2.5, overflow: "hidden",
        ...glassBg, border: glassBorder,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Profile Completion</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: profilePct >= 80 ? "#4caf50" : profilePct >= 50 ? "#ff9800" : "#f44336" }}>
                {profilePct}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={profilePct} sx={{
              height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.04)",
              "& .MuiLinearProgress-bar": { background: accentGradient, borderRadius: 3 },
            }} />
          </Box>
          {profilePct < 100 && (
            <Button
              size="small"
              variant="contained"
              onClick={() => router.push("/dashboard/profile")}
              sx={{
                background: accentGradient, borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                "&:hover": { boxShadow: "0 6px 16px rgba(102,126,234,0.4)" },
              }}
            >
              Complete Now
            </Button>
          )}
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((stat, idx) => {
          const pct = (stat.value / maxVal) * 100;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
              <Paper elevation={0} sx={{
                ...cardSx, ...glassBg, ...staggerFadeIn(idx),
                p: 2.5, borderRadius: 3, position: "relative", overflow: "hidden",
              }}>
                <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", opacity: 0.06, background: stat.gradient }} />
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                  <Box>
                    <Typography sx={kpiLabelSx}>{stat.title}</Typography>
                    <Typography sx={{ ...kpiValueSx, mt: 0.25 }}>{stat.value}</Typography>
                  </Box>
                  <Box sx={{ ...gradientIcon(stat.color), width: 40, height: 40, borderRadius: 2, "& .MuiSvgIcon-root": { fontSize: 20 } }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Box sx={{ height: 3, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", position: "relative" }}>
                  <Box sx={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: stat.gradient, transition: "width 0.8s ease" }} />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions + Recent Tests */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ ...cardSx, ...glassBg, p: 2.5, borderRadius: 3, ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={gradientIcon()}>
                <DashboardIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={sectionTitleSx}>Quick Actions</Typography>
            </Box>
            <Grid container spacing={1.5}>
              {quickActions.map((card) => (
                <Grid size={{ xs: 12, sm: 6 }} key={card.title}>
                  <Paper
                    elevation={0}
                    onClick={() => router.push(card.path)}
                    sx={{
                      p: 1.75, borderRadius: 2.5, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 1.5,
                      border: "1px solid", borderColor: "divider",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: `${card.color}06`,
                        borderColor: `${card.color}33`,
                        transform: "translateX(4px)",
                        boxShadow: `0 2px 8px ${card.color}15`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 34, height: 34, borderRadius: 1.5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${card.color}12`, color: card.color, flexShrink: 0,
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                    }}>
                      {card.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {card.title}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ ...cardSx, ...glassBg, p: 2.5, borderRadius: 3, height: "100%", ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={{ ...gradientIcon("#43e97b") }}>
                <AssignmentIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={sectionTitleSx}>Recent Tests</Typography>
            </Box>
            {data.recentTests?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeadSx}>Test</TableCell>
                      <TableCell sx={tableHeadSx}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentTests.map((t: any) => (
                      <TableRow key={t.id} sx={tableRowHoverSx("#43e97b")}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.test?.title || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={t.status}
                            size="small"
                            sx={chipStatusSx(
                              t.status === "COMPLETED" ? "#4caf50" : t.status === "ASSIGNED" ? "#ff9800" : "#757575"
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">No tests assigned yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ ...cardSx, ...glassBg, p: 2.5, borderRadius: 3, ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={{ ...gradientIcon("#4facfe") }}>
                <TrendingUpIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={sectionTitleSx}>Recent Applications</Typography>
            </Box>
            {data.recentApplications?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeadSx}>University</TableCell>
                      <TableCell sx={tableHeadSx}>Status</TableCell>
                      <TableCell sx={tableHeadSx}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentApplications.map((a: any) => (
                      <TableRow key={a.id} sx={tableRowHoverSx("#4facfe")}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.university?.name || "-"}</TableCell>
                        <TableCell>
                          <Chip label={a.status} size="small" sx={chipStatusSx(
                            a.status === "APPROVED" || a.status === "OFFER_RECEIVED" ? "#4caf50" :
                            a.status === "REJECTED" ? "#f44336" :
                            a.status === "SUBMITTED" || a.status === "UNDER_REVIEW" ? "#2196f3" :
                            a.status === "DRAFT" ? "#ff9800" : "#757575"
                          )} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">No applications yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <Container maxWidth="xl" disableGutters sx={{ py: 4 }}>
      <Skeleton variant="rounded" width={280} height={40} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="rounded" width={200} height={20} sx={{ mb: 3, borderRadius: 1 }} />
      <Skeleton variant="rounded" width="100%" height={64} sx={{ mb: 3, borderRadius: 2.5 }} />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" width="100%" height={280} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" width="100%" height={280} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Container>
  );
}
