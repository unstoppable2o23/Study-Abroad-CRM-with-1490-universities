"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Alert, Skeleton } from "@mui/material";
import { Business } from "@mui/icons-material";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx } from "@/lib/dashboard-ui";

const statusColors: Record<string, string> = {
  DRAFT: "#9e9e9e", SUBMITTED: "#1976d2", UNDER_REVIEW: "#ed6c02", OFFER_RECEIVED: "#2e7d32",
  OFFER_ACCEPTED: "#2e7d32", VISA_PROCESSING: "#1976d2", VISA_APPROVED: "#2e7d32", ENROLLED: "#2e7d32", REJECTED: "#d32f2f",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/applications").then((r) => r.json()).then((d) => {
      if (d.success) setApps(d.data); else setError(d.error || "Failed to load applications");
    }).catch(() => setError("Network error")).finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon()}>
          <Business sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={sectionTitleSx}>My Applications</Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard/applications/new")}
          sx={{
            background: accentGradient, color: "#fff", fontWeight: 700, borderRadius: 2,
            textTransform: "none", px: 3, "&:hover": { background: accentGradient, filter: "brightness(1.1)" },
          }}
        >
          New Application
        </Button>
      </Box>

      <TableContainer component={Paper} sx={fadeInSx}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadSx}>University</TableCell>
              <TableCell sx={tableHeadSx}>Course</TableCell>
              <TableCell sx={tableHeadSx}>Intake</TableCell>
              <TableCell sx={tableHeadSx}>Status</TableCell>
              <TableCell sx={tableHeadSx}>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={"sk-" + i} sx={tableRowHoverSx()}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><Skeleton width={j === 0 ? 160 : j === 3 ? 80 : 100} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  No applications yet
                </TableCell>
              </TableRow>
            ) : apps.map((app) => (
              <TableRow key={app.id} sx={tableRowHoverSx()}>
                <TableCell>{app.university?.name || "-"}</TableCell>
                <TableCell>{app.course?.name || "-"}</TableCell>
                <TableCell>{app.intake || "-"}</TableCell>
                <TableCell>
                  <Chip label={app.status} size="small" sx={chipStatusSx(statusColors[app.status] || "#9e9e9e")} />
                </TableCell>
                <TableCell>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
