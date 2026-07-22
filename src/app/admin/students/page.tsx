"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, Button, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, IconButton, InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, PersonAdd as PersonAddIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  REGISTERED: "#9e9e9e", PROFILE_INCOMPLETE: "#ff9800", DOCUMENTS_PENDING: "#2196f3",
  DOCUMENTS_APPROVED: "#4caf50", PSYCHOMETRIC_ASSIGNED: "#9c27b0", PSYCHOMETRIC_COMPLETED: "#2196f3",
  COUNSELING_IN_PROGRESS: "#2196f3",
  APPLICATIONS_STARTED: "#667eea", APPLICATIONS_SUBMITTED: "#2196f3", OFFER_RECEIVED: "#4caf50",
  VISA_PROCESSING: "#ff9800", VISA_APPROVED: "#4caf50", ENROLLED: "#4caf50", CLOSED: "#9e9e9e",
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", mobile: "", username: "", password: "" });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page + 1), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/students?${params}`).then((r) => r.json()).then((d) => {
      if (d.success) { setStudents(d.data.data); setTotal(d.data.total); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [page, search, statusFilter]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");
    try {
      const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
      const d = await res.json();
      if (d.success) {
        setCreateSuccess(`Student ${createForm.fullName} created successfully!`);
        setCreateForm({ fullName: "", email: "", mobile: "", username: "", password: "" });
        setCreateOpen(false);
        fetchStudents();
      } else {
        setCreateError(d.error || d.errors?.password?.join(", ") || "Failed to create");
      }
    } catch { setCreateError("Network error"); }
    setCreating(false);
  };

  const inputSx = { "& .MuiOutlinedInput-root": { bgcolor: "action.hover", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "action.active" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiInputLabel-root": { color: "text.secondary" }, "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" }, "& .MuiSelect-icon": { color: "text.disabled" } };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 6, height: 36, borderRadius: 3, background: "linear-gradient(180deg, #667eea, #764ba2)", display: { xs: "none", sm: "block" } }} />
          <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>Student Management</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStudents} sx={{ borderRadius: 2, borderColor: "divider", color: "text.secondary", flex: { xs: 1, sm: "none" }, "&:hover": { borderColor: "text.disabled" } }}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => { setBulkOpen(true); setBulkFile(null); setBulkResults(null); setBulkError(""); }} sx={{ borderRadius: 2, borderColor: "divider", color: "text.secondary", flex: { xs: 1, sm: "none" }, "&:hover": { borderColor: "text.disabled" } }}>
            Bulk Upload
          </Button>
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, flex: { xs: 1, sm: "none" }, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
            Create Student
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          size="small" fullWidth placeholder="Search by name or email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={inputSx}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} /></InputAdornment> } }}
        />
        <TextField size="small" label="Status" select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ minWidth: { xs: "100%", sm: 180 }, ...inputSx }} slotProps={{ select: { native: true } }}>
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map((s) => (<option key={s} value={s}>{s}</option>))}
        </TextField>
      </Box>

      {createSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, bgcolor: "rgba(76,175,80,0.12)", color: "#4caf50", "& .MuiAlert-icon": { color: "#4caf50" } }}>{createSuccess}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 650, sm: "100%" } }}>
            <TableHead>
              <TableRow>
                {["Name", "Email", "Mobile", "Country", "Status", "Docs", "Apps", "Joined"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", borderColor: "divider", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ borderColor: "divider" }}><CircularProgress size={24} sx={{ color: "primary.main", my: 2 }} /></TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ color: "text.disabled", py: 4, borderColor: "divider" }}>No students found</TableCell></TableRow>
              ) : students.map((s: any) => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" }, "& td": { borderColor: "divider" } }}
                  onClick={() => router.push(`/admin/students/${s.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{s.fullName}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s.email}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s.mobile || "-"}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s.country || "-"}</TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" sx={{ fontWeight: 600, bgcolor: `${statusColors[s.status] || "#9e9e9e"}22`, color: statusColors[s.status] || "#9e9e9e", border: `1px solid ${statusColors[s.status] || "#9e9e9e"}44` }} />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s._count?.documents || 0}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s._count?.applications || 0}</TableCell>
                  <TableCell sx={{ color: "text.disabled", fontSize: "0.8rem" }}>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20} rowsPerPageOptions={[20]}
          sx={{ color: "text.secondary", borderColor: "divider", "& .MuiTablePagination-selectIcon": { color: "text.disabled" }, "& .MuiIconButton-root": { color: "text.secondary" } }}
        />
      </Paper>

      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "background.default", border: "1px solid", borderColor: "divider", backgroundImage: "none", minHeight: 300 } } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <UploadFileIcon sx={{ color: "#667eea" }} /> Bulk Upload Students
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {bulkError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{bulkError}</Alert>}

          {!bulkResults ? (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                Upload a CSV file with student data. <strong>Required columns:</strong> fullName, email, password. <strong>Optional:</strong> mobile, username, country, preferredCourse, preferredCountry.
              </Typography>
              <Typography variant="body2" sx={{ color: "text.disabled", mb: 2, fontSize: "0.78rem" }}>
                <a href="/demo-students.csv" download style={{ color: "#667eea" }}>Download demo.csv</a> for a sample file
              </Typography>
              <Box sx={{ border: "2px dashed", borderColor: "divider", borderRadius: 3, p: 4, textAlign: "center", bgcolor: "action.hover" }}>
                <input
                  accept=".csv"
                  style={{ display: "none" }}
                  id="bulk-csv-input"
                  type="file"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="bulk-csv-input">
                  <Button variant="outlined" component="span" sx={{ borderRadius: 2, borderColor: "divider", mb: 1 }}>
                    {bulkFile ? bulkFile.name : "Choose CSV File"}
                  </Button>
                </label>
                {bulkFile && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                    {(bulkFile.size / 1024).toFixed(1)} KB
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Chip label={`${bulkResults.total} total`} size="small" sx={{ fontWeight: 600 }} />
                <Chip label={`${bulkResults.valid} valid`} size="small" sx={{ fontWeight: 600, bgcolor: "rgba(76,175,80,0.12)", color: "#4caf50" }} />
                {bulkResults.invalid > 0 && (
                  <Chip label={`${bulkResults.invalid} errors`} size="small" sx={{ fontWeight: 600, bgcolor: "rgba(244,67,54,0.12)", color: "#f44336" }} />
                )}
              </Box>
              <TableContainer sx={{ maxHeight: 350, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Row</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkResults.results.map((r: any) => (
                      <TableRow key={r.row} sx={{ bgcolor: r.status === "error" ? "rgba(244,67,54,0.03)" : "transparent" }}>
                        <TableCell sx={{ color: "text.disabled", fontSize: "0.78rem" }}>{r.row}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{r.fullName}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem" }}>{r.email}</TableCell>
                        <TableCell>
                          {r.status === "valid" ? (
                            <Chip label="Valid" size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: "rgba(76,175,80,0.12)", color: "#4caf50", height: 22 }} />
                          ) : (
                            <Box>
                              <Chip label="Error" size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: "rgba(244,67,54,0.12)", color: "#f44336", height: 22, mb: 0.5 }} />
                              {r.errors.map((e: string, ei: number) => (
                                <Typography key={ei} variant="caption" sx={{ display: "block", color: "#f44336", fontSize: "0.7rem", lineHeight: 1.3 }}>{e}</Typography>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
          <Button onClick={() => setBulkOpen(false)} sx={{ color: "text.secondary" }}>Close</Button>
          {!bulkResults && (
            <Button variant="contained" disabled={!bulkFile || bulkLoading} onClick={async () => {
              if (!bulkFile) return;
              setBulkLoading(true);
              setBulkError("");
              const fd = new FormData();
              fd.append("file", bulkFile);
              try {
                const res = await fetch("/api/admin/students/bulk", { method: "POST", body: fd });
                const d = await res.json();
                if (d.success) setBulkResults(d);
                else setBulkError(d.error || "Upload failed");
              } catch { setBulkError("Network error"); }
              setBulkLoading(false);
            }} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
              {bulkLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Validate & Preview"}
            </Button>
          )}
          {bulkResults && !bulkResults.confirmed && !bulkResults.hasErrors && (
            <Button variant="contained" onClick={async () => {
              setBulkLoading(true);
              const fd = new FormData();
              fd.append("file", bulkFile!);
              fd.append("confirm", "true");
              try {
                const res = await fetch("/api/admin/students/bulk", { method: "POST", body: fd });
                const d = await res.json();
                if (d.success) { setBulkResults(d); fetchStudents(); }
                else setBulkError(d.error || "Creation failed");
              } catch { setBulkError("Network error"); }
              setBulkLoading(false);
            }} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
              {bulkLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : `Create ${bulkResults.valid} Students`}
            </Button>
          )}
          {bulkResults?.confirmed && (
            <Alert severity="success" sx={{ flex: 1, borderRadius: 2, bgcolor: "rgba(76,175,80,0.12)", color: "#4caf50", "& .MuiAlert-icon": { color: "#4caf50" } }}>
              {bulkResults.createdCount} students created successfully{bulkResults.skippedCount > 0 ? ` (${bulkResults.skippedCount} skipped due to errors)` : ""}
            </Alert>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "background.default", border: "1px solid", borderColor: "divider", backgroundImage: "none" } } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider" }}>Create Student Account</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {createError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{createError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {[{ key: "fullName", label: "Full Name", required: true }, { key: "email", label: "Email", type: "email", required: true }, { key: "mobile", label: "Mobile" }, { key: "username", label: "Username" }, { key: "password", label: "Initial Password", type: "password", required: true, helper: "Min 8 chars, uppercase, lowercase, number, special character" }].map((f) => (
              <TextField key={f.key} label={f.label} fullWidth required={f.required} type={f.type || "text"} value={(createForm as any)[f.key]} onChange={(e) => setCreateForm({ ...createForm, [f.key]: e.target.value })} helperText={f.helper} sx={{ ...inputSx, "& .MuiFormHelperText-root": { color: "text.disabled" } }} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
            {creating ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
