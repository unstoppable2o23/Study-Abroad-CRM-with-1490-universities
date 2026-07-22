"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ testId: "", studentId: "" });
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/tests").then(r => r.json()),
      fetch("/api/admin/students?limit=200").then(r => r.json()),
    ]).then(([testsData, studentsData]) => {
      if (testsData.success) setTests(testsData.data);
      if (studentsData.success) setStudents(studentsData.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    setAssignError("");
    setAssignSuccess("");
    try {
      const res = await fetch("/api/admin/tests/assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(assignForm) });
      const d = await res.json();
      if (d.success) {
        setAssignSuccess("Test assigned successfully!");
        setAssignForm({ testId: "", studentId: "" });
        setAssignOpen(false);
        fetchData();
      } else {
        setAssignError(d.error || "Failed to assign");
      }
    } catch { setAssignError("Network error"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Psychometric Tests</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" onClick={() => setAssignOpen(true)}>Assign Test</Button>
        </Box>
      </Box>

      {assignSuccess && <Alert severity="success" sx={{ mb: 2 }}>{assignSuccess}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Time Limit</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Assignments</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : tests.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No tests available</TableCell></TableRow>
            ) : tests.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell><Chip label={t.type} size="small" /></TableCell>
                <TableCell>{t.timeLimit ? `${t.timeLimit} min` : "-"}</TableCell>
                <TableCell>{t._count?.questions || 0}</TableCell>
                <TableCell>{t._count?.assignments || 0}</TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Psychometric Test</DialogTitle>
        <DialogContent>
          {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Test</InputLabel>
              <Select value={assignForm.testId} label="Test" onChange={(e) => setAssignForm({ ...assignForm, testId: e.target.value })}>
                {tests.map((t: any) => <MenuItem key={t.id} value={t.id}>{t.title} ({t.type})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select value={assignForm.studentId} label="Student" onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}>
                {students.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.fullName} ({s.email})</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
