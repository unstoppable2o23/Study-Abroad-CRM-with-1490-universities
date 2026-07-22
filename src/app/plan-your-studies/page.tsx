"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Grid, Paper, Chip, Tabs, Tab, Menu, MenuItem, Divider, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

const sectionGradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #fc5c7d, #6a82fb)",
];

const SUB_SECTIONS = [
  { id: "indian-higher-education", label: "Indian Higher Education" },
  { id: "institute-ranking", label: "Institute Ranking" },
  { id: "scholarships-fellowships", label: "Scholarships & Fellowships" },
];

export default function PlanYourStudiesPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chooseMenuAnchor, setChooseMenuAnchor] = useState<null | HTMLElement>(null);
  const [planMenuAnchor, setPlanMenuAnchor] = useState<null | HTMLElement>(null);
  const [coursesSubMenu, setCoursesSubMenu] = useState<null | HTMLElement>(null);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const idx = SUB_SECTIONS.findIndex((s) => s.id === section);
    if (idx >= 0) setTabIndex(idx);
  }, []);

  const handleTabChange = (_: any, idx: number) => {
    setTabIndex(idx);
    router.replace(`/plan-your-studies?section=${SUB_SECTIONS[idx].id}`, { scroll: false });
  };

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", bgcolor: "#0a0a1a" }}>
      <Box sx={{ position: "fixed", top: "-30vh", right: "-15vw", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", bottom: "-20vh", left: "-10vw", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(240,147,251,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(10,10,26,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", py: 1.5, gap: 1 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", flexShrink: 0 }} onClick={() => router.push("/")}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <SchoolIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, background: "linear-gradient(135deg, #667eea, #f093fb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: { xs: "none", sm: "block" } }}>
                Study Abroad CRM
              </Typography>
            </Box>

            {isMobile ? (
              <Box sx={{ ml: "auto" }}>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#fff" }}><MenuIcon /></IconButton>
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: "auto" }}>
                  <Button
                    onMouseEnter={(e) => setChooseMenuAnchor(e.currentTarget)}
                    sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 600, fontSize: "0.9rem", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" } }}
                    endIcon={<KeyboardArrowDownIcon />}
                  >
                    Choose India
                  </Button>
                  <Menu
                    anchorEl={chooseMenuAnchor}
                    open={Boolean(chooseMenuAnchor)}
                    onClose={() => setChooseMenuAnchor(null)}
                    slotProps={{ list: { onMouseLeave: () => setChooseMenuAnchor(null) }, paper: { sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, minWidth: 200 } } }}
                    sx={{ mt: 1 }}
                  >
                    {["Why India", "10 Reasons to Study In India", "Things To Do In India"].map((item) => (
                      <MenuItem key={item} onClick={() => setChooseMenuAnchor(null)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { bgcolor: "rgba(102,126,234,0.12)", color: "#fff" } }}>{item}</MenuItem>
                    ))}
                  </Menu>

                  <Button
                    onMouseEnter={(e) => setPlanMenuAnchor(e.currentTarget)}
                    sx={{ color: "#667eea", textTransform: "none", fontWeight: 700, fontSize: "0.9rem", bgcolor: "rgba(102,126,234,0.08)", "&:hover": { bgcolor: "rgba(102,126,234,0.15)", color: "#667eea" } }}
                    endIcon={<KeyboardArrowDownIcon />}
                  >
                    Plan your Studies
                  </Button>
                  <Menu
                    anchorEl={planMenuAnchor}
                    open={Boolean(planMenuAnchor)}
                    onClose={() => setPlanMenuAnchor(null)}
                    slotProps={{ list: { onMouseLeave: () => setPlanMenuAnchor(null) }, paper: { sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, minWidth: 220 } } }}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem
                      onMouseEnter={(e) => setCoursesSubMenu(e.currentTarget)}
                      sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { bgcolor: "rgba(102,126,234,0.12)", color: "#fff" }, display: "flex", justifyContent: "space-between" }}
                    >
                      Courses and Institutes <ChevronRightIcon sx={{ fontSize: 18, ml: 2 }} />
                    </MenuItem>
                    <Menu
                      anchorEl={coursesSubMenu}
                      open={Boolean(coursesSubMenu)}
                      onClose={() => setCoursesSubMenu(null)}
                      slotProps={{ list: { onMouseLeave: () => setCoursesSubMenu(null) }, paper: { sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, minWidth: 220 } } }}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                      {SUB_SECTIONS.map((item, idx) => (
                        <MenuItem
                          key={item.id}
                          selected={tabIndex === idx}
                          onClick={() => { setCoursesSubMenu(null); setPlanMenuAnchor(null); handleTabChange(null, idx); }}
                          sx={{ color: tabIndex === idx ? "#667eea" : "rgba(255,255,255,0.7)", fontWeight: tabIndex === idx ? 700 : 400, "&:hover": { bgcolor: "rgba(102,126,234,0.12)", color: "#fff" } }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Menu>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                  <Button variant="outlined" size="small" onClick={() => router.push("/login")} sx={{ borderRadius: 2, borderColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.8rem", "&:hover": { borderColor: "rgba(255,255,255,0.3)" } }}>Log in</Button>
                  <Button variant="contained" size="small" onClick={() => router.push("/register")} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>Register</Button>
                </Box>
              </>
            )}
          </Box>
        </Container>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { bgcolor: "#0a0a1a", width: 280, borderLeft: "1px solid rgba(255,255,255,0.06)" } } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#667eea", mb: 2, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.7rem" }}>Choose India</Typography>
          {["Why India", "10 Reasons to Study In India", "Things To Do In India"].map((item) => (
            <ListItem key={item} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton sx={{ borderRadius: 1, color: "rgba(255,255,255,0.6)", "&:hover": { bgcolor: "rgba(102,126,234,0.08)", color: "#fff" } }}>
                <ListItemText primary={item} slotProps={{ primary: { sx: { fontSize: "0.9rem" } } }} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#667eea", mb: 2, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.7rem" }}>Plan your Studies</Typography>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => setMobileSubOpen(!mobileSubOpen)} sx={{ borderRadius: 1, color: "rgba(255,255,255,0.7)", "&:hover": { bgcolor: "rgba(102,126,234,0.08)" } }}>
              <ListItemText primary="Courses and Institutes" slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 700 } } }} />
              {mobileSubOpen ? <ExpandLess /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={mobileSubOpen}>
            <List disablePadding sx={{ pl: 2 }}>
              {SUB_SECTIONS.map((item, idx) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={tabIndex === idx}
                    onClick={() => { setDrawerOpen(false); handleTabChange(null, idx); }}
                    sx={{ borderRadius: 1, color: tabIndex === idx ? "#667eea" : "rgba(255,255,255,0.6)", fontWeight: tabIndex === idx ? 700 : 400, "&:hover": { bgcolor: "rgba(102,126,234,0.08)" } }}
                  >
                    <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: "0.85rem" } } }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => router.push("/login")} sx={{ borderRadius: 2, borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}>Log in</Button>
            <Button variant="contained" fullWidth onClick={() => router.push("/register")} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>Register</Button>
          </Box>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", cursor: "pointer", "&:hover": { color: "#667eea" } }} onClick={() => router.push("/")}>Home</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)" }}>&gt;</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>Plan your Studies</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)" }}>&gt;</Typography>
          <Typography variant="caption" sx={{ color: "#667eea", fontWeight: 600 }}>{SUB_SECTIONS[tabIndex].label}</Typography>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            mb: 4, borderBottom: "1px solid rgba(255,255,255,0.06)",
            "& .MuiTabs-indicator": { background: "linear-gradient(135deg, #667eea, #f093fb)", height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": { color: "rgba(255,255,255,0.4)", textTransform: "none", fontWeight: 600, fontSize: "0.95rem", py: 2, "&.Mui-selected": { color: "#fff" } },
          }}
        >
          {SUB_SECTIONS.map((s) => <Tab key={s.id} label={s.label} />)}
        </Tabs>

        {/* ===== Tab 0: Indian Higher Education ===== */}
        {tabIndex === 0 && (
          <>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", mb: 4, position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", opacity: 0.08 }} />
              <Typography variant="h6" sx={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)", mb: 1, fontWeight: 400, lineHeight: 1.6 }}>
                &ldquo;We owe a lot to the ancient Indians for teaching us how to count. Without which most modern scientific discoveries would have been impossible&rdquo;
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)", textAlign: "right" }}>- Albert Einstein</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 3 }}>
                In today&apos;s day and age, the premise that quality higher education is crucial for sustainable human development is undeniable. Higher education leads to acquiring analytical and problem-solving skills, ultimately helping humans to develop intellectual curiosity and character. It pushes the students to identify and set career goals that make them ready for professional setups. Therefore, a refined higher education enables economic, physical and social well-being to a student.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4, overflow: "hidden", position: "relative" }}>
              <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[0], opacity: 0.08 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, background: sectionGradients[0], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <SchoolRoundedIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Indian Higher Education System</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                India boasts one of the largest higher education systems globally, ranking second in terms of its extensive network. In India, &quot;higher education&quot; refers to tertiary education pursued after completing 12 years of schooling, which includes 10 years of primary education and 2 years of secondary education. The country&apos;s higher education landscape includes over 1,100+ universities and more than 45,000+ colleges offering exceptional academic opportunities. All these institutions are governed by the Ministry of Education.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                Indian institutions are equipped with state-of-the-art infrastructure, including modern libraries, classrooms with advanced technology (such as smart boards, computers, and Wi-Fi), all of which support interactive and comprehensive learning experiences. Due to these outstanding resources, several Indian institutes, such as the Indian Institutes of Technology (IITs), Indian Institute of Information Technology (IIITs), the Indian Institute of Science (IISc), the National Institutes of Technology (NITs), Indian Institutes of Science Education and Research (IISERs), and Indian Institutes of Management (IIMs), are consistently ranked among the top global institutions. This reinforces India&apos;s position as an emerging hub for higher education, attracting both national and international students.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                Thanks to the collaborative efforts of both public and private sectors, Indian higher education has seen impressive growth over the years. The cutting-edge teaching methodologies adopted by these institutions not only enhance students&apos; problem-solving abilities but also encourage innovative, out-of-the-box thinking.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Types of Universities</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}>
                On the basis of management the universities are classified as:
              </Typography>
              <Grid container spacing={3}>
                {[
                  { title: "Central Universities", desc: "These are set up through an Act in Parliament. The establishment and operation are funded by the Union Government.", gradient: sectionGradients[0] },
                  { title: "State Universities", desc: "These are set up through an Act in the State Legislature. The state universities are primarily funded and operated by the State Government.", gradient: sectionGradients[1] },
                  { title: "Private Universities", desc: "These are set up through an Act in the State Legislatures. It includes specialized institutions and multidisciplinary research universities.", gradient: sectionGradients[2] },
                  { title: "Deemed Universities", desc: "These are well-performing institutes that are declared to be of equal standing as the universities by the Central Government on the advice of the University Grants Commission (UGC).", gradient: sectionGradients[3] },
                ].map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: item.gradient, mb: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{item.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(240,147,251,0.04)", border: "1px solid rgba(240,147,251,0.1)", mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#f093fb", mb: 1.5 }}>Institutes of National Importance (INI)</Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                These are eminent institutions of India that are known to develop highly skilled individuals. They are funded by the Government of India and include all the IITs, IIITs, NITs, AIIMS, and similar institutes.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {["IITs", "NITs", "IIITs", "AIIMS", "IISERs", "IIMs", "NID", "NIFT"].map((inst) => (
                  <Chip key={inst} label={inst} size="small" sx={{ bgcolor: "rgba(240,147,251,0.1)", color: "#f093fb", fontWeight: 600 }} />
                ))}
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "rgba(240,147,251,0.06)", border: "1px solid rgba(240,147,251,0.08)" }}>
                <Typography variant="caption" sx={{ color: "#f093fb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Note</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                  Apart from the Institutes of National Importance, the UGC has set a recognition scheme for Indian higher education institutes (in 2017) according to which a total of 20 institutions will be granted the status &quot;Institute of Eminence&quot;. Until now 12 institutes have been granted this status.
                </Typography>
              </Box>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Colleges</Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                    The colleges enabling higher study in India can be affiliated either with central or state universities. The private colleges are mostly affiliated with state universities. Further, there are autonomous colleges as well that enjoy autonomy in terms of deciding curriculum, admissions and examination process. But, they are also affiliated with a government university (central or state).
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Courses</Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                    The courses offered in Indian higher education institutions can be generally classified into two categories:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(67,233,123,0.06)", border: "1px solid rgba(67,233,123,0.12)" }}>
                      <Typography variant="subtitle2" sx={{ color: "#43e97b", fontWeight: 700, mb: 0.5 }}>STEM Courses</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                        Science, Technology, Engineering and Mathematics. STEM courses emphasize integrated learning, hands-on experimentation, and research-based learning in AI, Machine Learning, etc.
                      </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(79,172,254,0.06)", border: "1px solid rgba(79,172,254,0.12)" }}>
                      <Typography variant="subtitle2" sx={{ color: "#4facfe", fontWeight: 700, mb: 0.5 }}>Non-STEM Courses</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                        Arts, Commerce, Nursing, Business Management, Humanities, Social Sciences, Optometry, Veterinary, Architecture, Yoga, Buddhist Studies, Indian Music, Vocational &amp; Certificate courses.
                      </Typography>
                    </Paper>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 3 }}>Regulatory Bodies &amp; NEP 2020</Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(102,126,234,0.06)", border: "1px solid rgba(102,126,234,0.12)", height: "100%" }}>
                    <Typography variant="subtitle2" sx={{ color: "#667eea", fontWeight: 700, mb: 1 }}>University Grants Commission (UGC)</Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                      The main regulatory body that provides funds to universities, establishes education standards, and analyses the growth of higher education institutions. Universities must meet UGC criteria to enjoy degree-awarding authority.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(79,172,254,0.06)", border: "1px solid rgba(79,172,254,0.12)", height: "100%" }}>
                    <Typography variant="subtitle2" sx={{ color: "#4facfe", fontWeight: 700, mb: 1 }}>All India Council of Technical Education (AICTE)</Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                      A statutory body that governs technical education in India. It ensures the integration of latest innovation and technology in the higher education system.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(250,112,154,0.06)", border: "1px solid rgba(250,112,154,0.12)" }}>
                <Typography variant="subtitle2" sx={{ color: "#fa709a", fontWeight: 700, mb: 1 }}>National Education Policy (NEP) 2020</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9, mb: 1.5 }}>
                  The NEP 2020 focuses on implementing and strengthening multidisciplinary, inclusive and technology-based learning that is accessible to all. It emphasizes personal accomplishment for students and prepares them to pave a good future. The policy highlights the need for the internationalization of higher education through programmes such as Study in India and International Students Offices.
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>
                  Furthermore, NEP 2020 grants increased flexibility to institutions to create curriculum and decide internal assessment for an interactive learning experience. The underlying aim is to attain global standards in terms of quality. India, with its valuable and competitive education ecosystem, is an attractive option for international students.
                </Typography>
              </Paper>
            </Paper>
          </>
        )}

        {/* ===== Tab 1: Institute Ranking ===== */}
        {tabIndex === 1 && (
          <>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                The University Grants Commission is the statutory body responsible for ensuring, maintaining and promoting the standards of Indian higher education institutions as per the prevailing global educational trends. Institute Ranking plays a fundamental role in building institutional position and receiving authorization from the UGC. The higher education institutes utilize the ranking parameters to bring about strategic and academic changes. Moreover, the international students planning to study in India can effectively use the ranking to assess the education standards of the institute they plan to go to.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, background: sectionGradients[1], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <EmojiEventsIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Broad Framework for the Categorisation of Universities</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}>
                The UGC categorises the Indian institutions in broadly three categories:
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    title: "Category I University",
                    color: "#667eea",
                    items: [
                      "Accredited by NAAC with a score of 3.51 or above",
                      "Corresponding accreditation grade from a reputed agency chosen by the UGC",
                      "Ranked among top 500 of reputed world rankings (THE / QS)",
                    ],
                  },
                  {
                    title: "Category II University",
                    color: "#43e97b",
                    items: [
                      "Accredited by NAAC with a score of 3.26 to 3.50",
                      "Corresponding accreditation grade from a reputed agency chosen by the UGC",
                    ],
                  },
                  {
                    title: "Category III University",
                    color: "#f093fb",
                    items: [
                      "Universities that do not fall under Category I or Category II",
                    ],
                  },
                ].map((cat, i) => (
                  <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: `rgba(255,255,255,0.03)`, border: `1px solid rgba(255,255,255,0.06)`, height: "100%", borderTop: `3px solid ${cat.color}` }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cat.color, mb: 1.5 }}>{cat.title}</Typography>
                      {cat.items.map((item, j) => (
                        <Box key={j} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cat.color, mt: 0.5, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{item}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 3 }}>The Accrediting Organizations</Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                The quality and standard assessment of higher education institutions are overseen primarily by two organizations: NAAC and NIRF.
              </Typography>

              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(102,126,234,0.04)", border: "1px solid rgba(102,126,234,0.1)", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea", mb: 2 }}>About NAAC</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, mb: 3 }}>
                  The National Assessment and Accreditation Council (NAAC) is an autonomous organization set up by University Grants Commission and is headquartered in Bengaluru. The main function of NAAC is to ensure that quality is the defining feature of higher Study in India. It facilitates performance assessment and inspection for volunteering higher education institutions through a series of parameters. The accreditation granted by NAAC helps the institutions to identify and amend their internal planning areas, resource allocation and weakness through an extensive review procedure.
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#667eea", fontWeight: 700, mb: 1.5 }}>Assessment Criteria (7 Key Criteria)</Typography>
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    "Curricular Aspects",
                    "Teaching-Learning and Evaluation",
                    "Research, Innovations and Extension",
                    "Infrastructure and Learning Resources",
                    "Student Support and Progression",
                    "Governance, Leadership and Management",
                    "Institutional Values and Best Practices",
                  ].map((criterion, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#667eea", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{criterion}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(102,126,234,0.06)", border: "1px solid rgba(102,126,234,0.08)" }}>
                  <Typography variant="caption" sx={{ color: "#667eea", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Eligibility for NAAC</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                    Higher education institutions that have either been in existence for six years or have a record of a minimum of two batches of graduated students can apply for assessment and accreditation by NAAC.
                  </Typography>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(79,172,254,0.04)", border: "1px solid rgba(79,172,254,0.1)" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#4facfe", mb: 2 }}>About NIRF</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, mb: 3 }}>
                  The National Institutional Ranking Framework (NIRF) is the methodology approved and launched by the Ministry of Education that outlines the procedure of ranking higher education institutes across India. The methodology revolves around ranking the institutions based on five broad categories which are sub-categorised as well. For the simplified approach, the institutions are grouped as Category A (Institutions of National Importance, State Universities, Deemed-to-be-Universities, Private Universities and Autonomous institutions) and Category B (Institutions affiliated to a University).
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#4facfe", fontWeight: 700, mb: 2 }}>Assessment Criteria (5 Key Parameters)</Typography>
                {[
                  { title: "Teaching, Learning & Resources", items: ["Student Strength including doctoral students", "Faculty-student ratio with emphasis on permanent faculty", "Combined metric for faculty with PhD and experience", "Financial resources and their utilisation"] },
                  { title: "Research and Professional Practice", items: ["Combined metric for publications", "Combined metric for quality of publications", "IPR and Patents: Published and Granted", "The footprint of projects and professional practice"] },
                  { title: "Graduation Outcomes", items: ["Metric for University Examinations", "Metric for Number of PhD students who graduated"] },
                  { title: "Outreach and Inclusivity", items: ["Percentage of Students from other states/countries", "Percentage of women", "Economically and socially challenged students", "Facilities for physically challenged students", "Perception Ranking"] },
                  { title: "Peer Perception", items: ["Academic peers and employers"] },
                ].map((param, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ color: "#4facfe", fontWeight: 700, mb: 1 }}>{i + 1}. {param.title}</Typography>
                    {param.items.map((item, j) => (
                      <Box key={j} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>{item}</Typography>
                      </Box>
                    ))}
                  </Paper>
                ))}
              </Paper>
            </Paper>
          </>
        )}

        {/* ===== Tab 2: Scholarships & Fellowships ===== */}
        {tabIndex === 2 && (
          <>
            {/* Doctoral Fellowship for ASEAN */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4, overflow: "hidden", position: "relative" }}>
              <Box sx={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: sectionGradients[2], opacity: 0.08 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, background: sectionGradients[2], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <SchoolRoundedIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Doctoral Fellowship in India for ASEAN</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                The Doctoral Fellowship in India for ASEAN countries is a fellowship offered to around 1000 students from ASEAN nations to do PhD in any of the IITs (Indian Institute of Technology). The fellowships are dispersed by the Government of India. The purpose is to inspire and encourage more students to pursue their PhD in the country. The fellowship was launched and introduced by the honourable Prime Minister of India on the occasion of the 25th anniversary of the ASEAN-India Summit.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                The benefits offered under this fellowship are similar to the ones offered to Indian scholars and researchers. It covers the total cost of living and studies for up to 5 years. Additional funds are provided to cover research-related expenses like books, travel, etc.
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(102,126,234,0.06)", border: "1px solid rgba(102,126,234,0.1)", textAlign: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#667eea" }}>INR 31,000</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Stipend (first 2 years)</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(240,147,251,0.06)", border: "1px solid rgba(240,147,251,0.1)", textAlign: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#f093fb" }}>INR 35,000</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Stipend (remaining 3 years)</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(79,172,254,0.06)", border: "1px solid rgba(79,172,254,0.1)", textAlign: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#4facfe" }}>INR 1,70,000</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Annual research grant</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* COMPEX */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>COMPEX Scholarship</Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 3 }}>
                COMPEX is a scholarship scheme provided to Nepalese students by the Government of India for pursuing undergraduate courses (Engineering, Agriculture, Nursing and Pharmacy) in Indian institutes. Students who have either completed their 10+2 or are awaiting the result of 12th class are eligible. They must be between 17-22 years of age. Selection is done on the basis of an online Remote Proctored Exam conducted by the Embassy of India.
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#667eea", fontWeight: 700, mb: 1.5 }}>Eligibility by Course</Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { course: "B.Tech / B.E", req: "60% aggregate with 60% in PCM + 50% in English" },
                  { course: "B.Sc (Agriculture)", req: "60% aggregate with 55% in PCB + 50% in English" },
                  { course: "B.Sc (Food Tech)", req: "60% aggregate with 55% in PCB + 50% in English" },
                  { course: "B.Sc (Nursing)", req: "60% aggregate with 55% in PCB + 50% in English" },
                  { course: "B.Pharmacy", req: "60% aggregate with 55% in PCB + 50% in English" },
                ].map((row, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Typography variant="caption" sx={{ color: "#43e97b", fontWeight: 700, textTransform: "uppercase" }}>{row.course}</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mt: 0.5 }}>{row.req}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* SPDC */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Scholarship Programme for Diaspora Children (SPDC)</Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                The Scholarship Programme for Diaspora is a scholarship scheme introduced by the Government of India in 2006-2007. It is awarded to PIOs and NRIs of 66 countries to pursue undergraduate courses in Indian universities (excluding medical courses). The scholarship covers admission fees, tuition fees and post-admission requirements.
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#f093fb", fontWeight: 700, mb: 1.5 }}>Eligibility Criteria</Typography>
              <Grid container spacing={2}>
                {[
                  { icon: "1", text: "Children of PIOs, NRIs, Indian workers in ECR nations" },
                  { icon: "2", text: "Must have passed classes 11th and 12th from abroad" },
                  { icon: "3", text: "Applicants must be between 17 - 21 years of age" },
                ].map((item, i) => (
                  <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(240,147,251,0.15)", color: "#f093fb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{item.text}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* ICCR */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, background: sectionGradients[4], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <SchoolRoundedIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>Indian Council for Cultural Relations (ICCR)</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                India has a robust higher education system backed by structured pedagogy and experiential learning. The Indian Council for Cultural Relations regulates a number of scholarship schemes on an annual basis. There are more than 3000 scholarships offered through 21 schemes under the ICCR to foreign students of 180+ countries. Out of these 21, 6 schemes are funded by ICCR, while the remaining are funded by the Ministry of External Affairs and the Ministry of Ayush.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                The scholarships are offered across most of the streams (including Dance, Music, Yoga, and Ayurveda) except Medicine and all three levels (undergraduate, postgraduate and PhD).
              </Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(250,112,154,0.04)", border: "1px solid rgba(250,112,154,0.08)" }}>
                <Typography variant="subtitle2" sx={{ color: "#fa709a", fontWeight: 700, mb: 1.5 }}>21 ICCR Scholarship Schemes</Typography>
                <Grid container spacing={1}>
                  {[
                    "Atal Bihari Vajpayee General (ICCR)",
                    "Lata Mangeshkar Dance & Music (ICCR)",
                    "Silver Jubilee - Nepal (MEA)",
                    "Aid to Bhutan (MEA)",
                    "Aid to Maldives (MEA)",
                    "Aid to Mongolia (MEA)",
                    "Mekong Ganga Cooperation (MEA)",
                    "Special Scholarship - Afghan (MEA)",
                    "Scholarship for Afghan Defence Dependents (MEA)",
                    "African Scholarship (MEA)",
                    "Nehru Memorial - Sri Lanka (ICCR)",
                    "Maulana Azad - Sri Lanka (MEA)",
                    "Rajiv Gandhi - Sri Lanka (MEA)",
                    "Suborno Jayanti (ICCR)",
                    "Dr. A.P.J. Abdul Kalam Commonwealth (ICCR)",
                    "Dr. S. Radhakrishnan Cultural Exchange (ICCR)",
                    "AYUSH - BIMSTEC Countries",
                    "AYUSH - Non-BIMSTEC Countries",
                    "AYUSH - Malaysia",
                    "AYUSH - SEAR Countries",
                    "Nehru Memorial - Sri Lanka (MEA)",
                  ].map((scheme, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#fa709a", flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>{scheme}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Paper>

            {/* ITEC */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Indian Technical and Economic Cooperation (ITEC) Programme</Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9, mb: 2 }}>
                The ITEC programme was established on 15th September 1964, fully funded by the Government of India. A total of 161 countries from Africa, Asia, Latin America, East Europe, and the Pacific region are invited to share the development and growth experience India has acquired over the years. The programme is regulated by the Ministry of External Affairs, and various expenses like accommodation, tuition fees, airfare (international), and a living allowance for selected candidates are borne by the government.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                As a part of the ITEC scheme, different activities take place in other countries about India&apos;s competence as a provider of consultancy services and training opportunities in the technical field. Personnel training is also provided in fields like banking, IT, science, and personnel management. Most of the capacity-building activities and training is undertaken in different excellence centres in India.
              </Typography>
            </Paper>
          </>
        )}

        {/* CTA */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, background: "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(240,147,251,0.08))", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 2 }}>Ready to Start Your Journey?</Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3, maxWidth: 600, mx: "auto" }}>
            Begin your application process today and take the first step towards studying in India.
          </Typography>
          <Button variant="contained" size="large" onClick={() => router.push("/register")} sx={{ px: 4, py: 1.5, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontSize: "1rem", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)", transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(102,126,234,0.3)" } }}>
            Apply Now
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
