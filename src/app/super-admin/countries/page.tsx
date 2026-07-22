"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, IconButton, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, VisibilityOff as DisableIcon } from "@mui/icons-material";

const statusColors: Record<string, any> = { DRAFT: "default", PENDING_REVIEW: "warning", PUBLISHED: "success", DISABLED: "error" };
const regionOptions = ["North America", "Europe", "Asia", "Oceania", "Africa", "South America", "Middle East"];

export default function SuperAdminCountriesPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (regionFilter) params.set("region", regionFilter);
    fetch(`/api/countries?${params}`).then(r => r.json()).then(d => {
      if (d.success) setCountries(d.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, regionFilter]);

  const openCreate = () => {
    setEditMode("create");
    setEditForm({ name: "", code: "", region: "", currency: "", language: "", livingCost: "", description: "", overview: "", educationSystem: "", visaInfo: "", workOpportunities: "", prOpportunities: "", status: "PUBLISHED" });
    setSaveError("");
    setEditOpen(true);
  };

  const openEdit = (c: any) => {
    setEditMode("edit");
    setEditForm({
      id: c.id, name: c.name, code: c.code, region: c.region || "", currency: c.currency || "",
      language: c.language || "", livingCost: c.livingCost || "", description: c.description || "",
      overview: c.overview || "", educationSystem: c.educationSystem || "", visaInfo: c.visaInfo || "",
      workOpportunities: c.workOpportunities || "", prOpportunities: c.prOpportunities || "",
      status: c.status || "PUBLISHED",
    });
    setSaveError("");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const url = editMode === "create" ? "/api/countries" : `/api/countries/${editForm.id}`;
      const method = editMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const d = await res.json();
      if (d.success) { setEditOpen(false); fetchData(); }
      else setSaveError(d.error || "Failed to save");
    } catch { setSaveError("Network error"); }
    setSaving(false);
  };

  const handleDisable = async (id: string, name: string) => {
    if (!confirm(`Disable "${name}"?`)) return;
    await fetch(`/api/countries/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Country Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Country</Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField size="small" fullWidth label="Search countries" value={search} onChange={(e) => setSearch(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Region</InputLabel>
          <Select value={regionFilter} label="Region" onChange={(e) => setRegionFilter(e.target.value)}>
            <MenuItem value="">All Regions</MenuItem>
            {regionOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Living Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Unis</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : countries.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center">No countries found</TableCell></TableRow>
            ) : countries.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell><Chip label={c.code} size="small" variant="outlined" /></TableCell>
                <TableCell>{c.region || "-"}</TableCell>
                <TableCell>{c.currency || "-"}</TableCell>
                <TableCell>{c.language || "-"}</TableCell>
                <TableCell>{c.livingCost ? `$${c.livingCost.toLocaleString()}/yr` : "-"}</TableCell>
                <TableCell><Chip label={c.status || "PUBLISHED"} color={statusColors[c.status] || "default"} size="small" /></TableCell>
                <TableCell>{c._count?.universities || 0}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(c)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDisable(c.id, c.name)} color="error"><DisableIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode === "create" ? "Add Country" : "Edit Country"}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Country Name" required value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <TextField fullWidth label="Code" required value={editForm.code || ""} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} slotProps={{ htmlInput: { style: { textTransform: "uppercase" }, maxLength: 2 } }} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select value={editForm.region || ""} label="Region" onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}>
                  {regionOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth label="Currency" value={editForm.currency || ""} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
              <TextField fullWidth label="Language" value={editForm.language || ""} onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Living Cost (USD/yr)" type="number" value={editForm.livingCost || ""} onChange={(e) => setEditForm({ ...editForm, livingCost: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status || "PUBLISHED"} label="Status" onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  {["DRAFT", "PENDING_REVIEW", "PUBLISHED", "DISABLED"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField fullWidth label="Description" multiline rows={2} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <TextField fullWidth label="Education System Overview" multiline rows={3} value={editForm.educationSystem || ""} onChange={(e) => setEditForm({ ...editForm, educationSystem: e.target.value })} />
            <TextField fullWidth label="Overview" multiline rows={3} value={editForm.overview || ""} onChange={(e) => setEditForm({ ...editForm, overview: e.target.value })} />
            <TextField fullWidth label="Visa Information" multiline rows={3} value={editForm.visaInfo || ""} onChange={(e) => setEditForm({ ...editForm, visaInfo: e.target.value })} />
            <TextField fullWidth label="Work Opportunities" multiline rows={2} value={editForm.workOpportunities || ""} onChange={(e) => setEditForm({ ...editForm, workOpportunities: e.target.value })} />
            <TextField fullWidth label="PR Opportunities" multiline rows={2} value={editForm.prOpportunities || ""} onChange={(e) => setEditForm({ ...editForm, prOpportunities: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
