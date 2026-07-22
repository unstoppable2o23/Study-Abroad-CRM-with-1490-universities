"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, IconButton, MenuItem, Select, FormControl, InputLabel, Grid, Card, CardContent, CardActions, Divider, Collapse,
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as UploadIcon,
  CompareArrows as CompareIcon, School as SchoolIcon, ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

const typeLabels: Record<string, string> = {
  CENTRAL: "Central Universities",
  STATE: "State Universities",
  DEEMED: "Deemed Universities",
  PRIVATE: "Private Universities",
  INSTITUTE_OF_NATIONAL_IMPORTANCE: "Institutes of National Importance",
  AUTONOMOUS: "Autonomous Colleges",
};
const typeOrder = ["CENTRAL", "STATE", "DEEMED", "INSTITUTE_OF_NATIONAL_IMPORTANCE", "PRIVATE", "AUTONOMOUS"];
const typeColors: Record<string, string> = {
  CENTRAL: "#667eea",
  STATE: "#43e97b",
  DEEMED: "#f093fb",
  PRIVATE: "#4facfe",
  INSTITUTE_OF_NATIONAL_IMPORTANCE: "#fa709a",
  AUTONOMOUS: "#fee140",
};

const statusColors: Record<string, string> = {
  DRAFT: "default", PENDING_REVIEW: "warning", APPROVED: "success", PUBLISHED: "primary", DISABLED: "error",
};
const visibilityOptions = ["GLOBAL", "POPULAR", "STUDY_DESTINATION"];
const statusOptions = ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "DISABLED"];
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export default function SuperAdminUniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<any[]>([]);

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["CENTRAL", "STATE", "DEEMED", "INSTITUTE_OF_NATIONAL_IMPORTANCE", "PRIVATE", "AUTONOMOUS", "Other Indian Universities", "International Universities"]));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: "1", limit: "2000" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (stateFilter) params.set("state", stateFilter);
    Promise.all([
      fetch(`/api/universities?${params}`).then(r => r.json()),
      fetch("/api/countries").then(r => r.json()),
    ]).then(([uniRes, countryRes]) => {
      if (uniRes.success) { setUniversities(uniRes.data.data); setTotal(uniRes.data.total); }
      if (countryRes.success) setCountries(countryRes.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, stateFilter]);

  const openCreate = () => {
    setEditMode("create");
    setEditForm({ name: "", countryId: "", city: "", description: "", website: "", ranking: "", rankingSource: "", intakePeriods: "", applicationFee: "", status: "PUBLISHED", visibility: "GLOBAL" });
    setSaveError("");
    setEditOpen(true);
  };

  const openEdit = (uni: any) => {
    setEditMode("edit");
    setEditForm({
      id: uni.id, name: uni.name, countryId: uni.countryId, city: uni.city || "", description: uni.description || "",
      website: uni.website || "", ranking: uni.ranking || "", rankingSource: uni.rankingSource || "",
      intakePeriods: (uni.intakePeriods || []).join(", "), applicationFee: uni.applicationFee || "",
      status: uni.status || "PUBLISHED", visibility: uni.visibility || "GLOBAL",
    });
    setSaveError("");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const body = { ...editForm, intakePeriods: editForm.intakePeriods.split(",").map((s: string) => s.trim()).filter(Boolean) };
      const url = editMode === "create" ? "/api/universities" : `/api/universities/${editForm.id}`;
      const method = editMode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.success) { setEditOpen(false); fetchData(); }
      else setSaveError(d.error || "Failed to save");
    } catch { setSaveError("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    const res = await fetch(`/api/universities/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/universities/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchData();
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch("/api/universities/import/csv", { method: "POST", body: formData });
      const d = await res.json();
      if (d.success) setImportResult(d.data);
      else setImportResult({ error: d.error });
      fetchData();
    } catch { setImportResult({ error: "Network error" }); }
    setImporting(false);
  };

  const handleCompare = async () => {
    const res = await fetch("/api/universities/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: compareIds }) });
    const d = await res.json();
    if (d.success) setCompareResult(d.data);
  };

  const toggleGroupExpand = (label: string) => {
    setExpandedGroups(prev => { const next = new Set(prev); next.has(label) ? next.delete(label) : next.add(label); return next; });
  };

  const getVisibleCount = (label: string) => visibleCounts[label] || 100;
  const showMore = (label: string) => setVisibleCounts(prev => ({ ...prev, [label]: (prev[label] || 100) + 100 }));

  const groups = useMemo(() => {
    const indian = universities.filter((u: any) => u.country?.code === "IN");
    const international = universities.filter((u: any) => u.country?.code !== "IN");
    const grouped: { label: string; items: any[]; untyped?: boolean }[] = [];
    for (const t of typeOrder) {
      const items = indian.filter((u: any) => u.universityType === t);
      if (items.length) grouped.push({ label: typeLabels[t] || t, items });
    }
    const untypedIndian = indian.filter((u: any) => !u.universityType);
    if (untypedIndian.length) grouped.push({ label: "Other Indian Universities", items: untypedIndian, untyped: true });
    if (international.length) grouped.push({ label: "International Universities", items: international });
    return grouped;
  }, [universities]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>University Management</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => setImportOpen(true)} sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.15)" }}>Import CSV</Button>
          <Button variant="outlined" size="small" startIcon={<CompareIcon />} onClick={() => setCompareOpen(true)} sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.15)" }}>Compare</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>Add University</Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small" sx={{ minWidth: 260, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.04)", color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } } }}
          slotProps={{ inputLabel: { sx: { color: "rgba(255,255,255,0.4)" } } }}
          label="Search universities" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: "rgba(255,255,255,0.4)" }}>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } }}>
            <MenuItem value="">All Statuses</MenuItem>
            {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel sx={{ color: "rgba(255,255,255,0.4)" }}>State</InputLabel>
          <Select value={stateFilter} label="State" onChange={(e) => { setStateFilter(e.target.value); setPage(0); }} sx={{ color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } }}>
            <MenuItem value="">All States</MenuItem>
            {indianStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>{total} universities</Typography>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress sx={{ color: "#667eea" }} /></Box>
      ) : groups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}><Typography sx={{ color: "rgba(255,255,255,0.4)" }}>No universities found</Typography></Paper>
      ) : (
        <>
          {groups.map((g, gi) => {
            const isExpanded = expandedGroups.has(g.label);
            return (
              <Box key={gi} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, cursor: "pointer", userSelect: "none" }} onClick={() => toggleGroupExpand(g.label)}>
                <IconButton size="small" onClick={() => toggleGroupExpand(g.label)} sx={{ color: "rgba(255,255,255,0.4)", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}><ExpandMoreIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", flex: 1 }}>{g.label}</Typography>
                <Chip label={g.items.length} size="small" sx={{ bgcolor: "rgba(102,126,234,0.12)", color: "#667eea", fontWeight: 700, borderRadius: "8px" }} />
              </Box>
              <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Collapse in={isExpanded}>
              <Grid container spacing={2.5}>
                {g.items.slice(0, getVisibleCount(g.label)).map((u: any) => {
                  const tc = typeColors[u.universityType] || "#667eea";
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={u.id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, backdropFilter: "blur(8px)", transition: "all 0.3s", "&:hover": { borderColor: `${tc}40`, transform: "translateY(-2px)", boxShadow: `0 8px 24px rgba(0,0,0,0.2)` } }}>
                        <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: tc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                              <SchoolIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</Typography>
                              <Typography variant="caption" sx={{ color: tc, fontWeight: 600 }}>
                                {u.universityType?.replace(/_/g, " ") || u.country?.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1 }}>
                            <Chip label={u.country?.name || "-"} size="small" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }} />
                            {u.city && <Chip label={u.city} size="small" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }} />}
                            {u.state && <Chip label={u.state} size="small" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(67,233,123,0.8)", fontSize: "0.7rem" }} />}
                            {u.ranking && <Chip label={`#${u.ranking}`} size="small" sx={{ bgcolor: "rgba(250,112,154,0.1)", color: "#fa709a", fontWeight: 600, fontSize: "0.7rem" }} />}
                          </Box>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1 }}>
                            <Chip label={u.status || "PUBLISHED"} size="small" color={(statusColors[u.status || "PUBLISHED"] as any) || "default"} variant="filled" sx={{ fontSize: "0.7rem", fontWeight: 600 }} />
                            <Chip label={u.visibility || "GLOBAL"} size="small" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.1)", color: u.visibility === "POPULAR" ? "#4facfe" : "rgba(255,255,255,0.5)", fontSize: "0.7rem" }} />
                            <Chip label={`${u._count?.courses || 0} courses`} size="small" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }} />
                          </Box>
                          {u.website && (
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                              <a href={u.website} target="_blank" rel="noreferrer" style={{ color: "#667eea" }}>{u.website}</a>
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ px: 2.5, pb: 1.5, pt: 0, justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#667eea" } }}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleDelete(u.id, u.name)} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#f5576c" } }}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <Select
                              value={u.status || "PUBLISHED"}
                              onChange={(e) => handleStatusChange(u.id, e.target.value)}
                              sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", "& fieldset": { borderColor: "rgba(255,255,255,0.08)" }, "& .MuiSelect-icon": { color: "rgba(255,255,255,0.3)" } }}
                            >
                              {statusOptions.map(s => <MenuItem key={s} value={s} sx={{ fontSize: "0.75rem" }}>{s}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {g.items.length > getVisibleCount(g.label) && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button size="small" onClick={() => showMore(g.label)} sx={{ color: "#667eea", borderColor: "rgba(102,126,234,0.3)", "&:hover": { borderColor: "#667eea", bgcolor: "rgba(102,126,234,0.06)" } }} variant="outlined">
                    View More ({g.items.length - getVisibleCount(g.label)} remaining)
                  </Button>
                </Box>
              )}
              </Collapse>
            </Box>
            );
          })}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>{total} universities total</Typography>
          </Box>
        </>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode === "create" ? "Add University" : "Edit University"}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="University Name" fullWidth required value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select value={editForm.countryId || ""} label="Country" onChange={(e) => setEditForm({ ...editForm, countryId: e.target.value })}>
                  {countries.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth label="City" value={editForm.city || ""} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
            </Box>
            <TextField fullWidth label="Website" value={editForm.website || ""} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
            <TextField fullWidth label="Description" multiline rows={3} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Ranking" type="number" value={editForm.ranking || ""} onChange={(e) => setEditForm({ ...editForm, ranking: e.target.value })} />
              <TextField fullWidth label="Ranking Source" value={editForm.rankingSource || ""} onChange={(e) => setEditForm({ ...editForm, rankingSource: e.target.value })} />
            </Box>
            <TextField fullWidth label="Intake Periods (comma separated)" value={editForm.intakePeriods || ""} onChange={(e) => setEditForm({ ...editForm, intakePeriods: e.target.value })} helperText="e.g. Fall, Spring, Summer" />
            <TextField fullWidth label="Application Fee" type="number" value={editForm.applicationFee || ""} onChange={(e) => setEditForm({ ...editForm, applicationFee: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status || "PUBLISHED"} label="Status" onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select value={editForm.visibility || "GLOBAL"} label="Visibility" onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}>
                  {visibilityOptions.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Universities via CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            CSV must include columns: name, country, city, website, ranking, description. Max 50MB.
          </Typography>
          <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
          {importResult && (
            <Box sx={{ mt: 2 }}>
              {importResult.error ? (
                <Alert severity="error">{importResult.error}</Alert>
              ) : (
                <Alert severity={importResult.errors > 0 ? "warning" : "success"}>
                  Created: {importResult.created} | Duplicates: {importResult.duplicates} | Errors: {importResult.errors}
                  {importResult.errors_list?.length > 0 && (
                    <Box sx={{ mt: 1, maxHeight: 150, overflow: "auto" }}>
                      {importResult.errors_list.map((e: string, i: number) => <Typography key={i} variant="caption" sx={{ display: "block" }}>{e}</Typography>)}
                    </Box>
                  )}
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

      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compare Universities</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select 2-5 universities to compare.</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            {universities.slice(0, 20).map((u: any) => (
              <Button
                key={u.id}
                variant={compareIds.includes(u.id) ? "contained" : "outlined"}
                size="small"
                onClick={() => setCompareIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
              >
                {u.name}
              </Button>
            ))}
          </Box>
          <Button variant="contained" onClick={handleCompare} disabled={compareIds.length < 2}>Compare</Button>

          {compareResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Comparison Result</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  <Grid size={3}><Typography variant="caption" sx={{ fontWeight: 700 }}>Field</Typography></Grid>
                  {compareResult.universities.map((u: any) => (
                    <Grid size={3} key={u.id}><Typography variant="caption" sx={{ fontWeight: 700 }}>{u.name}</Typography></Grid>
                  ))}
                  {["Country", "City", "Website", "Ranking", "Courses", "Scholarships", "App Fee", "Living Cost"].map((field) => (
                    <>
                      <Grid size={3}><Typography variant="caption" sx={{ color: "text.secondary" }}>{field}</Typography></Grid>
                      {compareResult.universities.map((u: any) => (
                        <Grid size={3} key={u.id}><Typography variant="caption">{String(u[field.toLowerCase().replace(/\s+/g, "")] || "-")}</Typography></Grid>
                      ))}
                    </>
                  ))}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCompareOpen(false); setCompareResult(null); setCompareIds([]); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
