"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Container, Typography, Grid, Paper, Button, Chip, IconButton, CircularProgress,
  LinearProgress, Tooltip, Skeleton,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Dns as DnsIcon,
  BarChart as ChartIcon,
  Layers as StackIcon,
  People as UsersIcon,
  Code as CodeIcon,
  Router as RouterIcon,
  Api as ApiIcon,
} from "@mui/icons-material";

import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, staggerFadeIn } from "@/lib/dashboard-ui";

interface MetricCard {
  label: string;
  value: string | number;
  unit?: string;
  pct?: number;
  icon: React.ReactNode;
  color: string;
}

interface ActivityBar {
  hour: string;
  logins: number;
  registrations: number;
  active: number;
}

interface TechItem {
  name: string;
  category: string;
  version: string;
  status: "healthy" | "warning" | "critical";
}

interface MetricsData {
  cpu: number;
  memory: number;
  uptime: number;
  responseTime: number;
  activeUsers: number;
  totalUsers: number;
  dbConnections: number;
  dbQueryTime: number;
  dbSize: string;
  storageUsed: string;
  lastMigration: string;
  apiRequests: { total: number; success: number; error: number };
  userActivity: ActivityBar[];
  techStack: TechItem[];
}

function Gauge({ value, color, size = 100 }: { value: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={8} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={800} fill="#1a1a2e">
        {Math.round(value)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="rgba(0,0,0,0.4)" fontWeight={600}>%</text>
    </svg>
  );
}

function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const w = data.length * 6;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${i * 6 + 3},${height - (v / max) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * 6 + 3} cy={height - (v / max) * (height - 4) - 2} r={1.5} fill={color} />
      ))}
    </svg>
  );
}

