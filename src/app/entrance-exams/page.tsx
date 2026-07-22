"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Container, Typography, Button, Grid, Paper, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputBase, ToggleButton, ToggleButtonGroup, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EngineeringIcon from "@mui/icons-material/Engineering";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BrushIcon from "@mui/icons-material/Brush";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

const filterTabs = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
  { id: "medical", label: "Medical" },
  { id: "law", label: "Law" },
  { id: "commerce", label: "Commerce & Humanities" },
  { id: "design", label: "Design & Architecture" },
  { id: "other", label: "Other Exams" },
];

const sectionGradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #667eea, #f093fb)",
  "linear-gradient(135deg, #fc5c7d, #6a82fb)",
];

export default function EntranceExamsPage() {
  const router = useRouter();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const matchesFilter = (id: string) => activeFilter === "all" || activeFilter === id;

  const sectionIds = ["engineering", "medical", "law", "commerce", "design", "other", "faq"];

  const filteredSections = useMemo(() => {
    if (activeFilter === "all" && !searchQuery) return sectionIds;
    const q = searchQuery.toLowerCase();
    return sectionIds.filter((id) => {
      if (!matchesFilter(id)) return false;
      if (!searchQuery) return true;
      const labels: Record<string, string> = {
        engineering: "engineering jee main advanced bitsat cet",
        medical: "medical neet ug mbbs bds aiims jipmer",
        law: "law clat ailet lsat",
        commerce: "commerce humanities cuet ug ipmat bba",
        design: "design architecture nift nid dat uceed nata",
        other: "other nda nchm jee icar aieea ug",
        faq: "faq frequently asked questions",
      };
      return (labels[id] || id).includes(q);
    });
  }, [activeFilter, searchQuery]);

  const showSection = (id: string) => filteredSections.includes(id);

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", bgcolor: "#0a0a1a" }}>
      <Box sx={{ position: "fixed", top: "-30vh", right: "-15vw", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", bottom: "-20vh", left: "-10vw", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(240,147,251,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", top: "40vh", left: "50%", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(79,172,254,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", transform: "translate(-50%, -50%)" }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => router.push("/")}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <SchoolIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, background: "linear-gradient(135deg, #667eea, #f093fb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Study Abroad CRM
            </Typography>
          </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={() => router.push("/login")} sx={{ borderRadius: 2, borderColor: "rgba(255,255,255,0.15)", color: "#fff", "&:hover": { borderColor: "rgba(255,255,255,0.3)", bgcolor: "rgba(255,255,255,0.05)" } }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => router.push("/register")} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
              Register
            </Button>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}>
          <Typography variant="body2" sx={{ display: "inline-block", px: 2, py: 0.5, borderRadius: 2, bgcolor: "rgba(102,126,234,0.12)", color: "#667eea", fontWeight: 700, mb: 3, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem" }}>
            Comprehensive Guide 2026
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "3.5rem" }, lineHeight: 1.1, mb: 2, background: "linear-gradient(135deg, #fff 0%, #667eea 50%, #f093fb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Top Entrance Exams After Class 12
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)", mb: 3, maxWidth: 700, mx: "auto", fontWeight: 400, fontSize: { xs: "1rem", md: "1.1rem" } }}>
            Your ultimate guide to engineering, medical, law, design, commerce & more — all in one place.
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.35)", mb: 4 }}>
            Updated: July 2026 &middot; 11 min read
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 220, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, px: 2, border: "1px solid rgba(255,255,255,0.08)", "&:focus-within": { borderColor: "#667eea" } }}>
              <SearchIcon sx={{ color: "rgba(255,255,255,0.3)", mr: 1, fontSize: 20 }} />
              <InputBase
                fullWidth
                placeholder="Search exams, courses, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: "#fff", py: 1.2, fontSize: "0.95rem", "&::placeholder": { color: "rgba(255,255,255,0.3)" } }}
              />
              {searchQuery && (
                <Typography variant="caption" onClick={() => setSearchQuery("")} sx={{ color: "rgba(255,255,255,0.3)", cursor: "pointer", "&:hover": { color: "#fff" }, flexShrink: 0 }}>
                  Clear
                </Typography>
              )}
            </Box>
          </Box>
          <ToggleButtonGroup
            value={activeFilter}
            exclusive
            onChange={(_, val) => val && setActiveFilter(val)}
            sx={{ flexWrap: "wrap", gap: 0.5, "& .MuiToggleButton-root": { border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px !important", px: 2, py: 0.6, textTransform: "none", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 600, "&.Mui-selected": { bgcolor: "rgba(102,126,234,0.15)", color: "#667eea", borderColor: "rgba(102,126,234,0.3)", "&:hover": { bgcolor: "rgba(102,126,234,0.2)" } }, "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } } }}
          >
            {filterTabs.map((tab) => (
              <ToggleButton key={tab.id} value={tab.id}>{tab.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>

        {filteredSections.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 6, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.5)" }}>No results found for &quot;{searchQuery}&quot;. Try a different search term.</Typography>
          </Paper>
        )}

        <Box sx={{ mb: 6, p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, mb: 2, fontSize: "1.05rem" }}>
            After Class 12, every student faces a major turning point — choosing the right course, career path, and entrance exam. With options in engineering, medicine, law, design, commerce, and humanities, the decision can feel overwhelming.
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, mb: 3, fontSize: "1.05rem" }}>
            Most top colleges in India admit students through competitive entrance exams, making the right choice very important for your future.
          </Typography>
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(102,126,234,0.08)", border: "1px solid rgba(102,126,234,0.15)" }}>
            <Typography variant="subtitle1" sx={{ color: "#667eea", fontWeight: 700, mb: 1.5 }}>Why Entrance Exams Matter</Typography>
            <Grid container spacing={2}>
              {[
                "Get admission into top colleges and universities",
                "Compete fairly at a national level",
                "Access high-demand courses and careers",
                "Build a strong academic foundation for the future",
              ].map((item, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#667eea", flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>{item}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Engineering */}
        {showSection("engineering") && <Box id="engineering" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[0], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[0], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <EngineeringIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Engineering Entrance Exams</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, mb: 3 }}>
              Engineering remains one of the most popular career choices for students interested in technology, innovation, and problem-solving. Admission into top engineering colleges in India is mainly through competitive entrance exams.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>JEE Main &amp; JEE Advanced</Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                  <Chip label="JEE Main" size="small" sx={{ bgcolor: "rgba(102,126,234,0.15)", color: "#667eea", fontWeight: 700, mb: 1.5 }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Conducted by: National Testing Agency (NTA)</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Subjects: Physics, Chemistry, Mathematics</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Held: Twice a year</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Purpose: Admission to NITs, IIITs, GFTIs &amp; eligibility for JEE Advanced</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                  <Chip label="JEE Advanced" size="small" sx={{ bgcolor: "rgba(240,147,251,0.15)", color: "#f093fb", fontWeight: 700, mb: 1.5 }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Eligibility: Top JEE Main qualifiers (~top 2.5 lakh)</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Purpose: Admission to IITs</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Difficulty: Very high</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Focus: Advanced problem-solving</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>BITSAT</Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", mb: 3 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Conducted by: BITS Pilani &middot; Online exam</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>Subjects: Physics, Chemistry, Mathematics/Biology, English, Logical Reasoning</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Purpose: Admission to BITS Pilani, Goa, Hyderabad &amp; Dubai campuses</Typography>
            </Paper>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>State-Level CETs</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#667eea", fontWeight: 700, borderBottomColor: "rgba(255,255,255,0.08)" }}>Exam</TableCell>
                    <TableCell sx={{ color: "#667eea", fontWeight: 700, borderBottomColor: "rgba(255,255,255,0.08)" }}>State</TableCell>
                    <TableCell sx={{ color: "#667eea", fontWeight: 700, borderBottomColor: "rgba(255,255,255,0.08)" }}>Purpose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { exam: "MHT CET", state: "Maharashtra", purpose: "Engineering & Pharmacy admissions" },
                    { exam: "KCET", state: "Karnataka", purpose: "Engineering, Medical & Dental courses" },
                    { exam: "WBJEE", state: "West Bengal", purpose: "Engineering, Technology, Pharmacy & Architecture" },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottomColor: "rgba(255,255,255,0.04)", fontWeight: 600 }}>{row.exam}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottomColor: "rgba(255,255,255,0.04)" }}>{row.state}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottomColor: "rgba(255,255,255,0.04)" }}>{row.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>}

        {/* Medical */}
        {showSection("medical") && <Box id="medical" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[1], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[1], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <LocalHospitalIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Medical Entrance Exams</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, mb: 3 }}>
              Medicine is one of the most respected and competitive career paths in India. Students aiming to become doctors, dentists, or allied health professionals must clear national-level entrance exams after Class 12.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>NEET UG</Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", mb: 3 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>
                NEET UG is the single and mandatory entrance exam for undergraduate medical admissions in India.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  { label: "Conducted by", value: "National Testing Agency (NTA)" },
                  { label: "Subjects", value: "Physics, Chemistry, Biology" },
                  { label: "Level", value: "National" },
                  { label: "Competition", value: "Extremely high (millions of applicants)" },
                ].map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)", minWidth: 110 }}>{item.label}:</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1.5 }}>Courses Covered Through NEET UG</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#43e97b", fontWeight: 700, borderBottomColor: "rgba(255,255,255,0.08)" }}>Course Type</TableCell>
                    <TableCell sx={{ color: "#43e97b", fontWeight: 700, borderBottomColor: "rgba(255,255,255,0.08)" }}>Examples</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { type: "Medical", examples: "MBBS" },
                    { type: "Dental", examples: "BDS" },
                    { type: "AYUSH", examples: "BAMS, BHMS, BUMS, BSMS" },
                    { type: "Veterinary", examples: "BVSc & related courses" },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottomColor: "rgba(255,255,255,0.04)", fontWeight: 600 }}>{row.type}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottomColor: "rgba(255,255,255,0.04)" }}>{row.examples}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(67,233,123,0.06)", border: "1px solid rgba(67,233,123,0.12)" }}>
              <Typography variant="body2" sx={{ color: "#43e97b", fontWeight: 700, mb: 1 }}>Updated System: AIIMS &amp; JIPMER</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Admissions to AIIMS and JIPMER MBBS programs are now based on NEET UG scores only. No separate entrance exams are conducted.
              </Typography>
            </Paper>
          </Paper>
        </Box>}

        {/* Law */}
        {showSection("law") && <Box id="law" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[2], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[2], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <GavelIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Law Entrance Exams</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, mb: 3 }}>
              Law is a respected and intellectually demanding career that focuses on justice, reasoning, governance, and legal systems. Students who wish to become lawyers must clear entrance exams after Class 12 to enter top law schools in India.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                {
                  title: "CLAT",
                  gradient: "rgba(240,147,251,0.15)",
                  color: "#f093fb",
                  details: [
                    "Conducted by: Consortium of NLUs",
                    "Purpose: Admission to 22 National Law Universities",
                    "Courses: BA LLB, BBA LLB, B.Com LLB, B.Sc LLB",
                    "Covers: English, GK, Legal/Logical Reasoning, Maths",
                  ],
                },
                {
                  title: "AILET",
                  gradient: "rgba(245,87,108,0.15)",
                  color: "#f5576c",
                  details: [
                    "Conducted by: NLU Delhi",
                    "Purpose: BA LLB (Hons.), LLM, PhD at NLU Delhi",
                    "Difficulty: High & highly competitive",
                    "Unique pattern compared to CLAT",
                  ],
                },
                {
                  title: "LSAT India",
                  gradient: "rgba(79,172,254,0.15)",
                  color: "#4facfe",
                  details: [
                    "Designed by: Law School Admission Council (LSAC)",
                    "Purpose: Admission to private law colleges",
                    "Focus: Logical Reasoning, Analytical Reasoning",
                    "Does not test legal knowledge directly",
                  ],
                },
              ].map((exam, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: exam.gradient, border: `1px solid ${exam.color}30`, height: "100%" }}>
                    <Chip label={exam.title} size="small" sx={{ bgcolor: exam.color, color: "#fff", fontWeight: 700, mb: 1.5 }} />
                    {exam.details.map((d, j) => (
                      <Typography key={j} variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}>{d}</Typography>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>}

        {/* Commerce & Humanities */}
        {showSection("commerce") && <Box id="commerce" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[3], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[3], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <AccountBalanceIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Commerce &amp; Humanities Entrance Exams</Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>CUET UG</Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", mb: 3 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>
                CUET UG is the main national-level entrance exam for undergraduate admissions in India, introduced in 2022.
              </Typography>
              <Grid container spacing={2}>
                {[
                  "Conducted by: NTA",
                  "Mandatory for most Central Universities",
                  "Accepted by many private & state universities",
                  "Covers: Arts, Commerce, Science & interdisciplinary programs",
                  "Subjects: Language tests, domain subjects, general test",
                ].map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4facfe", flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>IPMAT</Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(79,172,254,0.06)", border: "1px solid rgba(79,172,254,0.12)", mb: 3 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>
                IPMAT is for students aiming for early entry into management education at IIMs.
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}>Conducted by: IIM Indore, IIM Rohtak, IIM Ranchi</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}>Program: 5-year Integrated Program in Management (BBA + MBA)</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Sections: Quantitative Ability, Verbal Ability, Logical Reasoning</Typography>
            </Paper>

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1.5 }}>University-Specific Entrance Exams</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
              Many universities conduct their own entrance tests for BBA, BMS, BA (Hons.), and specialized programs. Private and state universities may have independent exams — always check official requirements.
            </Typography>
          </Paper>
        </Box>}

        {/* Design & Architecture */}
        {showSection("design") && <Box id="design" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[4], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[4], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <BrushIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Design &amp; Architecture Entrance Exams</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                {
                  title: "NIFT",
                  gradient: "rgba(250,112,154,0.15)",
                  color: "#fa709a",
                  items: ["Courses: B.Des, B.F.Tech", "Stages: CAT, GAT, Situation Test", "Skills: Creativity, fashion awareness, communication"],
                },
                {
                  title: "NID DAT",
                  gradient: "rgba(254,225,64,0.15)",
                  color: "#fee140",
                  items: ["Stages: DAT Prelims + Mains", "Course: B.Des", "Skills: Visual imagination, drawing, design thinking"],
                },
                {
                  title: "UCEED",
                  gradient: "rgba(102,126,234,0.15)",
                  color: "#667eea",
                  items: ["Conducted by: IIT Bombay", "Institutes: IIT Bombay, Delhi, Guwahati, Hyderabad", "Skills: Design aptitude, logical reasoning, creativity"],
                },
                {
                  title: "NATA",
                  gradient: "rgba(240,147,251,0.15)",
                  color: "#f093fb",
                  items: ["Course: B.Arch (5-year degree)", "Conducted by: Council of Architecture", "Skills: Drawing, spatial awareness, aesthetic sensitivity"],
                },
              ].map((exam, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: exam.gradient, border: `1px solid ${exam.color}30`, height: "100%" }}>
                    <Chip label={exam.title} size="small" sx={{ bgcolor: exam.color, color: "#fff", fontWeight: 700, mb: 1.5 }} />
                    {exam.items.map((d, j) => (
                      <Typography key={j} variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}>{d}</Typography>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>}

        {/* Other Exams */}
        <Box id="other" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[5], opacity: 0.08 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: sectionGradients[5], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <MilitaryTechIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Other Prominent Entrance Exams</Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  title: "NDA & NA Exam",
                  subtitle: "National Defence Academy",
                  gradient: "rgba(102,126,234,0.15)",
                  color: "#667eea",
                  details: [
                    "Conducted by: UPSC",
                    "Purpose: Army, Navy & Air Force wings",
                    "Selection: Written exam + SSB Interview + Medical",
                  ],
                },
                {
                  title: "NCHM JEE",
                  subtitle: "Hospitality & Hotel Management",
                  gradient: "rgba(240,147,251,0.15)",
                  color: "#f093fb",
                  details: [
                    "Course: B.Sc. in Hospitality & Hotel Administration",
                    "Institutes: IHMs across India",
                    "Careers: Hotel Manager, Hospitality Operations",
                  ],
                },
                {
                  title: "ICAR AIEEA UG",
                  subtitle: "Agriculture & Allied Sciences",
                  gradient: "rgba(67,233,123,0.15)",
                  color: "#43e97b",
                  details: [
                    "Fields: Agriculture, Horticulture, Forestry, Fisheries",
                    "Institutes: Agricultural universities across India",
                    "Careers: Agribusiness, Research & Development",
                  ],
                },
              ].map((exam, i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: exam.gradient, border: `1px solid ${exam.color}30`, height: "100%" }}>
                    <Chip label={exam.title} size="small" sx={{ bgcolor: exam.color, color: "#fff", fontWeight: 700, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block", mb: 1.5 }}>{exam.subtitle}</Typography>
                    {exam.details.map((d, j) => (
                      <Typography key={j} variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}>{d}</Typography>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* FAQ */}
        <Box id="faq" sx={{ mb: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 3 }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, bgcolor: "rgba(79,172,254,0.12)", color: "#4facfe", fontSize: "0.8rem", fontWeight: 700 }}>FAQ</Box>
                Frequently Asked Questions
              </Box>
            </Typography>
            {[
              {
                q: "What is the most important entrance exam after 12th for engineering?",
                a: "For engineering aspirants in India, the Joint Entrance Examination (JEE) Main is the most crucial exam. It serves as the gateway to NITs, IIITs, GFTIs, and is the qualifying exam for JEE Advanced, which leads to admissions into the prestigious Indian Institutes of Technology (IITs).",
              },
              {
                q: "Which entrance exam should I take for MBBS admission?",
                a: "For MBBS admission in India, the National Eligibility cum Entrance Test (NEET UG) is the single, mandatory entrance examination. All admissions to government and private medical colleges, including AIIMS and JIPMER, for MBBS and BDS courses are based on NEET UG scores.",
              },
              {
                q: "Is CUET mandatory for all universities after Class 12?",
                a: "CUET (UG) is mandatory for admission to all undergraduate programs in Central Universities across India. Many state, deemed, and private universities have also opted to use CUET scores for their admissions, making it a highly significant exam for a wide range of courses and institutions. Always check the specific requirements of your target university.",
              },
              {
                q: "How can Study Abroad CRM help me choose the right entrance exam?",
                a: "Our AI-powered platform provides personalized guidance by analyzing your academic profile, interests, strengths, and career aspirations. We help you identify suitable entrance exams, understand eligibility criteria, track application deadlines, and connect you with resources to optimize your preparation strategy, ensuring you make informed decisions for your higher education journey.",
              },
            ].map((faq, i) => (
              <Accordion key={i} elevation={0} sx={{ bgcolor: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px !important", mb: 1.5, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.5)" }} />} sx={{ borderRadius: "12px", "&.Mui-expanded": { borderBottom: "1px solid rgba(255,255,255,0.04)" } }}>
                  <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>

        {/* CTA */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(240,147,251,0.08))", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3, maxWidth: 600, mx: "auto" }}>
            Get personalized guidance on entrance exams, college applications, and career planning with AI-powered recommendations.
          </Typography>
          <Button variant="contained" size="large" onClick={() => router.push("/register")} sx={{ px: 4, py: 1.5, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontSize: "1rem", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)", transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(102,126,234,0.3)" } }}>
            Get Started Free
          </Button>
        </Paper>

        <Box sx={{ textAlign: "center", py: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)" }}>
            &copy; 2026 Study Abroad CRM. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
