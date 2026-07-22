"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, FormControl, Chip, CircularProgress, Alert, LinearProgress, Divider, Skeleton } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { Psychology as PsychologyIcon } from "@mui/icons-material";

import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, staggerFadeIn } from "@/lib/dashboard-ui";

export default function TestTakingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchTest = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/student/tests/${id}`);
    const d = await res.json();
    if (d.success) {
      if (d.data.status === "ASSIGNED") {
        const startRes = await fetch(`/api/student/tests/${id}/start`, { method: "POST" });
        const startData = await startRes.json();
        if (startData.success) {
          setAssignment({ ...d.data, ...startData.data, status: "IN_PROGRESS" });
        } else {
          setError(startData.error || "Failed to start test");
        }
      } else {
        setAssignment(d.data);
      }
    } else {
      setError(d.error || "Failed to load test");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchTest(); }, [fetchTest]);

  const handleSubmit = async () => {
    if (!confirm("Submit your answers? This cannot be undone.")) return;
    setSubmitting(true);
    const res = await fetch(`/api/psychometric/assignments/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const d = await res.json();
    if (d.success) {
      setResult(d.data);
      setAssignment((prev: any) => ({ ...prev, status: "COMPLETED" }));
    } else {
      alert(d.error || "Failed to submit");
    }
    setSubmitting(false);
  };

  const allQuestions = () => {
    if (!assignment?.test) return [];
    const test = assignment.test;
    if (test.sections?.length) {
      return test.sections.flatMap((s: any) =>
        (s.questions || []).map((q: any) => ({ ...q, sectionTitle: s.title }))
      );
    }
    return (test.questions || []).map((q: any) => ({ ...q, sectionTitle: null }));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={8} sx={{ mb: 3, borderRadius: 4 }} />
        <Skeleton variant="rounded" width="100%" height={90} sx={{ mb: 3, borderRadius: 3 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={200} sx={{ mb: 2, borderRadius: 3 }} />
        ))}
      </Container>
    );
  }
  if (error) return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (result) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ ...glassBg, ...cardSx, p: 4, textAlign: "center" }}>
          <Box sx={gradientIcon("")}><PsychologyIcon /></Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>Test Submitted!</Typography>
          <Box
            sx={{
              width: 140, height: 140, borderRadius: "50%", mx: "auto", my: 3,
              background: `conic-gradient(${accent} ${result.score?.percentage || 0}%, rgba(0,0,0,0.06) 0%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.6s ease forwards",
              "@keyframes fadeIn": { from: { opacity: 0, transform: "scale(0.8)" }, to: { opacity: 1, transform: "scale(1)" } },
            }}
          >
            <Box sx={{ width: 110, height: 110, borderRadius: "50%", bgcolor: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h3" sx={{ fontWeight: 900, background: accentGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.8rem" }}>
                {result.score?.percentage?.toFixed(1) || 0}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>Score: {result.score?.total || 0} / {result.score?.max || 0}</Typography>
          <Button variant="contained" sx={{ mt: 2, background: accentGradient, px: 4, borderRadius: 2 }} onClick={() => router.push("/dashboard/tests")}>Back to Tests</Button>
        </Paper>
      </Container>
    );
  }
  if (!assignment) return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="error">Test not found</Alert></Container>;

  const questions = allQuestions();
  const answered = Object.keys(answers).length;
  const total = questions.length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={gradientIcon("")}><PsychologyIcon /></Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#1a1a2e" }}>{assignment.test?.title || "Test"}</Typography>
            {assignment.test?.timeLimit && (
              <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>
                Time limit: {assignment.test.timeLimit} min · {answered}/{total} answered
              </Typography>
            )}
          </Box>
        </Box>
        <Chip label={assignment.status} sx={chipStatusSx(assignment.status === "IN_PROGRESS" ? "#ff9800" : "#667eea")} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "rgba(0,0,0,0.4)" }}>Progress</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: accent }}>{Math.round((answered / total) * 100)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={(answered / total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(102,126,234,0.12)", "& .MuiLinearProgress-bar": { background: accentGradient, borderRadius: 4 } }} />
      </Box>

      {assignment.test?.instructions && (
        <Paper sx={{ ...glassBg, ...cardSx, p: 2.5, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.5px" }}>Instructions</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.65)", lineHeight: 1.7 }}>{assignment.test.instructions}</Typography>
        </Paper>
      )}

      {(!assignment.test?.sections?.length && !assignment.test?.questions?.length) && (
        <Paper sx={{ ...glassBg, ...cardSx, p: 4, textAlign: "center" }}><Typography>No questions in this test</Typography></Paper>
      )}

      {assignment.test?.sections?.length > 0 ? (
        assignment.test.sections.map((section: any, si: number) => (
          <Paper key={section.id} sx={{ ...glassBg, ...cardSx, p: 3, mb: 3, ...staggerFadeIn(si) }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1a1a2e", mb: 0.5 }}>{section.title}</Typography>
            {section.description && <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.5)", mb: 2 }}>{section.description}</Typography>}
            <Divider sx={{ mb: 2, borderColor: "rgba(0,0,0,0.06)" }} />
            {(section.questions || []).map((q: any, qi: number) => (
              <Box key={q.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5, lineHeight: 1.5 }}>
                  <Box component="span" sx={{ color: accent, fontWeight: 800, mr: 0.5 }}>{qi + 1}.</Box> {q.question}
                  {q.category && <Chip label={q.category} size="small" sx={{ ml: 1, ...chipStatusSx(accent) }} />}
                </Typography>
                {q.scoringRule === "RATING_SCALE" ? (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Button
                        key={val}
                        variant={answers[q.id] === String(val) ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: String(val) }))}
                        sx={{
                          minWidth: 44, borderRadius: 2, fontWeight: 700, fontSize: "0.9rem",
                          ...(answers[q.id] === String(val) ? { background: accentGradient, borderColor: "transparent", color: "#fff" } : { borderColor: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }),
                          "&:hover": answers[q.id] === String(val) ? { background: accentGradient, opacity: 0.9 } : { borderColor: accent, color: accent },
                        }}
                      >
                        {val}
                      </Button>
                    ))}
                  </Box>
                ) : (
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}>
                      {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                        <FormControlLabel
                          key={oi} value={opt}
                          control={<Radio size="small" sx={{ "&.Mui-checked": { color: accent } }} />}
                          label={opt}
                          sx={{
                            mb: 0.3, borderRadius: 1.5, px: 1.5, py: 0.3,
                            transition: "all 0.15s",
                            "&:hover": { bgcolor: "rgba(102,126,234,0.04)" },
                            ...(answers[q.id] === opt ? { bgcolor: "rgba(102,126,234,0.06)" } : {}),
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
                {qi < (section.questions || []).length - 1 && <Divider sx={{ mt: 2, borderColor: "rgba(0,0,0,0.04)" }} />}
              </Box>
            ))}
          </Paper>
        ))
      ) : (
        <Paper sx={{ ...glassBg, ...cardSx, p: 3 }}>
          {(assignment.test?.questions || []).map((q: any, qi: number) => (
            <Box key={q.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1.5, lineHeight: 1.5 }}>
                <Box component="span" sx={{ color: accent, fontWeight: 800, mr: 0.5 }}>{qi + 1}.</Box> {q.question}
                {q.category && <Chip label={q.category} size="small" sx={{ ml: 1, ...chipStatusSx(accent) }} />}
              </Typography>
              {q.scoringRule === "RATING_SCALE" ? (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Button
                      key={val}
                      variant={answers[q.id] === String(val) ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: String(val) }))}
                      sx={{
                        minWidth: 44, borderRadius: 2, fontWeight: 700, fontSize: "0.9rem",
                        ...(answers[q.id] === String(val) ? { background: accentGradient, borderColor: "transparent", color: "#fff" } : { borderColor: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }),
                        "&:hover": answers[q.id] === String(val) ? { background: accentGradient, opacity: 0.9 } : { borderColor: accent, color: accent },
                      }}
                    >
                      {val}
                    </Button>
                  ))}
                </Box>
              ) : (
                <FormControl component="fieldset">
                  <RadioGroup value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}>
                    {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                      <FormControlLabel
                        key={oi} value={opt}
                        control={<Radio size="small" sx={{ "&.Mui-checked": { color: accent } }} />}
                        label={opt}
                        sx={{
                          mb: 0.3, borderRadius: 1.5, px: 1.5, py: 0.3,
                          transition: "all 0.15s",
                          "&:hover": { bgcolor: "rgba(102,126,234,0.04)" },
                          ...(answers[q.id] === opt ? { bgcolor: "rgba(102,126,234,0.06)" } : {}),
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
              {qi < (assignment.test.questions || []).length - 1 && <Divider sx={{ mt: 2, borderColor: "rgba(0,0,0,0.04)" }} />}
            </Box>
          ))}
        </Paper>
      )}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained" size="large" onClick={handleSubmit}
          disabled={submitting || answered === 0}
          sx={{ px: 6, py: 1.4, borderRadius: 2, background: accentGradient, fontWeight: 800, fontSize: "1rem", boxShadow: "0 4px 20px rgba(102,126,234,0.35)", "&:hover": { boxShadow: "0 6px 28px rgba(102,126,234,0.5)" }, "&.Mui-disabled": { background: "rgba(0,0,0,0.08)" } }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : `Submit (${answered}/${total})`}
        </Button>
      </Box>
    </Container>
  );
}
