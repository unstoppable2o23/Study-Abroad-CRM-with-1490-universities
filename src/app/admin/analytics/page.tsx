"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip,
} from "@mui/material";

interface AnalyticsData {
  totalStudents: number;
  coursePreferences: { name: string; count: number }[];
  countryPreferences: { name: string; count: number }[];
  careerInterests: number;
  testPerformance: { total: number; averageScore: number };
  statusDistribution: { status: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  signupsByMonth: { month: string; count: number }[];
}

const statusColors: Record<string, any> = {
  REGISTERED: "default", PROFILE_INCOMPLETE: "warning", DOCUMENTS_PENDING: "info",
  DOCUMENTS_APPROVED: "success", PSYCHOMETRIC_ASSIGNED: "secondary", PSYCHOMETRIC_COMPLETED: "info",
  COUNSELING_IN_PROGRESS: "info",
  APPLICATIONS_STARTED: "primary", APPLICATIONS_SUBMITTED: "info", OFFER_RECEIVED: "success",
  VISA_PROCESSING: "warning", VISA_APPROVED: "success", ENROLLED: "success", CLOSED: "default",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => { if (d.success) setData(d.data); });
  }, []);

  if (!data) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analytics</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderLeft: 4, borderColor: "#1976d2" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{data.totalStudents}</Typography>
            <Typography variant="body2" color="text.secondary">Total Students</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderLeft: 4, borderColor: "#2e7d32" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{data.careerInterests}</Typography>
            <Typography variant="body2" color="text.secondary">Career Interests Recorded</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderLeft: 4, borderColor: "#ed6c02" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{data.testPerformance.averageScore.toFixed(1)}</Typography>
            <Typography variant="body2" color="text.secondary">Avg Test Score ({data.testPerformance.total} tests)</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Student Status Distribution</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.statusDistribution.map((s) => (
                    <TableRow key={s.status}>
                      <TableCell><Chip label={s.status} color={statusColors[s.status] || "default"} size="small" /></TableCell>
                      <TableCell align="right">{s.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Gender</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.genderDistribution.length === 0 ? (
                    <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>
                  ) : data.genderDistribution.map((g) => (
                    <TableRow key={g.gender}>
                      <TableCell>{g.gender}</TableCell>
                      <TableCell align="right">{g.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Top Course Preferences</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell align="right">Students</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.coursePreferences.slice(0, 10).map((c) => (
                    <TableRow key={c.name}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell align="right">{c.count}</TableCell>
                    </TableRow>
                  ))}
                  {data.coursePreferences.length === 0 && <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Top Country Preferences</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Students</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.countryPreferences.slice(0, 10).map((c) => (
                    <TableRow key={c.name}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell align="right">{c.count}</TableCell>
                    </TableRow>
                  ))}
                  {data.countryPreferences.length === 0 && <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Signups by Month</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Signups</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.signupsByMonth.map((s) => (
                    <TableRow key={s.month}>
                      <TableCell>{s.month}</TableCell>
                      <TableCell align="right">{s.count}</TableCell>
                    </TableRow>
                  ))}
                  {data.signupsByMonth.length === 0 && <TableRow><TableCell colSpan={2}>No data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
