"use client";

import { useState, useEffect } from "react";
import {
  Box, Container, Typography, TextField, Button, Paper, Grid, Alert,
  MenuItem, LinearProgress, Chip, Autocomplete, Skeleton,
} from "@mui/material";
import {
  glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx,
  pageContainerSx, fadeInSx, accent, accentDark, accentGradient,
} from "@/lib/dashboard-ui";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [countries, setCountries] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/profile").then(r => r.json()),
      fetch("/api/countries").then(r => r.json()),
    ]).then(([pRes, cRes]) => {
      if (pRes.success) {
        setProfile(pRes.data.profile);
        setCompletion(pRes.data.completion);
      }
      if (cRes.success) setCountries(cRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const fetchUniversities = async (countryId: string) => {
    if (!countryId) { setUniversities([]); return; }
    setLoadingUnis(true);
    try {
      const res = await fetch(`/api/universities?countryId=${countryId}&limit=200`);
      const d = await res.json();
      if (d.success) setUniversities(d.data?.data || []);
    } catch { setUniversities([]); }
    setLoadingUnis(false);
  };

  const fetchCourses = async (universityId: string) => {
    if (!universityId) { setCourses([]); return; }
    setLoadingCourses(true);
    try {
      const res = await fetch(`/api/courses?universityId=${universityId}&limit=200`);
      const d = await res.json();
      if (d.success) setCourses(d.data?.data || []);
    } catch { setCourses([]); }
    setLoadingCourses(false);
  };

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev: any) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profile saved successfully");
        const refresh = await fetch("/api/student/profile").then(r => r.json());
        if (refresh.success) { setProfile(refresh.data.profile); setCompletion(refresh.data.completion); }
      } else {
        setMessage("Error saving profile");
      }
    } catch { setMessage("Error saving profile"); }
    setSaving(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={pageContainerSx}>
        <Skeleton variant="rounded" width={220} height={36} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={10} sx={{ mb: 1, borderRadius: 4 }} />
        <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={140} height={28} />)}
        </Box>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={280} sx={{ mb: 3, borderRadius: 3 }} />
        ))}
        <Skeleton variant="rounded" width={160} height={44} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  const selectedCountry = countries.find((c: any) => c.id === profile?.preferredCountryId);
  const selectedUni = universities.find((u: any) => u.id === profile?.preferredUniversityId);

  return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Box sx={{ position: "relative", mb: 4, pb: 2 }}>
        <Box sx={{ height: 4, width: 80, borderRadius: 2, background: accentGradient, mb: 1.5 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#1a1a2e" }}>
            My Profile
          </Typography>
          {completion && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>Completion</Typography>
              <Chip
                label={`${completion.percentage}%`}
                size="small"
                sx={{
                  fontWeight: 800, fontSize: "0.75rem", height: 26,
                  background: completion.percentage >= 80 ? "linear-gradient(135deg, #22c55e, #16a34a)" :
                    completion.percentage >= 50 ? "linear-gradient(135deg, #f59e0b, #d97706)" :
                    "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {completion && (
        <Box sx={{ mb: 3.5, ...fadeInSx }}>
          <Box
            sx={{
              height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "rgba(0,0,0,0.06)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={completion.percentage}
              sx={{
                height: 10, borderRadius: 5,
                bgcolor: "transparent",
                "& .MuiLinearProgress-bar": {
                  background: accentGradient,
                  borderRadius: 5,
                  transition: "transform 0.6s ease",
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
            {[
              { label: "Personal", value: completion.personal, max: 40 },
              { label: "Academic", value: completion.academic, max: 30 },
              { label: "Preferences", value: completion.preferences, max: 20 },
              { label: "Documents", value: completion.documents, max: 10 },
            ].map(({ label, value, max }) => (
              <Chip
                key={label}
                label={`${label}: ${value}/${max}`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600, fontSize: "0.72rem", height: 26,
                  borderColor: value === max ? "#22c55e" : "rgba(0,0,0,0.15)",
                  color: value === max ? "#22c55e" : "text.secondary",
                  bgcolor: value === max ? "rgba(34,197,94,0.06)" : "transparent",
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {message && (
        <Alert
          severity={message.includes("success") ? "success" : "error"}
          sx={{ mb: 2.5, borderRadius: 2, fontWeight: 600 }}
        >
          {message}
        </Alert>
      )}

      {!profile ? (
        <Paper sx={{ ...cardSx, ...glassBg, p: 5, textAlign: "center" }}>
          <Box sx={{ ...gradientIcon(), mx: "auto", mb: 2, width: 48, height: 48, borderRadius: 2.5, fontSize: 24 }}>
            !
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
            No profile found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Please complete registration first to create your profile.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = "/register"}
            sx={{ background: accentGradient, fontWeight: 700, px: 4, borderRadius: 2 }}
          >
            Register Now
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ ...cardSx, ...glassBg, p: { xs: 2.5, sm: 3.5 }, mb: 3, ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={gradientIcon()}>
                <Typography sx={{ fontSize: 16, lineHeight: 1, color: "#fff", fontWeight: 700 }}>P</Typography>
              </Box>
              <Typography sx={sectionTitleSx}>Personal Information</Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Full Name" value={profile.fullName || ""} onChange={updateField("fullName")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Mobile" value={profile.mobile || ""} onChange={updateField("mobile")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Date of Birth" type="date" value={profile.dateOfBirth?.split("T")[0] || ""} onChange={updateField("dateOfBirth")} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Gender" select value={profile.gender || ""} onChange={updateField("gender")}>
                  {["Male", "Female", "Other"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Address" multiline rows={2} value={profile.address || ""} onChange={updateField("address")} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Country" value={profile.country || ""} onChange={updateField("country")} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ ...cardSx, ...glassBg, p: { xs: 2.5, sm: 3.5 }, mb: 3, ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={gradientIcon()}>
                <Typography sx={{ fontSize: 16, lineHeight: 1, color: "#fff", fontWeight: 700 }}>A</Typography>
              </Box>
              <Typography sx={sectionTitleSx}>Academic Details</Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, fontSize: "0.85rem", letterSpacing: "0.2px" }}>
              Class 10
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="School" value={profile.tenthSchool || ""} onChange={updateField("tenthSchool")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Board" value={profile.tenthBoard || ""} onChange={updateField("tenthBoard")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={profile.tenthPercentage || ""} onChange={updateField("tenthPercentage")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={profile.tenthYear || ""} onChange={updateField("tenthYear")} /></Grid>
            </Grid>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, fontSize: "0.85rem", letterSpacing: "0.2px" }}>
              Class 12 <Typography component="span" variant="caption" sx={{ fontWeight: 500, color: "text.disabled" }}>(Optional)</Typography>
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="School" value={profile.twelfthSchool || ""} onChange={updateField("twelfthSchool")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Board" value={profile.twelfthBoard || ""} onChange={updateField("twelfthBoard")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={profile.twelfthPercentage || ""} onChange={updateField("twelfthPercentage")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={profile.twelfthYear || ""} onChange={updateField("twelfthYear")} /></Grid>
            </Grid>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, fontSize: "0.85rem", letterSpacing: "0.2px" }}>
              Graduation <Typography component="span" variant="caption" sx={{ fontWeight: 500, color: "text.disabled" }}>(Optional)</Typography>
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Degree" value={profile.graduationDegree || ""} onChange={updateField("graduationDegree")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="University" value={profile.graduationUniversity || ""} onChange={updateField("graduationUniversity")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={profile.graduationPercentage || ""} onChange={updateField("graduationPercentage")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={profile.graduationYear || ""} onChange={updateField("graduationYear")} /></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ ...cardSx, ...glassBg, p: { xs: 2.5, sm: 3.5 }, mb: 3.5, ...fadeInSx }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={gradientIcon()}>
                <Typography sx={{ fontSize: 16, lineHeight: 1, color: "#fff", fontWeight: 700 }}>Pr</Typography>
              </Box>
              <Typography sx={sectionTitleSx}>Preferences</Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Interests (comma separated)" value={profile.interests?.join(", ") || ""} onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Hobbies (comma separated)" value={profile.hobbies?.join(", ") || ""} onChange={(e) => setProfile({ ...profile, hobbies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={countries}
                  loading={countries.length === 0}
                  getOptionKey={(o: any) => o.id}
                  getOptionLabel={(o: any) => o.name}
                  value={selectedCountry || null}
                  onChange={(_, val) => {
                    setProfile((prev: any) => ({ ...prev, preferredCountryId: val?.id || "", preferredCountry: val?.name || "", preferredUniversityId: "", preferredUniversity: "", preferredCourseId: "", preferredCourse: "" }));
                    fetchUniversities(val?.id || "");
                    setCourses([]);
                  }}
                  renderInput={(params) => <TextField {...params} label="Preferred Country" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={universities}
                  loading={loadingUnis}
                  getOptionKey={(o: any) => o.id}
                  getOptionLabel={(o: any) => o.name}
                  value={selectedUni || null}
                  disabled={!profile?.preferredCountryId}
                  onChange={(_, val) => {
                    setProfile((prev: any) => ({ ...prev, preferredUniversityId: val?.id || "", preferredUniversity: val?.name || "", preferredCourseId: "", preferredCourse: "" }));
                    fetchCourses(val?.id || "");
                  }}
                  renderInput={(params) => <TextField {...params} label="Preferred University" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={courses}
                  loading={loadingCourses}
                  getOptionKey={(o: any) => o.id}
                  getOptionLabel={(o: any) => o.name}
                  value={courses.find((c: any) => c.id === profile?.preferredCourseId) || null}
                  disabled={!profile?.preferredUniversityId}
                  onChange={(_, val) => setProfile((prev: any) => ({ ...prev, preferredCourseId: val?.id || "", preferredCourse: val?.name || "" }))}
                  renderInput={(params) => <TextField {...params} label="Preferred Course" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Budget Min" type="number" value={profile.budgetMin || ""} onChange={updateField("budgetMin")} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Budget Max" type="number" value={profile.budgetMax || ""} onChange={updateField("budgetMax")} /></Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", ...fadeInSx }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: accentGradient, fontWeight: 700, px: 5, py: 1.4, borderRadius: 2.5,
                fontSize: "0.9rem", letterSpacing: "0.2px",
                boxShadow: "0 4px 14px rgba(102,126,234,0.35)",
                transition: "all 0.25s ease",
                "&:hover": {
                  boxShadow: "0 6px 24px rgba(102,126,234,0.5)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "rgba(0,0,0,0.12)",
                  boxShadow: "none",
                },
              }}
            >
              {saving ? "Saving\u2026" : "Save Profile"}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
