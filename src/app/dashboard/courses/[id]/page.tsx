"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box, Container, Typography, Chip, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Skeleton, Alert, Divider,
} from "@mui/material";
import {
  School, AccessTime, CurrencyExchange, Category, LocationOn, Business,
  CheckCircle, Star, WorkOutlined,
} from "@mui/icons-material";
import {
  accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon,
  sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, staggerFadeIn,
  chipStatusSx, tableHeadSx, tableRowHoverSx, kpiValueSx,
} from "@/lib/dashboard-ui";

const levelColors: Record<string, string> = {
  BACHELOR: "#1976d2", MASTER: "#7b1fa2", PHD: "#c62828",
  DIPLOMA: "#2e7d32", CERTIFICATE: "#e65100",
};

interface FeeStructure {
  tuition?: { min: number; max: number; currency: string };
  applicationFee?: number;
  totalFees?: number;
  livingExpenses?: number;
  onlinePrograms?: Array<{ program: string; totalFees: string; duration: string }>;
  mbbs?: Array<{ program: string; totalFees: string; duration: string }>;
  [key: string]: unknown;
}

interface UniversityBrief {
  id: string; name: string; logoUrl?: string | null; city?: string | null;
  countryId?: string; feeStructure?: FeeStructure | null;
}

interface UniversityCourseItem {
  id: string; universityId: string; courseId: string;
  fees: FeeStructure | null; duration: string | null; intakeMonths: string[];
  language: string | null; campus: string | null; isActive: boolean;
  university: UniversityBrief;
}

interface CareerItem {
  id: string; name: string; description?: string | null;
  skills?: string[]; salaryTrends?: unknown;
}

