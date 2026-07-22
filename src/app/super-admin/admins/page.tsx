"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from "@mui/material";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialog, setResetDialog] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const loadAdmins = () => {
    setLoading(true);
    fetch("/api/super-admin/admins")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAdmins(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAdmins(); }, []);

  const toggleStatus = async (admin: any) => {
    await fetch(`/api/super-admin/admins/${admin.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !admin.isActive }),
    });
    loadAdmins();
  };

  const handleResetPassword = async () => {
    if (!resetDialog || !newPassword) return;
    setMessage("");
    try {
      const res = await fetch(`/api/super-admin/admins/${resetDialog.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successfully");
        setResetDialog(null);
        setNewPassword("");
      } else {
        setMessage(data.error || "Failed to reset");
      }
    } catch { setMessage("Failed to reset password"); }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Management</Typography>

      {message && <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Org Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={8} sx={{ textAlign: "center" }}><CircularProgress size={24} /></TableCell></TableRow>}
            {!loading && admins.length === 0 && <TableRow><TableCell colSpan={8} sx={{ textAlign: "center" }}>No admins found</TableCell></TableRow>}
            {admins.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell>{a.fullName}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell><Chip label={a.role} size="small" color="primary" /></TableCell>
                <TableCell>{a.organization?.name || "-"}</TableCell>
                <TableCell>
                  <Chip label={a.organization?.isActive ? "Active" : "Inactive"} size="small" color={a.organization?.isActive ? "success" : "default"} />
                </TableCell>
                <TableCell>
                  <Chip label={a.isActive ? "Active" : "Inactive"} color={a.isActive ? "success" : "default"} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : "Never"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" color={a.isActive ? "error" : "success"} onClick={() => toggleStatus(a)}>
                      {a.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setResetDialog({ id: a.id, name: a.fullName })}>
                      Reset PW
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!resetDialog} onClose={() => setResetDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password for {resetDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={{ mt: 1 }} helperText="Min 8 chars, uppercase, lowercase, number, special character" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={!newPassword}>Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
