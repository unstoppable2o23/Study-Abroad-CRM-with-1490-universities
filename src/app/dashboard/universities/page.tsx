"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box, Container, Typography, Grid, Paper, TextField, MenuItem, Button,
  Chip, CircularProgress, Select, FormControl, InputLabel, Card, CardContent,
  CardActions, Divider, Collapse, IconButton, Skeleton,
} from "@mui/material";
import { Favorite, FavoriteBorder, School as SchoolIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx, staggerFadeIn } from "@/lib/dashboard-ui";

const typeLabels: Record<string, string> = {
  CENTRAL: "Central Universities",
  STATE: "State Universities",
  DEEMED: "Deemed Universities",
  PRIVATE: "Private Universities",
  INSTITUTE_OF_NATIONAL_IMPORTANCE: "Institutes of National Importance",
  AUTONOMOUS: "Autonomous Colleges",
};
const typeOrder = ["CENTRAL", "STATE", "DEEMED", "INSTITUTE_OF_NATIONAL_IMPORTANCE", "PRIVATE", "AUTONOMOUS"];
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export default function UniversitiesPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(typeOrder));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (search) params.set("search", search);
    if (country) params.set("countryId", country);
    if (stateFilter) params.set("state", stateFilter);

    const [uniRes, savedRes, countryRes] = await Promise.all([
      fetch(`/api/universities/search?${params}`).then(r => r.json()),
      fetch("/api/student/universities/saved").then(r => r.json()),
      fetch("/api/countries").then(r => r.json()),
    ]);

    if (uniRes.success) setUniversities(uniRes.data?.universities || []);
    if (savedRes.success) setSavedIds(new Set((savedRes.data?.data || savedRes.data || []).map((u: any) => u.id)));
    if (countryRes.success) setCountries(countryRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search, country, stateFilter]);

  const toggleSave = async (id: string) => {
    const res = await fetch(`/api/student/universities/${id}/save`, { method: "POST" });
    const d = await res.json();
    if (d.success) {
      setSavedIds(prev => {
        const next = new Set(prev);
        d.data.saved ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  const toggleGroupExpand = (label: string) => {
    setExpandedGroups(prev => { const next = new Set(prev); next.has(label) ? next.delete(label) : next.add(label); return next; });
  };

  const getVisibleCount = (label: string) => visibleCounts[label] || 100;
  const showMore = (label: string) => setVisibleCounts(prev => ({ ...prev, [label]: (prev[label] || 100) + 100 }));

  const groups = useMemo(() => {
    const data = Array.isArray(universities) ? universities : [];
    const indian = data.filter((u: any) => u.country?.code === "IN");
    const international = data.filter((u: any) => u.country?.code !== "IN");
    const grouped: { label: string; items: any[] }[] = [];
    for (const t of typeOrder) {
      const items = indian.filter((u: any) => u.universityType === t);
      if (items.length) grouped.push({ label: typeLabels[t] || t, items });
    }
    const untypedIndian = indian.filter((u: any) => !u.universityType);
    if (untypedIndian.length) grouped.push({ label: "Other Indian Universities", items: untypedIndian });
    if (international.length) grouped.push({ label: "International Universities", items: international });
    return grouped;
  }, [universities]);

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon()}><SchoolIcon sx={{ fontSize: 18 }} /></Box>
        <Box>
          <Typography variant="h5" sx={sectionTitleSx}>University Search</Typography>
          <Typography variant="body2" color="text.secondary">Find and compare universities worldwide</Typography>
        </Box>
      </Box>

      <Box sx={{
        display: "flex", gap: 2, mb: 4, flexWrap: "wrap", p: 2,
        ...glassBg, borderRadius: 3, border: glassBorder,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <TextField size="small" sx={{ minWidth: 260 }} label="Search universities" value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>State</InputLabel>
          <Select value={stateFilter} label="State" onChange={(e) => setStateFilter(e.target.value)}>
            <MenuItem value="">All States</MenuItem>
            {indianStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Country</InputLabel>
          <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}>
            <MenuItem value="">All Countries</MenuItem>
            {countries.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Paper sx={{ ...cardSx, ...glassBg, p: 2 }}>
                <Skeleton variant="rounded" width="60%" height={22} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="40%" height={16} sx={{ mb: 1.5 }} />
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
                <Skeleton variant="rounded" width="100%" height={16} sx={{ mb: 0.5 }} />
                <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                  <Skeleton variant="rounded" width={50} height={20} />
                  <Skeleton variant="rounded" width={50} height={20} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : groups.length === 0 ? (
        <Paper sx={{ ...cardSx, ...glassBg, p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>No universities found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try adjusting your filters</Typography>
        </Paper>
      ) : groups.map((g, gi) => {
        const isExpanded = expandedGroups.has(g.label);
        return (
        <Box key={gi} sx={{ mb: 4 }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1.5, mb: 1.5,
            cursor: "pointer", userSelect: "none",
            p: 1.5, borderRadius: 2,
            transition: "background 0.2s",
            "&:hover": { bgcolor: "rgba(102,126,234,0.04)" },
          }} onClick={() => toggleGroupExpand(g.label)}>
            <IconButton size="small"
              sx={{
                color: accent,
                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.25s ease",
                bgcolor: `${accent}08`,
                "&:hover": { bgcolor: `${accent}16` },
              }}>
              <ExpandMoreIcon />
            </IconButton>
            <Typography variant="h6" sx={{
              fontWeight: 800, flex: 1,
              background: accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.3px",
            }}>
              {g.label}
            </Typography>
            <Chip label={`${g.items.length} universities`} size="small"
              sx={{ ...chipStatusSx(accent), borderRadius: 2 }} />
          </Box>
          <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.5)" }} />
          <Collapse in={isExpanded}>
          <Grid container spacing={3}>
            {g.items.slice(0, getVisibleCount(g.label)).map((uni: any, idx: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={uni.id}>
                <Paper sx={{ ...cardSx, ...glassBg, height: "100%", display: "flex", flexDirection: "column", ...staggerFadeIn(idx) }}>
                  <Box sx={{ p: 2.5, flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.3, pr: 1 }}>
                        {uni.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleSave(uni.id)}
                        sx={{
                          color: savedIds.has(uni.id) ? "#ef4444" : "text.secondary",
                          bgcolor: savedIds.has(uni.id) ? "rgba(239,68,68,0.08)" : "transparent",
                          borderRadius: 1.5,
                          flexShrink: 0,
                          "&:hover": { bgcolor: savedIds.has(uni.id) ? "rgba(239,68,68,0.16)" : "rgba(0,0,0,0.04)" },
                        }}
                      >
                        {savedIds.has(uni.id) ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
                      {uni.country?.name}{uni.city ? ` · ${uni.city}` : ""}{uni.state ? ` · ${uni.state}` : ""}
                    </Typography>
                    {uni.website && (
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <a href={uni.website} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "none" }}>{uni.website}</a>
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {uni.ranking && (
                        <Chip label={`#${uni.ranking}`} size="small"
                          sx={{ ...chipStatusSx(accent), fontSize: "0.68rem" }} />
                      )}
                      <Chip label={`${uni.coursesCount || 0} courses`} size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1.5, fontSize: "0.68rem", fontWeight: 600, borderColor: "rgba(0,0,0,0.12)" }} />
                    </Box>
                    {uni.intakePeriods?.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {uni.intakePeriods.map((i: string) => (
                          <Chip key={i} label={i} size="small" variant="outlined"
                            sx={{ borderRadius: 1.5, fontSize: "0.65rem", height: 22, borderColor: `${accent}30`, color: accent }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ px: 2.5, pb: 2 }}>
                    <Button
                      fullWidth
                      size="small"
                      onClick={() => router.push(`/dashboard/universities/${uni.id}`)}
                      sx={{
                        borderRadius: 2,
                        background: accentGradient,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 0.8,
                        "&:hover": { opacity: 0.9 },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {g.items.length > getVisibleCount(g.label) && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button size="small" onClick={() => showMore(g.label)}
                variant="outlined"
                sx={{
                  borderRadius: 2, borderColor: `${accent}40`, color: accent, fontWeight: 600,
                  "&:hover": { borderColor: accent, bgcolor: `${accent}08` },
                }}>
                View More ({g.items.length - getVisibleCount(g.label)} remaining)
              </Button>
            </Box>
          )}
          </Collapse>
        </Box>
        );
      })}
    </Container>
  );
}
