"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip, CircularProgress, Pagination } from "@mui/material";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadStudents = () => {
    setLoading(true);
    fetch(`/api/super-admin/students?search=${encodeURIComponent(search)}&page=${page}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStudents(d.data.data || []);
          setTotalPages(d.data.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, [page, search]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">All Students</Typography>
        <TextField size="small" placeholder="Search by name or email..." value={search} onChange={(e) => handleSearch(e.target.value)} sx={{ width: 300 }} />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Counselor</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={8} sx={{ textAlign: "center" }}><CircularProgress size={24} /></TableCell></TableRow>}
            {!loading && students.length === 0 && <TableRow><TableCell colSpan={8} sx={{ textAlign: "center" }}>No students found</TableCell></TableRow>}
            {students.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell><Chip label={s.status} size="small" color={s.status === "VISA_APPROVED" ? "success" : "default"} /></TableCell>
                <TableCell>{s.organization?.name || "-"}</TableCell>
                <TableCell>{s.counselor?.fullName || "-"}</TableCell>
                <TableCell>{s._count?.applications || 0}</TableCell>
                <TableCell>{s._count?.documents || 0}</TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(s.createdAt).toLocaleDateString()}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
