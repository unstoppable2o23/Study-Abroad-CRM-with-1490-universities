"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box, Container, Typography, TextField, Button, Paper, Grid, MenuItem, FormControl, InputLabel, Select,
  Alert, CircularProgress, Stepper, Step, StepLabel, Skeleton,
} from "@mui/material";
import { CheckCircle, ArrowBack } from "@mui/icons-material";
import {
  accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon,
  sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx,
} from "@/lib/dashboard-ui";

interface Country { id: string; name: string; code: string; }
interface University { id: string; name: string; city: string; intakePeriods: string[]; }
interface Course { id: string; name: string; level: string; category: string; duration: string; tuitionFeeMin: number; tuitionFeeMax: number; currency: string; }

function GradientStepIcon({ active, completed, icon }: { active?: boolean; completed?: boolean; icon?: React.ReactNode }) {
  return (
    <Box sx={{
      width: 32, height: 32, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active || completed ? accentGradient : "rgba(0,0,0,0.12)",
      color: "#fff", fontSize: "0.875rem", fontWeight: 700, transition: "all 0.2s",
    }}>
      {completed ? <CheckCircle sx={{ fontSize: 18 }} /> : icon}
    </Box>
  );
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);

  const [countryId, setCountryId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [intake, setIntake] = useState("");

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCountries(d.data); })
      .catch(() => setError("Failed to load countries"))
      .finally(() => { setLoading(false); setInitialLoading(false); });
  }, []);

  useEffect(() => {
    if (!countryId) { setUniversities([]); setUniversityId(""); return; }
    setLoading(true);
    fetch(`/api/universities?countryId=${countryId}&limit=100`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setUniversities(d.data.data ?? []); })
      .catch(() => setError("Failed to load universities"))
      .finally(() => setLoading(false));
  }, [countryId]);

  useEffect(() => {
    if (!universityId) { setCourses([]); setCourseId(""); setIntake(""); return; }
    setLoading(true);
    fetch(`/api/courses?universityId=${universityId}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCourses(d.data.data ?? []);
          const uni = universities.find((u) => u.id === universityId);
          if (uni && uni.intakePeriods.length === 1) setIntake(uni.intakePeriods[0]);
        }
      })
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false));
  }, [universityId, universities]);

  const selectedUni = universities.find((u) => u.id === universityId);

  const handleSubmit = async () => {
    if (!universityId) { setError("Please select a university"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, courseId: courseId || undefined, intake: intake || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/applications"), 1500);
      } else {
        setError(data.error || "Failed to create application");
      }
    } catch {
      setError("Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center", ...cardSx, ...glassBg, border: glassBorder }}>
          <Alert severity="success" sx={{ mb: 2 }}>Application created successfully!</Alert>
          <Typography variant="body1" color="text.secondary">Redirecting to applications list...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="body2">
          <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>Dashboard</Link>
        </Typography>
        <Typography variant="body2" color="text.secondary">›</Typography>
        <Typography variant="body2">
          <Link href="/dashboard/applications" style={{ textDecoration: "none", color: "inherit" }}>Applications</Link>
        </Typography>
        <Typography variant="body2" color="text.secondary">›</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>New Application</Typography>
      </Box>

      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon()}>
          <CheckCircle sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={sectionTitleSx}>New Application</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {["Select Country & University", "Choose Course & Intake", "Review & Submit"].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {initialLoading ? (
        <Paper sx={{ p: 3, ...cardSx, ...glassBg, border: glassBorder }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={56} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={56} /></Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, ...cardSx, ...glassBg, border: glassBorder, ...fadeInSx }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Select University</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select value={countryId} label="Country" onChange={(e) => { setCountryId(e.target.value); setActiveStep(0); }}>
                      {countries.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth disabled={!countryId}>
                    <InputLabel>University</InputLabel>
                    <Select value={universityId} label="University" onChange={(e) => setUniversityId(e.target.value)}>
                      {universities.map((u) => <MenuItem key={u.id} value={u.id}>{u.name} ({u.city})</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  disabled={!universityId}
                  onClick={() => setActiveStep(1)}
                  sx={{
                    background: accentGradient, color: "#fff", fontWeight: 700, borderRadius: 2,
                    textTransform: "none", px: 3, "&:hover": { background: accentGradient, filter: "brightness(1.1)" },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Choose Course & Intake</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Course (optional)</InputLabel>
                    <Select value={courseId} label="Course (optional)" onChange={(e) => setCourseId(e.target.value)}>
                      <MenuItem value="">Skip for now</MenuItem>
                      {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} ({c.level}) - {c.category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Intake</InputLabel>
                    <Select value={intake} label="Intake" onChange={(e) => setIntake(e.target.value)}>
                      {selectedUni?.intakePeriods?.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button
                  onClick={() => setActiveStep(0)}
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                  sx={{
                    background: accentGradient, color: "#fff", fontWeight: 700, borderRadius: 2,
                    textTransform: "none", px: 3, "&:hover": { background: accentGradient, filter: "brightness(1.1)" },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Review & Submit</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: "divider" }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Country</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{countries.find((c) => c.id === countryId)?.name}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">University</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUni?.name}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Course</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{courses.find((c) => c.id === courseId)?.name || "Not selected"}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Intake</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{intake || "Not selected"}</Typography></Grid>
                </Grid>
              </Paper>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  onClick={() => setActiveStep(1)}
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    background: accentGradient, color: "#fff", fontWeight: 700, borderRadius: 2,
                    textTransform: "none", px: 3, minWidth: 180,
                    "&:hover": { background: accentGradient, filter: "brightness(1.1)" },
                    "&.Mui-disabled": { background: "#ccc" },
                  }}
                >
                  {submitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Application"}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}
