"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress,
} from "@mui/material";

export default function AdminExamTypesPage() {
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/exam-types?${params}`).then(r => r.json()).then(d => {
      if (d.success) setExamTypes(d.data.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Entrance Exams</Typography>

      <TextField
        size="small" sx={{ mb: 2, minWidth: 300 }}
        label="Search exam types" value={search} onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score Range</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examTypes.map((et: any) => (
                <TableRow key={et.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{et.name}</TableCell>
                  <TableCell>{et.code}</TableCell>
                  <TableCell>
                    {et.minScore != null && et.maxScore != null ? `${et.minScore} - ${et.maxScore} ${et.scoreUnit || ""}` : et.scoreUnit || "-"}
                  </TableCell>
                  <TableCell>
                    <Chip label={et.isActive ? "Active" : "Inactive"} size="small" color={et.isActive ? "success" : "default"} />
                  </TableCell>
                </TableRow>
              ))}
              {examTypes.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>No exam types found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
