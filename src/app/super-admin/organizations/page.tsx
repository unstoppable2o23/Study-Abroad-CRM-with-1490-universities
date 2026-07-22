"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Tooltip, InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { apiFetch } from "@/lib/api-client";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", severity: "success" as "success" | "error" });
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", adminName: "", adminEmail: "", adminUsername: "", adminPassword: "",
    logo: "", logoFile: null as File | null, brandColor: "", subscriptionStart: "", subscriptionEnd: "",
  });

  const loadOrgs = () => {
    setLoading(true);
    apiFetch("/api/super-admin/organizations")
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrgs(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrgs(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    setMessage({ text: "", severity: "success" });
    try {
      let logoUrl = form.logo;

      if (form.logoFile) {
        const uploadData = new FormData();
        uploadData.append("logo", form.logoFile);
        const uploadRes = await apiFetch("/api/super-admin/organizations/upload-logo", { method: "POST", body: uploadData });
        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          logoUrl = uploadResult.data.url;
        } else {
          setMessage({ text: "Logo upload failed: " + (uploadResult.error || "Unknown error"), severity: "error" });
          setSaving(false);
          return;
        }
      }

      const res = await apiFetch("/api/super-admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo: logoUrl,
          subscriptionStart: form.subscriptionStart || undefined,
          subscriptionEnd: form.subscriptionEnd || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Organization created successfully", severity: "success" });
        setDialogOpen(false);
                setForm({ name: "", adminName: "", adminEmail: "", adminUsername: "", adminPassword: "", logo: "", logoFile: null, brandColor: "", subscriptionStart: "", subscriptionEnd: "" });
        loadOrgs();
      } else {
        const errMsg = data.error || (data.errors?.password ? data.errors.password.join(", ") : "Failed to create");
        setMessage({ text: errMsg, severity: "error" });
      }
    } catch {
      setMessage({ text: "Failed to create organization", severity: "error" });
    }
    finally { setSaving(false); }
  };

  const toggleStatus = async (org: any) => {
    await apiFetch(`/api/super-admin/organizations/${org.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !org.isActive }),
    });
    loadOrgs();
  };

  const filtered = orgs.filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.slug?.toLowerCase().includes(search.toLowerCase()));

  const inputSx = {
    "& .MuiOutlinedInput-root": { bgcolor: "action.hover", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "action.active" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 6, height: 36, borderRadius: 3, background: "linear-gradient(180deg, #667eea, #764ba2)", display: { xs: "none", sm: "block" } }} />
          <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>Organizations</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadOrgs} sx={{ borderRadius: 2, borderColor: "divider", color: "text.secondary", flex: { xs: 1, sm: "none" } }}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, flex: { xs: 1, sm: "none" }, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>Create Organization</Button>
        </Box>
      </Box>

      <TextField
        size="small" placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, ...inputSx }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} /></InputAdornment> } }}
        fullWidth
      />

      {message.text && <Alert severity={message.severity} sx={{ mb: 2, borderRadius: 2 }}>{message.text}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 700, sm: "100%" } }}>
            <TableHead>
              <TableRow>
                {["Name", "Slug", "Plan", "Users", "Students", "Status", "Subscription", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", borderColor: "divider", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ borderColor: "divider" }}><CircularProgress size={24} sx={{ color: "primary.main", my: 2 }} /></TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ color: "text.disabled", py: 4, borderColor: "divider" }}>{search ? "No organizations match your search" : "No organizations found"}</TableCell></TableRow>
              )}
              {filtered.map((org: any) => {
                const expired = org.subscriptionEnd && new Date(org.subscriptionEnd) < new Date();
                return (
                  <TableRow key={org.id} hover sx={{ "& td": { borderColor: "divider" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{org.name}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.8rem" }}>{org.slug}</Typography></TableCell>
                    <TableCell>
                      <Chip label={org.plan} size="small" sx={{ fontWeight: 600, bgcolor: org.plan === "ENTERPRISE" ? "rgba(102,126,234,0.12)" : "action.hover", color: org.plan === "ENTERPRISE" ? "#667eea" : "text.secondary", border: "1px solid", borderColor: org.plan === "ENTERPRISE" ? "rgba(102,126,234,0.3)" : "divider" }} />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{org._count?.users || 0}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{org._count?.students || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        <Chip label={org.isActive ? "Active" : "Inactive"} size="small" sx={{ fontWeight: 600, bgcolor: org.isActive ? "rgba(76,175,80,0.12)" : "action.hover", color: org.isActive ? "#4caf50" : "text.secondary", border: "1px solid", borderColor: org.isActive ? "rgba(76,175,80,0.3)" : "divider" }} />
                        {expired && <Chip label="Expired" size="small" sx={{ fontWeight: 600, bgcolor: "rgba(244,67,54,0.12)", color: "#f44336", border: "1px solid rgba(244,67,54,0.3)" }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                        {org.subscriptionStart ? new Date(org.subscriptionStart).toLocaleDateString() : "-"}
                        {" → "}
                        {org.subscriptionEnd ? new Date(org.subscriptionEnd).toLocaleDateString() : "∞"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={org.isActive ? "Deactivate" : "Activate"}>
                        <Button size="small" onClick={() => toggleStatus(org)} sx={{ color: org.isActive ? "#f44336" : "#4caf50", fontWeight: 600, fontSize: "0.75rem" }}>
                          {org.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "background.default", border: "1px solid", borderColor: "divider", backgroundImage: "none" } } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider" }}>Create Organization</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Organization Details</Typography>
            <TextField label="Organization Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={inputSx} />
            <Button variant="outlined" component="label" fullWidth sx={{ py: 2, borderRadius: 2, borderColor: "divider", color: "text.secondary", cursor: "pointer", "&:hover": { borderColor: "action.active" }, justifyContent: "flex-start", gap: 1 }}>
              <CloudUploadIcon />
              {form.logoFile ? form.logoFile.name : form.logo ? "Logo uploaded" : "Upload Logo"}
              <input type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, logoFile: f, logo: "" }); }} />
            </Button>
            {form.logoFile && <Typography variant="caption" sx={{ color: "text.disabled" }}>{(form.logoFile.size / 1024).toFixed(1)} KB</Typography>}
            <TextField label="Brand Color (hex)" fullWidth value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })} sx={inputSx} placeholder="#667eea" />

            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", mt: 1 }}>Admin Account</Typography>
            <TextField label="Admin Full Name" fullWidth required value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} sx={inputSx} />
            <TextField label="Admin Email" fullWidth required type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} sx={inputSx} />
            <TextField label="Admin Username" fullWidth value={form.adminUsername} onChange={(e) => setForm({ ...form, adminUsername: e.target.value })} sx={inputSx} />
            <TextField label="Initial Password" fullWidth required type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} sx={{ ...inputSx, "& .MuiFormHelperText-root": { color: "text.disabled" } }} helperText="Min 8 chars, uppercase, lowercase, number & special character required" />

            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", mt: 1 }}>Subscription (Optional)</Typography>
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField label="Start Date" fullWidth type="date" value={form.subscriptionStart} onChange={(e) => setForm({ ...form, subscriptionStart: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
              <TextField label="End Date" fullWidth type="date" value={form.subscriptionEnd} onChange={(e) => setForm({ ...form, subscriptionEnd: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name || !form.adminName || !form.adminEmail || !form.adminPassword}
            sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
            {saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
