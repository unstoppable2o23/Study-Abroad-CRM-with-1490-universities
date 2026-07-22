"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, IconButton, MenuItem, Select, FormControl, InputLabel,
  Tab, Tabs, Grid,
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CloudUpload as ImportIcon, CompareArrows as CompareIcon,
} from "@mui/icons-material";

const levelOptions = ["BACHELOR", "MASTER", "PHD", "CERTIFICATION"];
const statusOptions = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "DISABLED"];
const statusColors: Record<string, any> = { DRAFT: "default", PENDING_REVIEW: "warning", PUBLISHED: "success", DISABLED: "error" };

export default function SuperAdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (levelFilter) params.set("level", levelFilter);
    if (catFilter) params.set("category", catFilter);
    Promise.all([
      fetch(`/api/courses?${params}`).then(r => r.json()),
      fetch("/api/courses/categories").then(r => r.json()),
    ]).then(([cd, catd]) => {
      if (cd.success) setCourses(cd.data?.data || []);
      if (catd.success) setCategories(catd.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, levelFilter, catFilter]);

  const openCreate = () => {
    setEditMode("create");
    setEditForm({ name: "", level: "MASTER", category: "", categoryId: "", description: "", duration: "", skills: "", tuitionFeeMin: "", tuitionFeeMax: "", currency: "USD", entranceExams: "", status: "PUBLISHED" });
    setSaveError("");
    setEditOpen(true);
  };

  const openEdit = (c: any) => {
    setEditMode("edit");
    setEditForm({
      id: c.id, name: c.name, level: c.level, category: c.category, categoryId: c.categoryId || "",
      description: c.description || "", duration: c.duration || "",
      skills: (c.skills || []).join(", "),
      tuitionFeeMin: c.tuitionFeeMin || "", tuitionFeeMax: c.tuitionFeeMax || "",
      currency: c.currency || "USD", entranceExams: (c.entranceExams || []).join(", "),
      status: c.status || "PUBLISHED",
    });
    setSaveError("");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const body = {
        ...editForm,
        skills: editForm.skills ? editForm.skills.split(",").map((s: string) => s.trim()) : [],
        entranceExams: editForm.entranceExams ? editForm.entranceExams.split(",").map((s: string) => s.trim()) : [],
        tuitionFeeMin: editForm.tuitionFeeMin || null,
        tuitionFeeMax: editForm.tuitionFeeMax || null,
        countryId: (await (await fetch("/api/countries?limit=1")).json()).data?.[0]?.id,
      };
      const url = editMode === "create" ? "/api/courses" : `/api/courses/${editForm.id}`;
      const method = editMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.success) { setEditOpen(false); fetchData(); }
      else setSaveError(d.error || "Failed to save");
    } catch { setSaveError("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Disable course "${name}"?`)) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch("/api/courses/import/csv", { method: "POST", body: formData });
      const d = await res.json();
      setImportResult(d.success ? d.data : { error: d.error });
    } catch { setImportResult({ error: "Network error" }); }
    setImporting(false);
  };

  const handleCompare = async () => {
    if (compareIds.length < 2) return;
    setCompareLoading(true);
    setCompareResult(null);
    try {
      const res = await fetch("/api/courses/compare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: compareIds }),
      });
      const d = await res.json();
      setCompareResult(d.success ? d.data : null);
    } catch { setCompareResult(null); }
    setCompareLoading(false);
  };

  const toggleCompareId = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Course Management</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<CompareIcon />} onClick={() => { setCompareOpen(true); setCompareResult(null); }}>
            Compare ({compareIds.length})
          </Button>
          <Button variant="outlined" startIcon={<ImportIcon />} onClick={() => { setImportOpen(true); setImportResult(null); }}>
            Import CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Course</Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Courses" />
        <Tab label="Categories" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Search courses" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Level</InputLabel>
              <Select value={levelFilter} label="Level" onChange={(e) => setLevelFilter(e.target.value)}>
                <MenuItem value="">All Levels</MenuItem>
                {levelOptions.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select value={catFilter} label="Category" onChange={(e) => setCatFilter(e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c: any) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input type="checkbox" onChange={(e) => { if (e.target.checked) setCompareIds(courses.map((c: any) => c.id)); else setCompareIds([]); }} />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Fees</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : courses.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center">No courses found. Create one or import from CSV.</TableCell></TableRow>
                ) : courses.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell padding="checkbox">
                      <input type="checkbox" checked={compareIds.includes(c.id)} onChange={() => toggleCompareId(c.id)} />
                    </TableCell>
                    <TableCell><strong>{c.name}</strong></TableCell>
                    <TableCell><Chip label={c.level} size="small" variant="outlined" /></TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.duration || "-"}</TableCell>
                    <TableCell>{c.tuitionFeeMin ? `${c.currency || "USD"} ${c.tuitionFeeMin.toLocaleString()} - ${c.tuitionFeeMax?.toLocaleString() || ""}` : "-"}</TableCell>
                    <TableCell><Chip label={c.status || "PUBLISHED"} color={statusColors[c.status] || "default"} size="small" /></TableCell>
                    <TableCell>{(c.skills || []).slice(0, 2).join(", ")}{c.skills?.length > 2 ? "..." : ""}</TableCell>
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
          <Typography variant="h6" gutterBottom>Course Categories</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Courses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat: any) => (
                  <TableRow key={cat.id}>
                    <TableCell><strong>{cat.name}</strong></TableCell>
                    <TableCell><Chip label={cat.slug} size="small" variant="outlined" /></TableCell>
                    <TableCell>{cat.description || "-"}</TableCell>
                    <TableCell>{cat._count?.courses || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode === "create" ? "Add Course" : "Edit Course"}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Course Name" required value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select value={editForm.level || "MASTER"} label="Level" onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                  {levelOptions.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={editForm.category || ""} label="Category" onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  {categories.map((c: any) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status || "PUBLISHED"} label="Status" onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField fullWidth label="Description" multiline rows={2} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Duration (e.g. 2 years)" value={editForm.duration || ""} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} />
              <TextField fullWidth label="Currency" value={editForm.currency || "USD"} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Min Fee (USD)" type="number" value={editForm.tuitionFeeMin || ""} onChange={(e) => setEditForm({ ...editForm, tuitionFeeMin: e.target.value })} />
              <TextField fullWidth label="Max Fee (USD)" type="number" value={editForm.tuitionFeeMax || ""} onChange={(e) => setEditForm({ ...editForm, tuitionFeeMax: e.target.value })} />
            </Box>
            <TextField fullWidth label="Skills (comma separated)" value={editForm.skills || ""} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
            <TextField fullWidth label="Entrance Exams (comma separated)" value={editForm.entranceExams || ""} onChange={(e) => setEditForm({ ...editForm, entranceExams: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Courses (CSV)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            CSV must have columns: name, level, category, description, duration, fees, currency, skills, country
          </Typography>
          <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
          {importResult && (
            <Box sx={{ mt: 2 }}>
              {importResult.error ? (
                <Alert severity="error">{importResult.error}</Alert>
              ) : (
                <Alert severity="success">
                  Imported: {importResult.created}, Skipped: {importResult.skipped}, Total: {importResult.total}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleImport} disabled={!importFile || importing}>
            {importing ? <CircularProgress size={20} /> : "Import"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Course Comparison</DialogTitle>
        <DialogContent>
          {compareIds.length < 2 && !compareResult && (
            <Typography color="text.secondary">Select 2-5 courses using the checkboxes to compare.</Typography>
          )}
          {compareIds.length >= 2 && !compareResult && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Button variant="contained" onClick={handleCompare} disabled={compareLoading}>
                {compareLoading ? <CircularProgress size={20} /> : `Compare ${compareIds.length} Courses`}
              </Button>
            </Box>
          )}
          {compareResult && (
            <Box>
              <Typography variant="h6" gutterBottom>Comparison Results</Typography>
              <Grid container spacing={2}>
                {compareResult.courses?.map((c: any) => (
                  <Grid size={{ xs: 12, md: 6 }} key={c.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1"><strong>{c.name}</strong></Typography>
                      <Typography variant="body2">Level: {c.level}</Typography>
                      <Typography variant="body2">Category: {c.category}</Typography>
                      <Typography variant="body2">Duration: {c.duration}</Typography>
                      <Typography variant="body2">Fees: {c.tuitionFeeMin ? `${c.currency} ${c.tuitionFeeMin.toLocaleString()} - ${c.tuitionFeeMax?.toLocaleString()}` : "N/A"}</Typography>
                      <Typography variant="body2">Country: {c.country || "N/A"}</Typography>
                      <Typography variant="body2">University: {c.university || "N/A"}</Typography>
                      <Typography variant="body2">Careers: {c.careers?.join(", ") || "N/A"}</Typography>
                      <Typography variant="body2">Universities offering: {c.universityCount}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2"><strong>Skills:</strong></Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {(c.skills || []).map((s: string) => <Chip key={s} label={s} size="small" />)}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {compareResult.differences && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Key Differences:</Typography>
                  {compareResult.differences.levels?.length > 1 && <Typography variant="body2">• Different levels: {compareResult.differences.levels.join(", ")}</Typography>}
                  {compareResult.differences.categories?.length > 1 && <Typography variant="body2">• Different categories</Typography>}
                  {compareResult.differences.countries?.length > 1 && <Typography variant="body2">• Different countries: {compareResult.differences.countries.join(", ")}</Typography>}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareOpen(false)}>Close</Button>
          {compareResult && <Button onClick={() => setCompareResult(null)}>New Comparison</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
