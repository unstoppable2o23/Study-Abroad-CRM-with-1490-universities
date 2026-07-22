"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Switch,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", username: "", password: "" });
  const [createError, setCreateError] = useState("");

  const fetchCounselors = () => {
    setLoading(true);
    fetch("/api/admin/counselors").then(r => r.json()).then(d => {
      if (d.success) setCounselors(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCounselors(); }, []);

  const handleCreate = async () => {
    setCreateError("");
    try {
      const res = await fetch("/api/admin/counselors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
      const d = await res.json();
      if (d.success) {
        setCreateForm({ fullName: "", email: "", username: "", password: "" });
        setCreateOpen(false);
        fetchCounselors();
      } else {
        setCreateError(d.error || d.errors?.password?.join(", ") || "Failed to create");
      }
    } catch { setCreateError("Network error"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Counselors</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCounselors}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Add Counselor</Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Students</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : counselors.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No counselors yet</TableCell></TableRow>
            ) : counselors.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.fullName}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.username || "-"}</TableCell>
                <TableCell><Chip label={c.isActive ? "Active" : "Inactive"} color={c.isActive ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{c._count?.counseledStudents || 0}</TableCell>
                <TableCell>{c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Counselor</DialogTitle>
        <DialogContent>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Full Name" fullWidth required value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
            <TextField label="Email" fullWidth required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <TextField label="Username" fullWidth value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
            <TextField label="Password" fullWidth required type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} helperText="Min 8 chars, uppercase, lowercase, number, special character" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
