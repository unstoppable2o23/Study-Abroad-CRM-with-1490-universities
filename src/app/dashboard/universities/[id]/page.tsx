"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Paper, Grid, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Skeleton } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx, staggerFadeIn } from "@/lib/dashboard-ui";

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [uni, setUni] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/universities/${id}`).then((r) => r.json()).then((d) => {
      if (d.success) setUni(d.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Skeleton variant="rounded" width={120} height={36} sx={{ mb: 2 }} />
      <Paper sx={{ ...cardSx, ...glassBg, p: 4, mb: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Skeleton variant="rounded" width={200} height={120} sx={{ mx: "auto", borderRadius: 2 }} />
        </Box>
        <Skeleton variant="rounded" width="60%" height={36} sx={{ mb: 1, mx: "auto" }} />
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}>
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={100} height={28} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6 }} key={i}>
              <Skeleton variant="rounded" width="70%" height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="rounded" width="50%" height={20} />
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Skeleton variant="rounded" width="100%" height={200} sx={{ mb: 3, borderRadius: 3 }} />
      <Skeleton variant="rounded" width="100%" height={150} sx={{ borderRadius: 3 }} />
    </Container>
  );

  if (!uni) return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()}
        sx={{ mb: 2, borderRadius: 2, color: "text.secondary" }}>
        Back
      </Button>
      <Alert severity="error" sx={{ borderRadius: 2 }}>University not found</Alert>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()}
        sx={{
          mb: 2, borderRadius: 2, color: "text.secondary", fontWeight: 600,
          "&:hover": { bgcolor: "rgba(255,255,255,0.5)" },
        }}>
        Back
      </Button>

      <Paper sx={{ ...cardSx, ...glassBg, p: 4, mb: 3 }}>
        {uni.logoUrl && (
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img
              src={uni.logoUrl}
              alt={uni.name}
              style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain", borderRadius: 12 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </Box>
        )}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, letterSpacing: "-0.5px", textAlign: uni.logoUrl ? "center" : "left" }}>
          {uni.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap", justifyContent: uni.logoUrl ? "center" : "flex-start" }}>
          <Chip label={uni.country?.name} size="small" sx={chipStatusSx("#22c55e")} />
          {uni.city && <Chip label={uni.city} size="small" sx={chipStatusSx("#3b82f6")} />}
          {uni.ranking && <Chip label={`World Rank: #${uni.ranking}`} size="small" sx={chipStatusSx(accent)} />}
          {uni.universityType && <Chip label={uni.universityType} size="small" sx={chipStatusSx("#f59e0b")} />}
        </Box>
        {uni.description && (
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary", lineHeight: 1.7 }}>
            {uni.description}
          </Typography>
        )}
        <Grid container spacing={2.5}>
          {uni.website && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary", mb: 0.3 }}>Website</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                <a href={uni.website} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "none" }}>{uni.website}</a>
              </Typography>
            </Grid>
          )}
          {uni.applicationFee && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary", mb: 0.3 }}>Application Fee</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${uni.applicationFee.toLocaleString()}</Typography>
            </Grid>
          )}
          {uni.rankingSource && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary", mb: 0.3 }}>Ranking Source</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{uni.rankingSource}</Typography>
            </Grid>
          )}
          {uni.intakePeriods?.length > 0 && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary", mb: 0.3 }}>Intake Periods</Typography>
              <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                {uni.intakePeriods.map((p: string) => (
                  <Chip key={p} label={p} size="small" variant="outlined"
                    sx={{ borderRadius: 1.5, fontWeight: 600, borderColor: `${accent}30`, color: accent }} />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {uni.courses?.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, mb: 3, overflow: "hidden" }}>
          <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Box sx={sectionHeaderSx}>
              <Box sx={gradientIcon()}><SchoolIcon sx={{ fontSize: 16 }} /></Box>
              <Typography variant="h6" sx={sectionTitleSx}>Courses</Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadSx}>Course</TableCell>
                  <TableCell sx={tableHeadSx}>Level</TableCell>
                  <TableCell sx={tableHeadSx}>Category</TableCell>
                  <TableCell sx={tableHeadSx}>Fee Range</TableCell>
                  <TableCell sx={tableHeadSx}>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uni.courses.map((c: any) => (
                  <TableRow key={c.id} sx={tableRowHoverSx()}>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell>
                      <Chip label={c.level} size="small" sx={chipStatusSx(accent)} />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.category}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {c.tuitionFeeMin ? `$${c.tuitionFeeMin.toLocaleString()}` : "-"}
                      {c.tuitionFeeMax ? ` - $${c.tuitionFeeMax.toLocaleString()}` : ""}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.duration || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {uni.scholarships?.length > 0 && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3 }}>
          <Box sx={sectionHeaderSx}>
            <Box sx={gradientIcon("#22c55e")}><SchoolIcon sx={{ fontSize: 16 }} /></Box>
            <Typography variant="h6" sx={sectionTitleSx}>Scholarships</Typography>
          </Box>
          <Grid container spacing={2}>
            {uni.scholarships.map((s: any) => (
              <Grid size={{ xs: 12 }} key={s.id}>
                <Paper sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.4)",
                  border: glassBorder,
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{s.name}</Typography>
                  <Grid container spacing={1}>
                    {s.amount && (
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.4px", color: "text.secondary" }}>Amount</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>${s.amount.toLocaleString()}</Typography>
                      </Grid>
                    )}
                    {s.eligibility && (
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.4px", color: "text.secondary" }}>Eligibility</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.eligibility}</Typography>
                      </Grid>
                    )}
                    {s.deadline && (
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.4px", color: "text.secondary" }}>Deadline</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(s.deadline).toLocaleDateString()}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
}
