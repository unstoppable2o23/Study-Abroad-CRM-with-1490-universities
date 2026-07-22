"use client";

import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Paper, TextField, Chip, CircularProgress,
  Stepper, Step, StepLabel, StepContent, Collapse, Skeleton,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, staggerFadeIn } from "@/lib/dashboard-ui";

const matchScoreColor = (score: number) =>
  score >= 80 ? "#4caf50" : score >= 60 ? "#ff9800" : "#f44336";

const pulseSx = {
  "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
  animation: "pulse 1.5s ease-in-out infinite",
};

export default function CareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/career-roadmap")
      .then(r => r.json())
      .then(d => { if (d.success) setRecommendations(d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingRoadmap(false));
  }, []);

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/careers${params}`).then(r => r.json()).then(d => { if (d.success) setCareers(d.data); });
  }, [search]);

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={{ ...sectionHeaderSx, mb: 4 }}>
        <Box sx={gradientIcon()}>
          <WorkIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={sectionTitleSx}>Career Roadmap</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25, fontSize: "0.85rem" }}>
            Personalized career guidance based on your profile
          </Typography>
        </Box>
      </Box>

      {loadingRoadmap ? (
        <Box sx={{ ...cardSx, ...glassBg, border: glassBorder, p: 3, mb: 4 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[0, 1, 2].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
            <CircularProgress size={18} sx={{ color: accent }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, ...pulseSx }}>
              Analyzing your profile to generate personalized career recommendations...
            </Typography>
          </Box>
        </Box>
      ) : recommendations.length > 0 ? (
        <Box sx={{ mb: 5 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon(accent)}>
              <SchoolIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={sectionTitleSx}>Recommended for You</Typography>
          </Box>
          <Grid container spacing={2.5}>
            {recommendations.map((rec: any, idx: number) => (
              <Grid size={{ xs: 12, md: 6 }} key={rec.careerId} sx={staggerFadeIn(idx)}>
                <Paper
                  sx={{ ...cardSx, ...glassBg, border: glassBorder, p: 3, cursor: "pointer" }}
                  onClick={() => setExpandedCard(expandedCard === rec.careerId ? null : rec.careerId)}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.3px" }}>
                      {rec.careerName}
                    </Typography>
                    <Chip
                      label={`${rec.matchScore}% Match`}
                      size="small"
                      sx={chipStatusSx(matchScoreColor(rec.matchScore))}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.6 }}>
                    {rec.whyMatch}
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main", "&:hover": { opacity: 0.8 } }}
                  >
                    {expandedCard === rec.careerId ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {expandedCard === rec.careerId ? "Hide Roadmap" : "View Roadmap"}
                    </Typography>
                  </Box>
                  <Collapse in={expandedCard === rec.careerId}>
                    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: glassBorder }}>
                      <Stepper
                        orientation="vertical"
                        sx={{
                          "& .MuiStepLabel-iconContainer .Mui-active .MuiStepIcon-text": { fill: "#fff", fontWeight: 700, fontSize: "0.75rem" },
                          "& .MuiStepLabel-iconContainer .Mui-active": { color: accent },
                          "& .MuiStepLabel-label": { fontWeight: 700, fontSize: "0.85rem" },
                          "& .MuiStepContent-root": { ml: 2.5, borderLeftColor: `${accent}20` },
                          "& .MuiStepConnector-line": { borderLeftColor: `${accent}20` },
                        }}
                      >
                        {(rec.roadmap || []).map((step: any, i: number) => (
                          <Step key={i} active>
                            <StepLabel>{step.title}</StepLabel>
                            <StepContent>
                              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, lineHeight: 1.6 }}>
                                {step.description}
                              </Typography>
                              {step.timeline && (
                                <Chip
                                  label={step.timeline}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", fontWeight: 600, borderColor: `${accent}30`, color: accent }}
                                />
                              )}
                            </StepContent>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ ...cardSx, ...glassBg, border: glassBorder, p: 4, mb: 5, textAlign: "center" }}>
          <SchoolIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>No recommendations yet</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Complete your psychometric tests and profile to get personalized career recommendations.
          </Typography>
        </Box>
      )}

      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon(accent)}>
          <SearchIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={sectionTitleSx}>Browse All Careers</Typography>
      </Box>
      <TextField
        fullWidth
        placeholder="Search careers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            sx: { borderRadius: 3, ...glassBg, border: glassBorder, "&.Mui-focused": { borderColor: accent } },
          },
        }}
        sx={{ mb: 3 }}
      />
      <Grid container spacing={2.5}>
        {careers.map((career, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={career.id} sx={staggerFadeIn(idx)}>
            <Paper sx={{ ...cardSx, ...glassBg, border: glassBorder, p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.3px", mb: 1 }}>
                {career.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6, flex: 1 }}>
                {career.description?.slice(0, 150)}...
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                {career.skills?.slice(0, 5).map((s: string) => (
                  <Chip key={s} label={s} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: `${accent}10`, color: accent }} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                {career._count?.courses} courses &middot; {career._count?.psychometricMatches} test matches
              </Typography>
            </Paper>
          </Grid>
        ))}
        {!careers.length && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ ...cardSx, ...glassBg, border: glassBorder, p: 4, textAlign: "center" }}>
              <SearchIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {search ? "No careers match your search" : "No careers available"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {search ? "Try adjusting your search terms or browse all careers." : "Check back later for new career listings."}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