interface CourseDetail {
  id: string; name: string; code?: string | null; level: string; category: string;
  description?: string | null; duration?: string | null;
  tuitionFeeMin?: number | null; tuitionFeeMax?: number | null; currency?: string | null;
  skills: string[]; entranceExams: string[];
  eligibility?: unknown; requirements?: unknown;
  careerOutcomes?: unknown; languageRequirements?: unknown;
  status: string;
  country: { id: string; name: string; code: string };
  university?: { id: string; name: string; city?: string | null; logoUrl?: string | null } | null;
  universityCourses: UniversityCourseItem[];
  careers: CareerItem[];
  scholarships: unknown[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/courses/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCourse(d.data);
        else setError(d.error || "Failed to load course");
      })
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Skeleton variant="rounded" height={40} width={300} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={24} width={200} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  if (error) return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
    </Container>
  );

  if (!course) return null;

  const mainUniversity = course.university;
  const offeringUniversities = course.universityCourses
    .filter((uc) => uc.isActive)
    .map((uc) => uc.university);
  const allUniversities = mainUniversity && !offeringUniversities.some((u) => u.id === mainUniversity.id)
    ? [mainUniversity, ...offeringUniversities]
    : offeringUniversities;

  const renderFee = (uc: UniversityCourseItem) => {
    const f = uc.fees;
    if (!f) return "Contact for fees";
    if (f.onlinePrograms && f.onlinePrograms.length > 0) {
      return f.onlinePrograms[0].totalFees;
    }
    if (f.mbbs && f.mbbs.length > 0) {
      return f.mbbs[0].totalFees;
    }
    if (f.tuition) {
      return `${f.tuition.currency || "$"}${f.tuition.min.toLocaleString()}${f.tuition.max ? ` - ${f.tuition.currency || "$"}${f.tuition.max.toLocaleString()}` : ""}`;
    }
    if (f.totalFees) {
      return `$${f.totalFees.toLocaleString()}`;
    }
    return "Contact for fees";
  };

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={gradientIcon(accent)}>
            <School sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.5px", mb: 0.5 }}>
              {course.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip label={course.level} size="small"
                sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: `${levelColors[course.level] || accent}14`, color: levelColors[course.level] || accent, height: 24 }} />
              <Chip label={course.category} size="small" sx={{ fontWeight: 600, fontSize: "0.72rem", bgcolor: "rgba(0,0,0,0.04)", color: "text.secondary", height: 24 }} />
              {course.country && (
                <Chip icon={<LocationOn sx={{ fontSize: 14 }} />} label={course.country.name} size="small"
                  sx={{ fontWeight: 600, fontSize: "0.72rem", bgcolor: "rgba(0,0,0,0.04)", color: "text.secondary", height: 24 }} />
              )}
              {course.code && (
                <Typography variant="caption" sx={{ color: "text.disabled", fontFamily: "monospace" }}>{course.code}</Typography>
              )}
            </Box>
          </Box>
        </Box>

        {course.description && (
          <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 800, mb: 3 }}>
            {course.description}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {course.duration && (
          <Grid size={{ xs: 6, md: 3 }} sx={staggerFadeIn(0)}>
            <Paper sx={{ ...cardSx, ...glassBg, p: 2.5, textAlign: "center" }}>
              <AccessTime sx={{ fontSize: 24, color: accent, mb: 0.5 }} />
              <Typography sx={{ ...kpiValueSx, fontSize: "1.1rem" }}>{course.duration}</Typography>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>Duration</Typography>
            </Paper>
          </Grid>
        )}
        <Grid size={{ xs: 6, md: 3 }} sx={staggerFadeIn(1)}>
          <Paper sx={{ ...cardSx, ...glassBg, p: 2.5, textAlign: "center" }}>
            <CurrencyExchange sx={{ fontSize: 24, color: accent, mb: 0.5 }} />
            <Typography sx={{ ...kpiValueSx, fontSize: "1.1rem" }}>
              {course.tuitionFeeMin ? `${course.currency || "$"}${course.tuitionFeeMin.toLocaleString()}` : "N/A"}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>Min Fee</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }} sx={staggerFadeIn(2)}>
          <Paper sx={{ ...cardSx, ...glassBg, p: 2.5, textAlign: "center" }}>
            <Business sx={{ fontSize: 24, color: accent, mb: 0.5 }} />
            <Typography sx={{ ...kpiValueSx, fontSize: "1.1rem" }}>{course.universityCourses.length}</Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>Universities</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }} sx={staggerFadeIn(3)}>
          <Paper sx={{ ...cardSx, ...glassBg, p: 2.5, textAlign: "center" }}>
            <Star sx={{ fontSize: 24, color: accent, mb: 0.5 }} />
            <Typography sx={{ ...kpiValueSx, fontSize: "1.1rem" }}>{course.careers.length}</Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>Careers</Typography>
          </Paper>
        </Grid>
      </Grid>

      {course.skills.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3, mb: 4 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon(accent)}><CheckCircle sx={{ fontSize: 18 }} /></Box>
            <Typography sx={sectionTitleSx}>Skills You&apos;ll Gain</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {course.skills.map((s) => (
              <Chip key={s} label={s} size="small"
                sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: `${accent}0d`, color: accent, height: 26, borderRadius: 1.5 }} />
            ))}
          </Box>
        </Paper>
      )}

      {course.entranceExams.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3, mb: 4 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon(accent)}><Star sx={{ fontSize: 18 }} /></Box>
            <Typography sx={sectionTitleSx}>Required Exams</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {course.entranceExams.map((e) => (
              <Chip key={e} label={e} size="small"
                sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: "rgba(245,158,11,0.1)", color: "#d97706", height: 26, borderRadius: 1.5 }} />
            ))}
          </Box>
        </Paper>
      )}

      {allUniversities.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3, mb: 4 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon(accent)}><Business sx={{ fontSize: 18 }} /></Box>
            <Typography sx={sectionTitleSx}>Universities Offering This Course</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadSx}>University</TableCell>
                  <TableCell sx={tableHeadSx}>Location</TableCell>
                  <TableCell sx={tableHeadSx}>Fee Structure</TableCell>
                  <TableCell sx={tableHeadSx}>Duration</TableCell>
                  <TableCell sx={tableHeadSx}>Intake</TableCell>
                  <TableCell sx={tableHeadSx}>Campus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {course.universityCourses.filter((uc) => uc.isActive).map((uc, i) => (
                  <TableRow key={uc.id} sx={tableRowHoverSx(accent)}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={uc.university.logoUrl || undefined} sx={{ width: 32, height: 32, bgcolor: `${accent}20`, fontSize: "0.75rem", fontWeight: 800 }}>
                          {uc.university.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>{uc.university.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                      {uc.university.city || "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                      {renderFee(uc)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>{uc.duration || course.duration || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>
                      {uc.intakeMonths?.length > 0 ? uc.intakeMonths.join(", ") : "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem" }}>{uc.campus || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {course.careers.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3, mb: 4 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon(accent)}><WorkOutlined sx={{ fontSize: 18 }} /></Box>
            <Typography sx={sectionTitleSx}>Career Paths</Typography>
          </Box>
          <Grid container spacing={2}>
            {course.careers.map((cr, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cr.id} sx={staggerFadeIn(i)}>
                <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", height: "100%", bgcolor: "transparent" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", mb: 0.5 }}>{cr.name}</Typography>
                  {cr.description && (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.5 }}>
                      {cr.description}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
}
