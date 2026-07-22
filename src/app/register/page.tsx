"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, TextField, Button, Paper, Grid, Alert,
  MenuItem, Stepper, Step, StepLabel, Chip, CircularProgress, IconButton,
  Autocomplete,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const examTypes = ["IELTS", "TOEFL", "PTE", "GRE", "GMAT", "SAT"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "", email: "", username: "", password: "", mobile: "",
    dateOfBirth: "", gender: "", address: "", country: "",
    tenthSchool: "", tenthBoard: "", tenthPercentage: "", tenthYear: "",
    twelfthSchool: "", twelfthBoard: "", twelfthPercentage: "", twelfthYear: "",
    graduationDegree: "", graduationUniversity: "", graduationPercentage: "", graduationYear: "",
    interests: "", hobbies: "", preferredCountry: "", preferredUniversity: "", preferredCourse: "",
    entranceExams: [] as { examType: string; score: string; dateTaken: string }[],
  });

  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setLoadingCountries(true);
    fetch("/api/countries")
      .then(r => r.json())
      .then(d => { if (d.success) setCountries(d.data); })
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!selectedCountry) { setUniversities([]); setCourses([]); setSelectedUniversity(null); form.preferredUniversity = ""; form.preferredCourse = ""; return; }
    setLoadingUniversities(true);
    fetch(`/api/universities?countryId=${selectedCountry.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setUniversities(d.data.data || []); })
      .finally(() => setLoadingUniversities(false));
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedUniversity) { setCourses([]); form.preferredCourse = ""; return; }
    setLoadingCourses(true);
    fetch(`/api/courses?universityId=${selectedUniversity.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setCourses(d.data.data || []); })
      .finally(() => setLoadingCourses(false));
  }, [selectedUniversity]);

  const addExam = () => setForm({ ...form, entranceExams: [...form.entranceExams, { examType: "", score: "", dateTaken: "" }] });
  const updateExam = (i: number, f: string, v: string) => {
    const exams = [...form.entranceExams];
    exams[i] = { ...exams[i], [f]: v };
    setForm({ ...form, entranceExams: exams });
  };
  const removeExam = (i: number) => setForm({ ...form, entranceExams: form.entranceExams.filter((_, idx) => idx !== i) });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
          hobbies: form.hobbies.split(",").map(s => s.trim()).filter(Boolean),
          entranceExams: form.entranceExams.filter(e => e.examType),
        }),
      });
      const d = await res.json();
      if (d.success) router.push("/login?registered=true");
      else setError(d.error || d.errors?.password?.join(", ") || "Registration failed");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [f]: e.target.value });

  const steps = ["Personal", "Academic", "Preferences", "Exams"];
  const gradientBtn = { background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, borderRadius: 2, color: "#fff", "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } };
  const inputSx = { "& .MuiOutlinedInput-root": { bgcolor: "action.hover", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "action.active" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiInputLabel-root": { color: "text.secondary" } };
  const sectionLabel = { color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px", mb: 1.5 };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", bgcolor: "background.default", py: 4 }}>
      <Box sx={{ position: "fixed", top: "-20vh", right: "-10vw", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", bottom: "-20vh", left: "-10vw", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(240,147,251,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <Box sx={{ width: "100%", maxWidth: 640, mx: 2, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton onClick={() => router.push("/login")} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <SchoolIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, bgcolor: "background.paper", backdropFilter: "blur(24px)", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, textAlign: "center", mb: 0.5 }}>Create Your Account</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mb: 3 }}>Fill in your details to get started</Typography>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Stepper activeStep={step} sx={{ mb: 4, "& .MuiStepLabel-label": { color: "text.disabled", "&.Mui-active": { color: "primary.main", fontWeight: 700 }, "&.Mui-completed": { color: "success.main" } }, "& .MuiStepIcon-root": { "&.Mui-active": { color: "primary.main" }, "&.Mui-completed": { color: "success.main" } } }}>
            {steps.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>

          {step === 0 && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography sx={sectionLabel}>Personal Information</Typography>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Full Name" required value={form.fullName} onChange={update("fullName")} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Email" required type="email" value={form.email} onChange={update("email")} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Username" value={form.username} onChange={update("username")} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Password" required type="password" value={form.password} onChange={update("password")} helperText="Min 8 chars, uppercase, lowercase, number, special" sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Mobile" value={form.mobile} onChange={update("mobile")} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Date of Birth" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Gender" select value={form.gender} onChange={update("gender")} sx={inputSx}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Address" multiline rows={2} value={form.address} onChange={update("address")} sx={inputSx} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Country" value={form.country} onChange={update("country")} sx={inputSx} />
              </Grid>
            </Grid>
          )}

          {step === 1 && (
            <Grid container spacing={2}>
              <Grid size={12}><Typography sx={sectionLabel}>Class 10</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="School" value={form.tenthSchool} onChange={update("tenthSchool")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Board" value={form.tenthBoard} onChange={update("tenthBoard")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={form.tenthPercentage} onChange={update("tenthPercentage")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={form.tenthYear} onChange={update("tenthYear")} sx={inputSx} /></Grid>

              <Grid size={12}><Typography sx={{ ...sectionLabel, mt: 2 }}>Class 12 (Optional)</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="School" value={form.twelfthSchool} onChange={update("twelfthSchool")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Board" value={form.twelfthBoard} onChange={update("twelfthBoard")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={form.twelfthPercentage} onChange={update("twelfthPercentage")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={form.twelfthYear} onChange={update("twelfthYear")} sx={inputSx} /></Grid>

              <Grid size={12}><Typography sx={{ ...sectionLabel, mt: 2 }}>Graduation (Optional)</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Degree" value={form.graduationDegree} onChange={update("graduationDegree")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="University" value={form.graduationUniversity} onChange={update("graduationUniversity")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Percentage" type="number" value={form.graduationPercentage} onChange={update("graduationPercentage")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Passing Year" type="number" value={form.graduationYear} onChange={update("graduationYear")} sx={inputSx} /></Grid>
            </Grid>
          )}

          {step === 2 && (
            <Grid container spacing={2}>
              <Grid size={12}><Typography sx={sectionLabel}>Interests & Preferences</Typography></Grid>
              <Grid size={12}><TextField fullWidth label="Interests (comma separated)" value={form.interests} onChange={update("interests")} helperText="e.g. Computer Science, Business, Medicine" sx={inputSx} /></Grid>
              <Grid size={12}><TextField fullWidth label="Hobbies (comma separated)" value={form.hobbies} onChange={update("hobbies")} sx={inputSx} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={countries}
                  loading={loadingCountries}
                  getOptionLabel={(o) => o.name}
                  value={selectedCountry}
                  onChange={(_, v) => { setSelectedCountry(v); setForm({ ...form, preferredCountry: v?.name || "" }); }}
                  renderInput={(params) => <TextField {...params} label="Preferred Country" sx={inputSx} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={universities}
                  loading={loadingUniversities}
                  getOptionLabel={(o) => o.name}
                  value={selectedUniversity}
                  onChange={(_, v) => { setSelectedUniversity(v); setForm({ ...form, preferredUniversity: v?.name || "" }); }}
                  renderInput={(params) => <TextField {...params} label="Preferred University" sx={inputSx} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={courses}
                  loading={loadingCourses}
                  getOptionLabel={(o) => o.name}
                  value={courses.find(c => c.name === form.preferredCourse) || null}
                  onChange={(_, v) => setForm({ ...form, preferredCourse: v?.name || "" })}
                  renderInput={(params) => <TextField {...params} label="Preferred Course" sx={inputSx} />}
                />
              </Grid>
            </Grid>
          )}

          {step === 3 && (
            <Box>
              <Typography sx={sectionLabel}>Entrance Exams (Optional)</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>Add your entrance exam scores to help us find the best options for you</Typography>
              {form.entranceExams.map((exam, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                  <TextField size="small" label="Exam" select value={exam.examType} onChange={(e) => updateExam(i, "examType", e.target.value)} sx={{ minWidth: 120, ...inputSx }}>
                    {examTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <TextField size="small" label="Score" value={exam.score} onChange={(e) => updateExam(i, "score", e.target.value)} sx={{ width: 100, ...inputSx }} />
                  <TextField size="small" label="Date" type="date" value={exam.dateTaken} onChange={(e) => updateExam(i, "dateTaken", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
                  <Button size="small" onClick={() => removeExam(i)} sx={{ color: "rgba(244,67,54,0.7)", "&:hover": { color: "#f44336" } }}>Remove</Button>
                </Box>
              ))}
              <Button variant="outlined" size="small" onClick={addExam} sx={{ mt: 1 }}>+ Add Exam</Button>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" /> Back
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              {step < 3 ? (
                <Button variant="contained" onClick={() => setStep(step + 1)} sx={gradientBtn}>
                  Next <ArrowForwardIcon sx={{ ml: 0.5 }} fontSize="small" />
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={gradientBtn}>
                  {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create Account"}
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)" }}>
              Already have an account?{" "}
              <Button onClick={() => router.push("/login")} sx={{ fontWeight: 700, textTransform: "none" }}>Login</Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
