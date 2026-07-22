"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function SuperAdminExamTypesPage() {
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", minScore: "", maxScore: "", scoreUnit: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/exam-types?${params}`).then(r => r.json()).then(d => {
      if (d.success) setExamTypes(d.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", code: "", description: "", minScore: "", maxScore: "", scoreUnit: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ name: item.name, code: item.code, description: item.description || "", minScore: item.minScore?.toString() || "", maxScore: item.maxScore?.toString() || "", scoreUnit: item.scoreUnit || "" });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editItem ? `/api/exam-types/${editItem.id}` : "/api/exam-types";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.success) { setDialogOpen(false); fetchData(); }
      else setError(d.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/exam-types/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) fetchData();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Entrance Exams</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>Add Exam Type</Button>
      </Box>

      <TextField
        size="small" sx={{ mb: 2, minWidth: 300, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.04)", color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } } }}
        slotProps={{ inputLabel: { sx: { color: "rgba(255,255,255,0.4)" } } }}
        label="Search exam types" value={search} onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress sx={{ color: "#667eea" }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Score Range</TableCell>
                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examTypes.map((et: any) => (
                <TableRow key={et.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{et.name}</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.6)" }}>{et.code}</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.6)" }}>
                    {et.minScore != null && et.maxScore != null ? `${et.minScore} - ${et.maxScore} ${et.scoreUnit || ""}` : et.scoreUnit || "-"}
                  </TableCell>
                  <TableCell>
                    <Chip label={et.isActive ? "Active" : "Inactive"} size="small" color={et.isActive ? "success" : "default"} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(et)} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#667eea" } }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(et.id, et.name)} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#f5576c" } }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {examTypes.length === 0 && (
                <TableRow><TableCell colSpan={5} sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", py: 4 }}>No exam types found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? "Edit Exam Type" : "Add Exam Type"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Exam Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Code" fullWidth required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} helperText="e.g. GRE, GMAT, IELTS, TOEFL" />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Min Score" type="number" fullWidth value={form.minScore} onChange={(e) => setForm({ ...form, minScore: e.target.value })} />
              <TextField label="Max Score" type="number" fullWidth value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
            </Box>
            <TextField label="Score Unit" fullWidth value={form.scoreUnit} onChange={(e) => setForm({ ...form, scoreUnit: e.target.value })} helperText="e.g. points, percentile, band" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
