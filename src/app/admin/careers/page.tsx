"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, TablePagination, CircularProgress,
} from "@mui/material";

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page + 1), limit: "50" });
    if (search) params.set("search", search);
    fetch(`/api/admin/careers?${params}`).then(r => r.json()).then(d => {
      if (d.success) { setCareers(d.data.data); setTotal(d.data.total); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, search]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Career Library</Typography>
      <TextField fullWidth label="Search careers" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 2 }} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Emerging</TableCell>
              <TableCell>Test Matches</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : careers.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No careers found</TableCell></TableRow>
            ) : careers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {(c.skills || []).slice(0, 4).map((s: string) => <Chip key={s} label={s} size="small" variant="outlined" />)}
                    {(c.skills || []).length > 4 && <Chip label={`+${c.skills.length - 4}`} size="small" />}
                  </Box>
                </TableCell>
                <TableCell>{c.isEmerging ? <Chip label="Emerging" color="info" size="small" /> : "-"}</TableCell>
                <TableCell>{c._count?.psychometricMatches || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={50} rowsPerPageOptions={[50]} />
      </TableContainer>
    </Box>
  );
}
