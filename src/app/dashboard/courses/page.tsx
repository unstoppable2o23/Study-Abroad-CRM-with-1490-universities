"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Container, Typography, TextField, Button, Paper, Grid, Chip,
  MenuItem, FormControl, InputLabel, Select, Pagination, CircularProgress, Alert,
} from "@mui/material";
import { SchoolOutlined } from "@mui/icons-material";
import {
  accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon,
  sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, staggerFadeIn
} from "@/lib/dashboard-ui";

const COURSE_LEVELS = ["Bachelor", "Master", "PhD", "Diploma", "Certificate"];
const COURSE_CATEGORIES = [
  "Engineering", "Medical", "Computer Science", "AI", "Data Science",
  "Cyber Security", "Business", "Finance", "Management", "Law",
  "Architecture", "Psychology", "Design",
];

interface CourseItem {
  id: string; name: string; level: string; category: string;
  duration: string | null; tuitionFeeMin: number | null; tuitionFeeMax: number | null;
  currency: string | null; universityName: string | null; universityId: string | null;
  country: { id: string; name: string; code: string };
  careers: { id: string; name: string }[];
}

const chipColors: Record<string, string> = {
  Bachelor: "#1976d2", Master: "#7b1fa2", PhD: "#c62828",
  Diploma: "#2e7d32", Certificate: "#e65100",
};

function SkeletonCards() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
          <Paper sx={{ ...cardSx, p: 3, height: "100%" }}>
            <Box sx={{ width: "60%", height: 22, borderRadius: 1, bgcolor: "grey.200", mb: 2 }} />
            <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
              <Box sx={{ width: 70, height: 24, borderRadius: 4, bgcolor: "grey.100" }} />
              <Box sx={{ width: 80, height: 24, borderRadius: 4, bgcolor: "grey.100" }} />
              <Box sx={{ width: 60, height: 24, borderRadius: 4, bgcolor: "grey.100" }} />
            </Box>
            <Box sx={{ width: "70%", height: 16, borderRadius: 1, bgcolor: "grey.100", mb: 0.5 }} />
            <Box sx={{ width: "50%", height: 16, borderRadius: 1, bgcolor: "grey.100" }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);

  const [search, setSearch] = useState("");
  const [countryId, setCountryId] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [feeMax, setFeeMax] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (countryId) params.set("countryId", countryId);
      if (level) params.set("level", level);
      if (category) params.set("category", category);
      if (feeMax) params.set("feeMax", feeMax);
      params.set("page", String(page));

      const res = await fetch(`/api/courses/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.courses);
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.totalPages);
        if (data.data.countries) setCountries(data.data.countries);
      } else {
        setError(data.error || "Failed to load");
      }
    } catch {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [search, countryId, level, category, feeMax, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    fetch("/api/countries").then((r) => r.json()).then((d) => { if (d.success) setCountries(d.data); });
  }, []);

  const clearFilters = () => {
    setSearch(""); setCountryId(""); setLevel(""); setCategory(""); setFeeMax(""); setPage(1);
  };

  const hasFilters = search || countryId || level || category || feeMax;

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon(accent)}>
          <SchoolOutlined sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={sectionTitleSx}>Find Courses</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.82rem" }}>
            Browse and discover courses from top universities worldwide
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ ...glassBg, border: glassBorder, borderRadius: 3, p: 2.5, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Search courses, keywords" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Country</InputLabel>
              <Select value={countryId} label="Country" onChange={(e) => { setCountryId(e.target.value); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                {countries.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select value={level} label="Level" onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                {COURSE_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                {COURSE_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField fullWidth size="small" label="Max Fee (USD)" type="number" value={feeMax}
              onChange={(e) => { setFeeMax(e.target.value); setPage(1); }} />
          </Grid>
        </Grid>
        {hasFilters && (
          <Button size="small" onClick={clearFilters} sx={{ mt: 1.5, fontWeight: 600, fontSize: "0.75rem", textTransform: "none", color: "text.secondary" }}>
            Clear filters
          </Button>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <SkeletonCards />
      ) : courses.length === 0 ? (
        <Paper sx={{ ...cardSx, p: 6, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, background: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <SchoolOutlined sx={{ fontSize: 28, color: "text.disabled" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>No courses found</Typography>
          <Typography variant="body2" color="text.secondary">Try adjusting your search or filter criteria</Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 2, fontSize: "0.82rem" }}>
            {total} course{total !== 1 ? "s" : ""} found
          </Typography>
          <Grid container spacing={3}>
            {courses.map((c, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id} sx={staggerFadeIn(i)}>
                <Paper sx={{ ...cardSx, ...glassBg, p: 3, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                  onClick={() => router.push(`/dashboard/courses/${c.id}`)}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3, mb: 1.5 }}>{c.name}</Typography>
                  <Box sx={{ display: "flex", gap: 0.5, mb: 1.5, flexWrap: "wrap" }}>
                    <Chip label={c.level} size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: `${chipColors[c.level] || "#667eea"}14`, color: chipColors[c.level] || "#667eea", height: 22 }} />
                    <Chip label={c.category} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: "rgba(0,0,0,0.04)", color: "text.secondary", height: 22 }} />
                    {c.country && <Chip label={c.country.name} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: "rgba(0,0,0,0.04)", color: "text.secondary", height: 22 }} />}
                  </Box>
                  {c.universityName && (
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5, fontSize: "0.82rem" }}>{c.universityName}</Typography>
                  )}
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", mb: "auto" }}>
                    Fee: {c.tuitionFeeMin ? `$${c.tuitionFeeMin.toLocaleString()}` : "N/A"}
                    {c.tuitionFeeMax ? ` - $${c.tuitionFeeMax.toLocaleString()}` : ""}
                    {c.duration && ` · ${c.duration}`}
                  </Typography>
                  {c.careers?.length > 0 && (
                    <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {c.careers.slice(0, 3).map((cr) => (
                        <Chip key={cr.id} label={cr.name} size="small" sx={{ fontWeight: 600, fontSize: "0.65rem", bgcolor: `${accent}0d`, color: accent, height: 20 }} />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)}
                sx={{
                  "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: 2, fontSize: "0.82rem" },
                  "& .Mui-selected": { background: `${accent} !important`, color: "#fff", "&:hover": { background: `${accentDark} !important` } },
                }} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
