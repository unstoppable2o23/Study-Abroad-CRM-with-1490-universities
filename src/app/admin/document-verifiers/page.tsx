"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function AdminDocumentVerifiersPage() {
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", username: "", password: "" });
  const [createError, setCreateError] = useState("");

  const fetchVerifiers = () => {
    setLoading(true);
    fetch("/api/admin/document-verifiers").then(r => r.json()).then(d => {
      if (d.success) setVerifiers(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVerifiers(); }, []);

  const handleCreate = async () => {
    setCreateError("");
    try {
      const res = await fetch("/api/admin/document-verifiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
      const d = await res.json();
      if (d.success) {
        setCreateForm({ fullName: "", email: "", username: "", password: "" });
        setCreateOpen(false);
        fetchVerifiers();
      } else {
        setCreateError(d.error || d.errors?.password?.join(", ") || "Failed to create");
      }
    } catch { setCreateError("Network error"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Document Verifiers</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchVerifiers}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Add Verifier</Button>
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
              <TableCell>Last Login</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : verifiers.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No document verifiers yet</TableCell></TableRow>
            ) : verifiers.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell>{v.fullName}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.username || "-"}</TableCell>
                <TableCell><Chip label={v.isActive ? "Active" : "Inactive"} color={v.isActive ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{v.lastLoginAt ? new Date(v.lastLoginAt).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>{new Date(v.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Document Verifier</DialogTitle>
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
