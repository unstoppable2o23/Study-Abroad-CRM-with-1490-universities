"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, TextField, Chip, Card, CardContent, CircularProgress, Button, Divider, Collapse, IconButton,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { School as SchoolIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useThemeMode } from "@/lib/theme-context";

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
  CENTRAL: "#667eea", STATE: "#43e97b", DEEMED: "#f093fb", PRIVATE: "#4facfe",
  INSTITUTE_OF_NATIONAL_IMPORTANCE: "#fa709a", AUTONOMOUS: "#fee140",
};
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(typeOrder));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const c = (d: string, l: string) => isDark ? d : l;

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page + 1), limit: "50" });
    if (search) params.set("search", search);
    if (stateFilter) params.set("state", stateFilter);
    fetch(`/api/admin/universities?${params}`).then(r => r.json()).then(d => {
      if (d.success) { setUniversities(d.data.data); setTotal(d.data.total); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, search, stateFilter]);

  const toggleGroupExpand = (label: string) => {
    setExpandedGroups(prev => { const next = new Set(prev); next.has(label) ? next.delete(label) : next.add(label); return next; });
  };

  const getVisibleCount = (label: string) => visibleCounts[label] || 100;
  const showMore = (label: string) => setVisibleCounts(prev => ({ ...prev, [label]: (prev[label] || 100) + 100 }));

  const groups = useMemo(() => {
    const indian = universities.filter((u: any) => u.country?.code === "IN" && u.universityType);
    const international = universities.filter((u: any) => u.country?.code !== "IN" || !u.universityType);
    const grouped: { label: string; items: any[] }[] = [];
    for (const t of typeOrder) {
      const items = indian.filter((u: any) => u.universityType === t);
      if (items.length) grouped.push({ label: typeLabels[t] || t, items });
    }
    if (international.length) grouped.push({ label: "International Universities", items: international });
    return grouped;
  }, [universities]);

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: "text.primary" }}>University Directory</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small" fullWidth
          sx={{ maxWidth: 400, "& .MuiOutlinedInput-root": { bgcolor: inputBg, color: "text.primary", "& fieldset": { borderColor }, "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" } } }}
          slotProps={{ inputLabel: { sx: { color: "text.secondary" } } }}
          label="Search universities" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel sx={{ color: "text.secondary" }}>State</InputLabel>
          <Select value={stateFilter} label="State" onChange={(e) => { setStateFilter(e.target.value); setPage(0); }} sx={{ color: "text.primary", "& fieldset": { borderColor } }}>
            <MenuItem value="">All States</MenuItem>
            {indianStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.disabled">{total} universities</Typography>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress sx={{ color: "#667eea" }} /></Box>
      ) : groups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: cardBg, border: `1px solid ${borderColor}` }}><Typography color="text.secondary">No universities found</Typography></Paper>
      ) : (
        <>
          {groups.map((g, gi) => {
            const isExpanded = expandedGroups.has(g.label);
            return (
            <Box key={gi} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, cursor: "pointer", userSelect: "none" }} onClick={() => toggleGroupExpand(g.label)}>
                <IconButton size="small" onClick={() => toggleGroupExpand(g.label)} sx={{ color: "text.disabled", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}><ExpandMoreIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", flex: 1 }}>{g.label}</Typography>
                <Chip label={g.items.length} size="small" sx={{ bgcolor: "rgba(102,126,234,0.12)", color: "#667eea", fontWeight: 700, borderRadius: "8px" }} />
              </Box>
              <Divider sx={{ mb: 2, borderColor }} />
              <Collapse in={isExpanded}>
              <Grid container spacing={2.5}>
                {g.items.slice(0, getVisibleCount(g.label)).map((u: any) => {
                  const tc = typeColors[u.universityType] || "#667eea";
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={u.id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 3, backdropFilter: "blur(8px)", transition: "all 0.3s", "&:hover": { borderColor: `${tc}40`, transform: "translateY(-2px)", boxShadow: isDark ? `0 8px 24px rgba(0,0,0,0.2)` : `0 8px 24px rgba(0,0,0,0.08)` } }}>
                        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: tc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                              <SchoolIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</Typography>
                              <Typography variant="caption" sx={{ color: tc, fontWeight: 600 }}>{u.universityType?.replace(/_/g, " ") || u.country?.name}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.5 }}>
                            <Chip label={u.country?.name || "-"} size="small" variant="outlined" sx={{ borderColor, color: "text.secondary", fontSize: "0.7rem" }} />
                            {u.city && <Chip label={u.city} size="small" variant="outlined" sx={{ borderColor, color: "text.secondary", fontSize: "0.7rem" }} />}
                            {u.state && <Chip label={u.state} size="small" variant="outlined" sx={{ borderColor, color: c("rgba(67,233,123,0.8)", "rgba(0,100,0,0.8)"), fontSize: "0.7rem" }} />}
                            {u.ranking && <Chip label={`#${u.ranking}`} size="small" sx={{ bgcolor: "rgba(250,112,154,0.1)", color: "#fa709a", fontWeight: 600, fontSize: "0.7rem" }} />}
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {u.website ? (
                              <Typography variant="caption" sx={{ color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
                                <a href={u.website} target="_blank" rel="noreferrer" style={{ color: "#667eea" }}>{u.website}</a>
                              </Typography>
                            ) : <Box />}
                            <Typography variant="caption" color="text.disabled">{u._count?.courses || 0} courses</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {g.items.length > getVisibleCount(g.label) && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button size="small" onClick={() => showMore(g.label)} variant="outlined" sx={{ color: "#667eea", borderColor: "rgba(102,126,234,0.3)", "&:hover": { borderColor: "#667eea", bgcolor: "rgba(102,126,234,0.06)" } }}>
                    View More ({g.items.length - getVisibleCount(g.label)} remaining)
                  </Button>
                </Box>
              )}
              </Collapse>
            </Box>
            );
          })}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3 }}>
            <Button disabled={page === 0} onClick={() => setPage(page - 1)} sx={{ color: "text.secondary", borderColor, "&:hover": { borderColor: "#667eea", color: "text.primary" } }} variant="outlined" size="small">Previous</Button>
            <Typography variant="caption" color="text.disabled">Page {page + 1} of {Math.ceil(total / 50)}</Typography>
            <Button disabled={page + 1 >= Math.ceil(total / 50)} onClick={() => setPage(page + 1)} sx={{ color: "text.secondary", borderColor, "&:hover": { borderColor: "#667eea", color: "text.primary" } }} variant="outlined" size="small">Next</Button>
          </Box>
        </>
      )}
    </Box>
  );
}
