"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, Paper, Button, Chip, LinearProgress, Skeleton } from "@mui/material";
import { Psychology } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx } from "@/lib/dashboard-ui";

export default function TestsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/tests").then((r) => r.json()).then((d) => { if (d.success) setAssignments(d.data); }).finally(() => setLoading(false));
  }, []);

  const statusHex: Record<string, string> = { ASSIGNED: "#2196f3", IN_PROGRESS: "#ff9800", COMPLETED: "#4caf50", EXPIRED: "#f44336" };

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon()}>
          <Psychology sx={{ fontSize: 20 }} />
        </Box>
        <Typography sx={sectionTitleSx}>Psychometric Tests</Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
                <Skeleton variant="rounded" width="60%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="rounded" width="40%" height={18} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="30%" height={18} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" width="100%" height={36} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={fadeInSx}>
          {assignments.length === 0 ? (
            <Paper sx={{ ...glassBg, border: glassBorder, borderRadius: 3, p: 6, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Box sx={{ ...gradientIcon(), width: 56, height: 56, borderRadius: 3, mx: "auto", mb: 2 }}>
                <Psychology sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>No Tests Assigned</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>You don&apos;t have any psychometric tests assigned yet. Contact your counselor to get started.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {assignments.map((a) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.id}>
                  <Paper sx={{ ...glassBg, ...cardSx, p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>{a.test?.title || "Untitled Test"}</Typography>
                      <Chip label={a.status} size="small" sx={chipStatusSx(statusHex[a.status] || "#9e9e9e")} />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      {a.test?.type && <Typography variant="body2" color="text.secondary">Type: {a.test.type}</Typography>}
                      {a.test?.timeLimit && <Typography variant="body2" color="text.secondary">Time: {a.test.timeLimit} min</Typography>}
                    </Box>
                    {a.status === "COMPLETED" && a.score && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Score</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.score?.percentage?.toFixed(1) || JSON.stringify(a.score)}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={Number(a.score?.percentage ?? a.score) || 0} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.06)", "& .MuiLinearProgress-bar": { background: accentGradient, borderRadius: 3 } }} />
                      </Box>
                    )}
                    {(a.status === "ASSIGNED" || a.status === "IN_PROGRESS") && (
                      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button size="small" variant="contained" onClick={() => router.push(`/dashboard/tests/${a.id}`)} sx={{ background: accentGradient, borderRadius: 2, fontWeight: 700, flex: 1, textTransform: "none", "&:hover": { background: accentGradient, filter: "brightness(1.1)" } }}>
                          {a.status === "IN_PROGRESS" ? "Resume" : "Start Test"}
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
}
