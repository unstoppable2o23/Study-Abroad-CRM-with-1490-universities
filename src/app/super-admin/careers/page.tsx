"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, IconButton, MenuItem, Select, FormControl, InputLabel, Tab, Tabs,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

const statusOptions = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "DISABLED"];
const statusColors: Record<string, any> = { DRAFT: "default", PENDING_REVIEW: "warning", PUBLISHED: "success", DISABLED: "error" };

export default function SuperAdminCareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [tabValue, setTabValue] = useState(0);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter) params.set("categoryId", catFilter);
    Promise.all([
      fetch(`/api/careers?${params}`).then(r => r.json()),
      fetch("/api/careers/categories").then(r => r.json()),
    ]).then(([cd, catd]) => {
      if (cd.success) setCareers(cd.data || []);
      if (catd.success) setCategories(catd.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, catFilter]);

  const openCreate = () => {
    setEditMode("create");
    setEditForm({ name: "", description: "", skills: "", eligibility: "", futureScope: "", industry: "", minEducation: "", recruiters: "", categoryId: "", isEmerging: false, status: "PUBLISHED", salaryEntry: "", salaryMid: "", salarySenior: "", salaryTop: "" });
    setSaveError("");
    setEditOpen(true);
  };

  const openEdit = (c: any) => {
    const st = c.salaryTrends || {};
    setEditMode("edit");
    setEditForm({
      id: c.id, name: c.name, description: c.description || "", categoryId: c.categoryId || "",
      skills: (c.skills || []).join(", "), eligibility: c.eligibility || "",
      futureScope: c.futureScope || "", industry: c.industry || "", minEducation: c.minEducation || "",
      recruiters: (c.recruiters || []).join(", "), isEmerging: c.isEmerging || false,
      status: c.status || "PUBLISHED",
      salaryEntry: st.entry || "", salaryMid: st.mid || "", salarySenior: st.senior || "", salaryTop: st.top || "",
    });
    setSaveError("");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        name: editForm.name, description: editForm.description, categoryId: editForm.categoryId || null,
        skills: editForm.skills ? editForm.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        eligibility: editForm.eligibility, futureScope: editForm.futureScope,
        industry: editForm.industry, minEducation: editForm.minEducation,
        recruiters: editForm.recruiters ? editForm.recruiters.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        isEmerging: editForm.isEmerging, status: editForm.status,
        salaryTrends: {
          entry: editForm.salaryEntry ? parseFloat(editForm.salaryEntry) : null,
          mid: editForm.salaryMid ? parseFloat(editForm.salaryMid) : null,
          senior: editForm.salarySenior ? parseFloat(editForm.salarySenior) : null,
          top: editForm.salaryTop ? parseFloat(editForm.salaryTop) : null,
        },
      };

      const url = editMode === "create" ? "/api/careers" : `/api/careers/${editForm.id}`;
      const method = editMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) { setEditOpen(false); fetchData(); }
      else setSaveError(d.error || "Failed to save");
    } catch { setSaveError("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Disable career "${name}"?`)) return;
    await fetch(`/api/careers/${id}`, { method: "DELETE" });
    fetchData();
  };

  const salaryLabel = (st: any) => {
    if (!st) return "-";
    return `$${(st.entry || 0).toLocaleString()} - $${(st.senior || 0).toLocaleString()}`;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Career Library Management</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Career</Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Careers" />
        <Tab label="Categories" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Search careers" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select value={catFilter} label="Category" onChange={(e) => setCatFilter(e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Salary Range</TableCell>
                  <TableCell>Emerging</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : careers.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center">No careers found</TableCell></TableRow>
                ) : careers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell><strong>{c.name}</strong></TableCell>
                    <TableCell>{c.categoryRef?.name || "-"}</TableCell>
                    <TableCell>{c.industry || "-"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {(c.skills || []).slice(0, 3).map((s: string) => <Chip key={s} label={s} size="small" variant="outlined" />)}
                        {(c.skills?.length || 0) > 3 && <Chip label={`+${c.skills.length - 3}`} size="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>{salaryLabel(c.salaryTrends)}</TableCell>
                    <TableCell>{c.isEmerging ? <Chip label="Emerging" color="warning" size="small" /> : "-"}</TableCell>
                    <TableCell><Chip label={c.status || "PUBLISHED"} color={statusColors[c.status] || "default"} size="small" /></TableCell>
                    <TableCell>{c._count?.courses || 0}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(c)}><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(c.id, c.name)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Career Categories</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Careers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat: any) => (
                  <TableRow key={cat.id}>
                    <TableCell><strong>{cat.name}</strong></TableCell>
                    <TableCell><Chip label={cat.slug} size="small" variant="outlined" /></TableCell>
                    <TableCell>{cat.description || "-"}</TableCell>
                    <TableCell>{cat._count?.careers || 0}</TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center">No categories. Run prisma seed to create them.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode === "create" ? "Add Career" : "Edit Career"}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField fullWidth label="Career Name" required value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={editForm.categoryId || ""} label="Category" onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}>
                  <MenuItem value="">None</MenuItem>
                  {categories.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status || "PUBLISHED"} label="Status" onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Industry" value={editForm.industry || ""} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} />
              <TextField fullWidth label="Min Education Required" value={editForm.minEducation || ""} onChange={(e) => setEditForm({ ...editForm, minEducation: e.target.value })} />
            </Box>
            <TextField fullWidth label="Description" multiline rows={2} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <TextField fullWidth label="Skills (comma separated)" value={editForm.skills || ""} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
            <TextField fullWidth label="Eligibility" multiline rows={2} value={editForm.eligibility || ""} onChange={(e) => setEditForm({ ...editForm, eligibility: e.target.value })} />
            <TextField fullWidth label="Future Scope" multiline rows={2} value={editForm.futureScope || ""} onChange={(e) => setEditForm({ ...editForm, futureScope: e.target.value })} />
            <TextField fullWidth label="Recruiters (comma separated)" value={editForm.recruiters || ""} onChange={(e) => setEditForm({ ...editForm, recruiters: e.target.value })} />
            <Typography variant="subtitle2">Salary Trends (USD)</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Entry Level" type="number" value={editForm.salaryEntry || ""} onChange={(e) => setEditForm({ ...editForm, salaryEntry: e.target.value })} />
              <TextField fullWidth label="Mid Level" type="number" value={editForm.salaryMid || ""} onChange={(e) => setEditForm({ ...editForm, salaryMid: e.target.value })} />
              <TextField fullWidth label="Senior Level" type="number" value={editForm.salarySenior || ""} onChange={(e) => setEditForm({ ...editForm, salarySenior: e.target.value })} />
              <TextField fullWidth label="Top Level" type="number" value={editForm.salaryTop || ""} onChange={(e) => setEditForm({ ...editForm, salaryTop: e.target.value })} />
            </Box>
            <Button variant={editForm.isEmerging ? "contained" : "outlined"} color="warning" onClick={() => setEditForm({ ...editForm, isEmerging: !editForm.isEmerging })}>
              {editForm.isEmerging ? "✓ Emerging Career" : "Mark as Emerging"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !editForm.name}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
