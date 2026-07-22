"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Typography, Paper, Grid, Chip, Button, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, TextField,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";

const statusColors: Record<string, any> = {
  REGISTERED: "default", PROFILE_INCOMPLETE: "warning", DOCUMENTS_PENDING: "info",
  DOCUMENTS_APPROVED: "success", PSYCHOMETRIC_ASSIGNED: "secondary", PSYCHOMETRIC_COMPLETED: "info",
  COUNSELING_IN_PROGRESS: "info",
  APPLICATIONS_STARTED: "primary", APPLICATIONS_SUBMITTED: "info",
  OFFER_RECEIVED: "success", VISA_PROCESSING: "warning", VISA_APPROVED: "success",
  ENROLLED: "success", CLOSED: "default",
};

const docStatusColors: Record<string, any> = { PENDING: "warning", APPROVED: "success", REJECTED: "error" };
const appStatusColors: Record<string, any> = {
  DRAFT: "default", SUBMITTED: "info", UNDER_REVIEW: "warning", OFFER_RECEIVED: "success",
  OFFER_ACCEPTED: "success", REJECTED: "error",
};

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [examSearch, setExamSearch] = useState("");

  useEffect(() => {
    fetch(`/api/students/${id}`).then((r) => r.json()).then((d) => {
      if (d.success) setStudent(d.data);
    }).finally(() => setLoading(false));
    fetch("/api/exam-types?limit=200").then(r => r.json()).then(d => {
      if (d.success) setExamTypes(d.data.data || []);
    });
  }, [id]);

  const studentExams: any[] = student?.entranceExams || [];

  const getStudentExam = (et: any) =>
    studentExams.find((e: any) => e.examTypeId === et.id || e.examType === et.code || e.examType === et.name);

  const filteredExamTypes = examTypes.filter((et: any) =>
    et.name.toLowerCase().includes(examSearch.toLowerCase()) ||
    et.code.toLowerCase().includes(examSearch.toLowerCase())
  );

  if (loading) return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  if (!student) return <Alert severity="error">Student not found</Alert>;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/admin/students")}>Back</Button>
        <Typography variant="h4">{student.fullName}</Typography>
        <Chip label={student.status} color={statusColors[student.status] || "default"} />
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1, "& .MuiTab-root": { fontWeight: 700, textTransform: "none" } }}>
          <Tab label="Overview" />
          <Tab label={`Documents (${student.documents?.length || 0})`} />
          <Tab label={`Applications (${student.applications?.length || 0})`} />
          <Tab label={`Psychometric (${student.psychometricTests?.length || 0})`} />
          <Tab label={`Entrance Exams (${studentExams.length}/${examTypes.length})`} />
          <Tab label="Notes & Activity" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Grid container spacing={1}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{student.email}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Mobile</Typography><Typography>{student.mobile || "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">DOB</Typography><Typography>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Gender</Typography><Typography>{student.gender || "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Country</Typography><Typography>{student.country || "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Joined</Typography><Typography>{new Date(student.createdAt).toLocaleDateString()}</Typography></Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Preferences</Typography>
              <Grid container spacing={1}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Preferred Country</Typography><Typography>{student.preferredCountry || "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Preferred University</Typography><Typography>{student.preferredUniversity || "-"}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Preferred Course</Typography><Typography>{student.preferredCourse || "-"}</Typography></Grid>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Interests</Typography><Typography>{student.interests?.join(", ") || "-"}</Typography></Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Academic History</Typography>
              <Grid container spacing={1}>
                <Grid size={4}><Typography variant="caption" color="text.secondary">10th</Typography><Typography>{student.tenthSchool || "-"} {student.tenthPercentage ? `(${student.tenthPercentage}%)` : ""}</Typography></Grid>
                <Grid size={4}><Typography variant="caption" color="text.secondary">12th</Typography><Typography>{student.twelfthSchool || "-"} {student.twelfthPercentage ? `(${student.twelfthPercentage}%)` : ""}</Typography></Grid>
                <Grid size={4}><Typography variant="caption" color="text.secondary">Graduation</Typography><Typography>{student.graduationDegree || "-"} {student.graduationPercentage ? `(${student.graduationPercentage}%)` : ""}</Typography></Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Entrance Exams</Typography>
              {studentExams.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {studentExams.map((e: any) => (
                    <Chip key={e.id} label={`${e.examType}: ${e.score || "N/A"}`} size="small" variant="outlined" color="primary" />
                  ))}
                </Box>
              ) : <Typography variant="body2" color="text.secondary">No exams recorded</Typography>}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper>
          <Typography variant="h6" sx={{ p: 2, pb: 0 }}>Documents</Typography>
          {student.documents?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>Type</TableCell><TableCell>File</TableCell><TableCell>Status</TableCell><TableCell>Version</TableCell><TableCell>Uploaded</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {student.documents.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.fileName}</TableCell>
                      <TableCell><Chip label={d.status} color={docStatusColors[d.status] || "default"} size="small" /></TableCell>
                      <TableCell>v{d.version}</TableCell>
                      <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Box sx={{ p: 2 }}><Typography color="text.secondary">No documents</Typography></Box>}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper>
          <Typography variant="h6" sx={{ p: 2, pb: 0 }}>Applications</Typography>
          {student.applications?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>University</TableCell><TableCell>Status</TableCell><TableCell>Intake</TableCell><TableCell>Submitted</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {student.applications.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.university?.name}</TableCell>
                      <TableCell><Chip label={a.status} color={appStatusColors[a.status] || "default"} size="small" /></TableCell>
                      <TableCell>{a.intake || "-"}</TableCell>
                      <TableCell>{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Box sx={{ p: 2 }}><Typography color="text.secondary">No applications</Typography></Box>}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper>
          <Typography variant="h6" sx={{ p: 2, pb: 0 }}>Psychometric Tests</Typography>
          {student.psychometricTests?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>Test</TableCell><TableCell>Status</TableCell><TableCell>Completed</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {student.psychometricTests.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.test?.title}</TableCell>
                      <TableCell><Chip label={t.status} size="small" /></TableCell>
                      <TableCell>{t.completedAt ? new Date(t.completedAt).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Box sx={{ p: 2 }}><Typography color="text.secondary">No tests assigned</Typography></Box>}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h6">Entrance Exams</Typography>
            <TextField size="small" placeholder="Search exams..." value={examSearch} onChange={(e) => setExamSearch(e.target.value)} sx={{ minWidth: 280 }} />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Exam Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Conducting Body</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExamTypes.map((et: any) => {
                  const studentExam = getStudentExam(et);
                  return (
                    <TableRow key={et.id} hover sx={{ bgcolor: studentExam ? "rgba(76,175,80,0.04)" : undefined }}>
                      <TableCell sx={{ fontWeight: 500 }}>{et.name}</TableCell>
                      <TableCell><Chip label={et.code} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ color: "text.secondary", maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {et.description || "-"}
                      </TableCell>
                      <TableCell>
                        {studentExam ? (
                          <Chip label={studentExam.score || "N/A"} size="small" color="success" variant="filled" />
                        ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip label={studentExam ? "Recorded" : "Not Taken"} size="small" color={studentExam ? "success" : "default"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredExamTypes.length === 0 && (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>No exams match your search</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Notes & Activity</Typography>
          {student.notes?.length > 0 ? (
            student.notes.map((n: any) => (
              <Box key={n.id} sx={{ mb: 1.5 }}>
                <Typography variant="body2">{n.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  By {n.author?.fullName || "Unknown"} · {new Date(n.createdAt).toLocaleDateString()}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))
          ) : <Typography color="text.secondary">No notes</Typography>}
        </Paper>
      </TabPanel>
    </Box>
  );
}
