"use client";

import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Paper, TextField, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx, staggerFadeIn } from "@/lib/dashboard-ui";

export default function StudentExamTypesPage() {
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/exam-types?${params}`).then(r => r.json()).then(d => {
      if (d.success) setExamTypes(d.data.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  return (
    <Container maxWidth="lg" sx={pageContainerSx}>
      <Box sx={sectionHeaderSx}>
        <Box sx={gradientIcon()}><AssignmentIcon sx={{ fontSize: 18 }} /></Box>
        <Box>
          <Typography variant="h5" sx={sectionTitleSx}>Entrance Exams</Typography>
          <Typography variant="body2" color="text.secondary">Browse entrance exams for universities worldwide</Typography>
        </Box>
      </Box>

      <TextField
        size="small"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} /> } }}
        sx={{
          mb: 3, minWidth: 350,
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: glassBorder,
            "& fieldset": { border: "none" },
            "&:hover": { bgcolor: "rgba(255,255,255,0.7)" },
            "&.Mui-focused": { bgcolor: "rgba(255,255,255,0.8)" },
          },
        }}
      />

      {loading ? (
        <Paper sx={{ ...cardSx, ...glassBg, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 2, display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" width={i === 1 ? 200 : i === 2 ? 80 : i === 3 ? 60 : i === 4 ? 180 : 80} height={16} />
            ))}
          </Box>
          {[1, 2, 3, 4, 5].map((r) => (
            <Box key={r} sx={{ px: 2, py: 1.5, display: "flex", gap: 2, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
              <Skeleton variant="rounded" width={200} height={20} />
              <Skeleton variant="rounded" width={80} height={20} />
              <Skeleton variant="rounded" width={60} height={20} />
              <Skeleton variant="rounded" width={180} height={20} />
              <Skeleton variant="rounded" width={80} height={20} />
            </Box>
          ))}
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ ...cardSx, ...glassBg, borderRadius: 3, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeadSx}>Exam Name</TableCell>
                <TableCell sx={tableHeadSx}>Code</TableCell>
                <TableCell sx={tableHeadSx}>Level</TableCell>
                <TableCell sx={tableHeadSx}>Conducting Body</TableCell>
                <TableCell sx={tableHeadSx}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examTypes.map((et: any) => (
                <TableRow key={et.id} sx={tableRowHoverSx()}>
                  <TableCell sx={{ fontWeight: 600 }}>{et.name}</TableCell>
                  <TableCell><Chip label={et.code} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 600 }} /></TableCell>
                  <TableCell>
                    <Chip
                      label={et.description?.includes("PG") ? "PG" : "UG"}
                      size="small"
                      sx={chipStatusSx(accent)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {et.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={et.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={et.isActive ? chipStatusSx("#22c55e") : chipStatusSx("#94a3b8")}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {examTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>No entrance exams found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try adjusting your search criteria</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