function ActivityChart({ data }: { data: ActivityBar[] }) {
  const maxVal = Math.max(...data.map((d) => d.active), 1);
  const barW = Math.max(8, Math.min(16, 400 / data.length));
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 160, position: "relative" }}>
      {[...Array(5)].map((_, i) => (
        <Box key={i} sx={{ position: "absolute", left: 0, right: 0, top: `${(i / 5) * 100}%`, borderTop: "1px solid rgba(0,0,0,0.04)", zIndex: 0 }} />
      ))}
      {data.map((d, i) => {
        const h = (d.active / maxVal) * 140;
        return (
          <Tooltip key={i} title={`${d.hour} — Active: ${d.active}, Logins: ${d.logins}, Registered: ${d.registrations}`}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3, flex: 1, minWidth: barW }}>
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
                <Box sx={{ width: "60%", height: `${(d.registrations / maxVal) * 140}px`, borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg, #43e97b, #38f9d7)", opacity: 0.8, transition: "height 0.3s" }} />
                <Box sx={{ width: "80%", height: `${(d.logins / maxVal) * 140}px`, borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg, #667eea, #764ba2)", opacity: 0.7, transition: "height 0.3s" }} />
                <Box sx={{ width: "100%", height: `${h}px`, borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg, #4facfe, #00f2fe)", transition: "height 0.3s" }} />
              </Box>
              {i % 4 === 0 && <Typography variant="caption" sx={{ fontSize: "0.55rem", color: "rgba(0,0,0,0.35)", mt: 0.3 }}>{d.hour}</Typography>}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function StatusDot({ status }: { status: TechItem["status"] }) {
  const colors = { healthy: "#4caf50", warning: "#ff9800", critical: "#f44336" };
  return (
    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors[status], flexShrink: 0, boxShadow: `0 0 6px ${colors[status]}66` }} />
  );
}

const sparkData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 60 + 20));

export default function TechnologyDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchMetrics = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const res = await fetch("/api/technology/metrics");
      const d = await res.json();
      if (d.success) setMetrics(d.data);
    } catch { /* ignore */ }
    if (showLoader) setRefreshing(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics(true);
    intervalRef.current = setInterval(() => fetchMetrics(), 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchMetrics]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(() => fetchMetrics(), 10000);
    }
  }, [paused, fetchMetrics]);

  const togglePause = () => setPaused((p) => !p);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f9" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
            <Box>
              <Skeleton variant="text" width={240} height={32} />
              <Skeleton variant="text" width={160} height={18} />
            </Box>
          </Box>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                <Skeleton variant="rounded" width="100%" height={140} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="rounded" width="100%" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" width="100%" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, ...pageContainerSx }}>
        <Paper sx={{ ...glassBg, ...cardSx, p: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Failed to Load Metrics</Typography>
          <Button variant="outlined" onClick={() => fetchMetrics(true)}>Retry</Button>
        </Paper>
      </Container>
    );
  }

  const systemMetrics: MetricCard[] = [
    { label: "CPU Usage", value: metrics.cpu, unit: "%", pct: metrics.cpu, icon: <MemoryIcon />, color: "#667eea" },
    { label: "Memory", value: metrics.memory, unit: "%", pct: metrics.memory, icon: <StorageIcon />, color: "#43e97b" },
    { label: "Uptime", value: metrics.uptime, unit: "h", icon: <TimerIcon />, color: "#f093fb" },
    { label: "Response Time", value: metrics.responseTime, unit: "ms", icon: <SpeedIcon />, color: "#4facfe" },
    { label: "Active Users", value: metrics.activeUsers, icon: <UsersIcon />, color: "#fa709a", pct: Math.round((metrics.activeUsers / metrics.totalUsers) * 100) },
    { label: "DB Queries", value: metrics.dbQueryTime, unit: "ms", icon: <DnsIcon />, color: "#ff9800" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f9" }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={gradientIcon()}>
              <CodeIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#1a1a2e" }}>Technology Dashboard</Typography>
              <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>Real-time system monitoring</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              icon={paused ? <PauseIcon /> : <PlayIcon />}
              label={paused ? "Paused" : "Live"}
              size="small"
              onClick={togglePause}
              sx={{ fontWeight: 700, bgcolor: paused ? "rgba(255,152,0,0.12)" : "rgba(76,175,80,0.12)", color: paused ? "#ff9800" : "#4caf50", cursor: "pointer" }}
            />
            <Button
              size="small" variant="outlined"
              onClick={() => fetchMetrics(true)}
              disabled={refreshing}
              startIcon={refreshing ? <CircularProgress size={14} /> : <RefreshIcon />}
              sx={{ borderRadius: 2, borderColor: "rgba(0,0,0,0.12)", color: "text.secondary" }}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ ...sectionHeaderSx, mb: 2 }}>
          <Box sx={gradientIcon("#667eea")}><MemoryIcon fontSize="small" /></Box>
          <Typography variant="subtitle1" sx={sectionTitleSx}>System Metrics</Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {systemMetrics.map((m, idx) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={m.label}>
              <Paper
                sx={{
                  ...glassBg, ...cardSx, p: 2, textAlign: "center", height: "100%",
                  ...staggerFadeIn(idx),
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: `0 8px 32px ${m.color}18`, ...cardSx["&:hover"] },
                }}
              >
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: `${m.color}12`, color: m.color, mx: "auto", mb: 1 }}>
                  {m.icon}
                </Box>
                {m.pct !== undefined ? (
                  <Gauge value={m.pct} color={m.color} size={72} />
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a2e", lineHeight: 1.1 }}>{m.value}</Typography>
                )}
                <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 600, display: "block", mt: 0.5 }}>
                  {m.label}{m.unit ? ` (${m.unit})` : ""}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
              <Box sx={sectionHeaderSx}>
                <Box sx={gradientIcon("#4facfe")}><ChartIcon fontSize="small" /></Box>
                <Typography variant="subtitle1" sx={sectionTitleSx}>User Activity (24h)</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#4facfe" }} /><Typography variant="caption" sx={{ color: "rgba(0,0,0,0.5)" }}>Active</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#667eea" }} /><Typography variant="caption" sx={{ color: "rgba(0,0,0,0.5)" }}>Logins</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#43e97b" }} /><Typography variant="caption" sx={{ color: "rgba(0,0,0,0.5)" }}>Registrations</Typography></Box>
              </Box>
              <ActivityChart data={metrics.userActivity} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ ...glassBg, ...cardSx, p: 2.5, height: "100%" }}>
              <Box sx={sectionHeaderSx}>
                <Box sx={gradientIcon("#fa709a")}><ApiIcon fontSize="small" /></Box>
                <Typography variant="subtitle1" sx={sectionTitleSx}>API Requests</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Paper sx={{ flex: 1, p: 1.5, borderRadius: 2, textAlign: "center", bgcolor: "rgba(76,175,80,0.06)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#4caf50" }}>{((metrics.apiRequests.success / metrics.apiRequests.total) * 100).toFixed(1)}%</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)" }}>Success</Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 1.5, borderRadius: 2, textAlign: "center", bgcolor: "rgba(244,67,54,0.06)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#f44336" }}>{metrics.apiRequests.error}</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)" }}>Errors</Typography>
                </Paper>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a2e" }}>{metrics.apiRequests.total.toLocaleString()}</Typography>
              <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)" }}>Total requests (24h)</Typography>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 600, display: "block", mb: 0.5 }}>Request Trend</Typography>
                <Sparkline data={sparkData} color="#667eea" />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
              <Box sx={sectionHeaderSx}>
                <Box sx={gradientIcon("#43e97b")}><DnsIcon fontSize="small" /></Box>
                <Typography variant="subtitle1" sx={sectionTitleSx}>Database Status</Typography>
              </Box>
              <Grid container spacing={1.5}>
                {[
                  { label: "Connections", value: `${metrics.dbConnections} active`, color: "#667eea" },
                  { label: "Avg Query Time", value: `${metrics.dbQueryTime} ms`, color: "#4facfe" },
                  { label: "Database Size", value: metrics.dbSize, color: "#f093fb" },
                  { label: "Storage", value: metrics.storageUsed, color: "#fa709a", bar: true, barPct: 30 },
                  { label: "Last Migration", value: metrics.lastMigration, color: "#43e97b" },
                  { label: "Prisma Version", value: "5.22.0", color: "#ff9800" },
                ].map((item) => (
                  <Grid size={{ xs: 6 }} key={item.label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)" }}>
                      <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 600, display: "block", mb: 0.3 }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>{item.value}</Typography>
                      {"bar" in item && item.bar !== undefined && (
                        <LinearProgress variant="determinate" value={item.barPct || 30} sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", "& .MuiLinearProgress-bar": { bgcolor: item.color } }} />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
              <Box sx={sectionHeaderSx}>
                <Box sx={gradientIcon("#667eea")}><StackIcon fontSize="small" /></Box>
                <Typography variant="subtitle1" sx={sectionTitleSx}>Tech Stack</Typography>
              </Box>
              <Grid container spacing={1}>
                {metrics.techStack.map((tech) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={tech.name}>
                    <Paper
                      sx={{
                        p: 1.5, borderRadius: 2, cursor: "default", height: "100%",
                        border: "1px solid", borderColor: tech.status === "healthy" ? "rgba(76,175,80,0.15)" : tech.status === "warning" ? "rgba(255,152,0,0.15)" : "rgba(244,67,54,0.15)",
                        bgcolor: tech.status === "healthy" ? "rgba(76,175,80,0.04)" : tech.status === "warning" ? "rgba(255,152,0,0.04)" : "rgba(244,67,54,0.04)",
                        transition: "all 0.15s", "&:hover": { transform: "translateY(-1px)" },
                      }}
                      elevation={0}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <StatusDot status={tech.status} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 }}>{tech.name}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.35)", display: "block", ml: 2 }}>{tech.version}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon("#43e97b")}><RouterIcon fontSize="small" /></Box>
            <Typography variant="subtitle1" sx={sectionTitleSx}>System Architecture</Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { title: "Frontend", items: ["Next.js (React) SSR", "MUI v9 UI Kit", "Client Components", "React 19"] },
              { title: "Backend", items: ["Next.js API Routes", "Prisma ORM", "PostgreSQL 18", "Redis Cache"] },
              { title: "Auth & Security", items: ["JWT Access/Refresh", "bcryptjs Password", "RBAC Permissions", "Rate Limiting"] },
              { title: "Infrastructure", items: ["Node.js Runtime", "Docker Container", "Environment: dev", "Auto-scaling"] },
            ].map((section) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={section.title}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.04)" }} elevation={0}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#667eea", mb: 1, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>{section.title}</Typography>
                  {section.items.map((item) => (
                    <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 0.8, py: 0.4 }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.15)", flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{item}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.25)", fontWeight: 500 }}>
            Auto-refreshes every 10 seconds &middot; Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
