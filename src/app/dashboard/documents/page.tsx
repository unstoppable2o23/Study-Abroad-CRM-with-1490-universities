"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, Skeleton } from "@mui/material";
import { CloudUpload, Description, Article, School, Badge, ContactMail, Language, Assignment } from "@mui/icons-material";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx } from "@/lib/dashboard-ui";

const DOCUMENT_TYPES = ["PASSPORT", "TRANSCRIPTS", "SOP", "RESUME", "LOR", "IELTS", "TOEFL", "PTE", "GRE", "GMAT", "SAT"];

const docIcons: Record<string, any> = {
  PASSPORT: Badge,
  TRANSCRIPTS: Article,
  SOP: Description,
  RESUME: Assignment,
  LOR: ContactMail,
  IELTS: Language,
  TOEFL: Language,
  PTE: Language,
  GRE: School,
  GMAT: School,
  SAT: School,
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then((d) => { if (d.success) setDocs(d.data); }).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.jpg,.png,.heic";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setDocs((prev) => [data.data, ...prev]);
        setMessage(`${type} uploaded successfully`);
      } else {
        setMessage(data.error || "Upload failed");
      }
    };
    input.click();
  };

  const statusColor: Record<string, any> = { PENDING: "warning", APPROVED: "success", REJECTED: "error", PROCESSING: "info" };

  const statusPalette: Record<string, string> = {
    PENDING: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    PROCESSING: "#3b82f6",
  };

  return (
    <Container maxWidth="lg" sx={{ ...pageContainerSx }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box sx={gradientIcon()}>
          <Description sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}>Documents</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>Upload and manage your application documents</Typography>
        </Box>
      </Box>

      {message && <Alert severity={message.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <Box sx={{ mb: 4, ...cardSx, p: 3, ...glassBg }}>
        <Box sx={sectionHeaderSx}>
          <Box sx={gradientIcon(accent)}>
            <CloudUpload sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={sectionTitleSx}>Upload New Document</Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {DOCUMENT_TYPES.map((type) => {
            const Icon = docIcons[type] || CloudUpload;
            return (
              <Button
                key={type}
                variant="outlined"
                size="small"
                startIcon={<Icon sx={{ fontSize: 16 }} />}
                onClick={() => handleUpload(type)}
                sx={{
                  borderRadius: 2,
                  borderColor: "rgba(102,126,234,0.25)",
                  px: 2, py: 0.75,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  letterSpacing: "0.2px",
                  transition: "all 0.2s ease",
                  bgcolor: "rgba(102,126,234,0.04)",
                  "&:hover": {
                    borderColor: accent,
                    bgcolor: "rgba(102,126,234,0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(102,126,234,0.2)",
                  },
                }}
              >
                {type}
              </Button>
            );
          })}
        </Box>
      </Box>

      <TableContainer sx={{ ...cardSx, ...glassBg, "& .MuiTable-root": { minWidth: 650 } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadSx}>Type</TableCell>
              <TableCell sx={tableHeadSx}>File</TableCell>
              <TableCell sx={tableHeadSx}>Status</TableCell>
              <TableCell sx={tableHeadSx}>Version</TableCell>
              <TableCell sx={tableHeadSx}>Uploaded</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={200} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={40} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                </TableRow>
              ))
            ) : docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Description sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary">No documents uploaded yet</Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                    Click a document type above to upload your first file
                  </Typography>
                </TableCell>
              </TableRow>
            ) : docs.map((doc) => (
              <TableRow key={doc.id} sx={tableRowHoverSx()}>
                <TableCell sx={{ fontWeight: 600 }}>{doc.type}</TableCell>
                <TableCell>{doc.fileName}</TableCell>
                <TableCell>
                  <Chip label={doc.status} size="small" sx={chipStatusSx(statusPalette[doc.status] || "#6b7280")} />
                </TableCell>
                <TableCell>v{doc.version}</TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
