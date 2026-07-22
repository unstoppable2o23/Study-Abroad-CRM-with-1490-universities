"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import ExploreIcon from "@mui/icons-material/Explore";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RocketIcon from "@mui/icons-material/Rocket";
import ThemeToggle from "@/components/ThemeToggle";
import GlassButton from "@/components/GlassButton";
import UniverseBackground from "@/components/UniverseBackground";
import { useThemeMode } from "@/lib/theme-context";

export default function HomePage() {
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const [uniCount, setUniCount] = useState(234);

  useEffect(() => {
    fetch("/api/universities/count")
      .then(r => r.json())
      .then(d => { if (d.success) setUniCount(d.data.count); })
      .catch(() => {});
  }, []);

  const features = [
    { title: "Career Exploration", description: "Discover careers matching your interests, skills, and personality with AI-driven assessments and guidance." },
    { title: "University Finder", description: `Find the perfect university based on your profile, preferences, and academic background across ${uniCount} institutions.` },
    { title: "Course Discovery", description: "Explore thousands of courses across multiple countries with detailed insights and comparison tools." },
    { title: "AI Recommendations", description: "Get personalized AI-powered recommendations for careers, courses, and universities tailored to you." },
    { title: "Psychometric Tests", description: "Complete assessments to understand your strengths, interests, and ideal career paths." },
    { title: "Application Tracking", description: "Track your entire admission journey — from applications to visa processing — all in one place." },
  ];

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", bgcolor: isDark ? "#0a0a1a" : "#f5f5f5" }}>
      <UniverseBackground />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <SchoolIcon />
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <ThemeToggle />
            <GlassButton onClick={() => router.push("/login")}>
              Login
            </GlassButton>
            <GlassButton onClick={() => router.push("/register")} sx={{ background: isDark ? "linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.2))" : "linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.15))" }}>
              Register
            </GlassButton>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", py: { xs: 8, md: 14 } }}>
          <Typography variant="body2" sx={{ display: "inline-block", px: 2, py: 0.5, borderRadius: 2, bgcolor: "rgba(102,126,234,0.12)", color: "#667eea", fontWeight: 700, mb: 3, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem" }}>
            Your Global Education Journey Starts Here
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: "2.5rem", md: "4rem" }, lineHeight: 1.1, mb: 2, background: isDark ? "linear-gradient(135deg, #fff 0%, #667eea 50%, #f093fb 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #667eea 50%, #f093fb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Discover. Compare. Apply.
          </Typography>
          <Typography variant="h6" sx={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)", mb: 5, maxWidth: 600, mx: "auto", fontWeight: 400, fontSize: { xs: "1rem", md: "1.2rem" } }}>
            Explore leading universities in India and around the world. Discover the right courses, compare programs, explore career opportunities, and manage your entire admission journey with AI-powered guidance.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <GlassButton onClick={() => router.push("/register")} sx={{ px: 4, py: 1.5, fontSize: "1rem", background: isDark ? "linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.2))" : "linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.15))" }}>
              Get Started Free
            </GlassButton>
            <GlassButton onClick={() => router.push("/login")} sx={{ px: 4, py: 1.5, fontSize: "1rem" }}>
              Sign In
            </GlassButton>
          </Box>
        </Box>

        <Box sx={{ py: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 3, md: 6 }, mb: 8, flexWrap: "wrap" }}>
            {["Universities Worldwide", "Career Paths", "AI-Powered", "Smart Tools"].map((stat, i) => (
              <Box key={stat} sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: 900, background: i === 0 ? "linear-gradient(135deg, #667eea, #764ba2)" : i === 1 ? "linear-gradient(135deg, #43e97b, #38f9d7)" : i === 2 ? "linear-gradient(135deg, #f093fb, #f5576c)" : "linear-gradient(135deg, #4facfe, #00f2fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {[uniCount, 33, "∞", "7+"][i]}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontWeight: 600, mt: 0.5 }}>{stat}</Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 800, color: isDark ? "#fff" : "text.primary", mb: 4 }}>
            Everything You Need
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, idx) => {
              const gradients = [
                "linear-gradient(135deg, #667eea, #764ba2)",
                "linear-gradient(135deg, #43e97b, #38f9d7)",
                "linear-gradient(135deg, #f093fb, #f5576c)",
                "linear-gradient(135deg, #4facfe, #00f2fe)",
                "linear-gradient(135deg, #fa709a, #fee140)",
                "linear-gradient(135deg, #667eea, #f093fb)",
              ];
              const icons = [
                <ExploreIcon key="e" />,
                <SchoolIcon key="s" />,
                <RocketIcon key="r" />,
                <PsychologyIcon key="p" />,
                <SchoolIcon key="sc" />,
                <RocketIcon key="ro" />,
              ];
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.title}>
                  <Paper
                    elevation={0}
                    onClick={() => router.push("/login")}
                    sx={{
                      p: 3, height: "100%", borderRadius: 3, position: "relative", overflow: "hidden", cursor: "pointer",
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
                      backdropFilter: "blur(12px)",
                      transition: "all 0.3s ease",
                      "&:hover": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)", transform: "translateY(-4px)", boxShadow: isDark ? "0 12px 32px rgba(0,0,0,0.3)" : "0 12px 32px rgba(0,0,0,0.08)" },
                    }}
                  >
                    <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: gradients[idx], opacity: 0.08 }} />
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, background: gradients[idx], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", mb: 2 }}>
                      {icons[idx]}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? "#fff" : "text.primary", mb: 1 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", lineHeight: 1.7, mb: 1.5 }}>{feature.description}</Typography>
                    <Typography variant="caption" sx={{ color: "#667eea", fontWeight: 700, opacity: 0.7 }}>Sign in to access →</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Box sx={{ textAlign: "center", py: 6, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, mt: 4 }}>
          <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
            © 2026 Study Abroad. All rights reserved.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}

