"use client";

import { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, CircularProgress, Alert, Chip,
} from "@mui/material";
import { Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reports?type=students");
      const d = await res.json();
      if (d.success) setData(d.data);
      else setError(d.error || "Failed to load report");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!data?.data?.length) return;
    const headers = Object.keys(data.data[0]).join(",");
    const rows = data.data.map((row: any) => Object.values(row).map(v => `"${v || ""}"`).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchReport} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Generate Report"}
          </Button>
          {data && <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadCSV}>Download CSV</Button>}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Report generated: {new Date(data.generatedAt).toLocaleString()} | Total records: {data.total}
          </Typography>
        </Paper>
      )}

      {data?.data?.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Preferred Country</TableCell>
                <TableCell>Apps</TableCell>
                <TableCell>Docs</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.slice(0, 100).map((row: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.mobile || "-"}</TableCell>
                  <TableCell><Chip label={row.status} size="small" /></TableCell>
                  <TableCell>{row.country || "-"}</TableCell>
                  <TableCell>{row.preferredCountry || "-"}</TableCell>
                  <TableCell>{row.applications}</TableCell>
                  <TableCell>{row.documents}</TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.data.length > 100 && <Typography variant="caption" sx={{ p: 1, display: "block" }}>Showing first 100 of {data.data.length} records. Download CSV for full data.</Typography>}
        </TableContainer>
      )}

      {!data && !loading && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Click "Generate Report" to view student data</Typography>
        </Paper>
      )}
    </Box>
  );
}
