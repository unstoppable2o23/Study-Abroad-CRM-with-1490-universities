"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Pagination } from "@mui/material";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = () => {
    setLoading(true);
    fetch(`/api/super-admin/audit?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLogs(d.data.data || []);
          setTotalPages(d.data.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogs(); }, [page]);

  const actionColor = (action: string) => {
    if (action.includes("LOGIN")) return "info";
    if (action.includes("FAILED") || action.includes("DENIED")) return "error";
    if (action.includes("CREATED") || action.includes("ACTIVATED")) return "success";
    if (action.includes("DELETED") || action.includes("DEACTIVATED")) return "warning";
    return "default";
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Audit Log</Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={7} sx={{ textAlign: "center" }}><CircularProgress size={24} /></TableCell></TableRow>}
            {!loading && logs.length === 0 && <TableRow><TableCell colSpan={7} sx={{ textAlign: "center" }}>No audit logs</TableCell></TableRow>}
            {logs.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={log.action} size="small" color={actionColor(log.action) as any} />
                </TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                    {log.entityId ? log.entityId.substring(0, 12) + "..." : "-"}
                  </Typography>
                </TableCell>
                <TableCell>{log.user?.fullName || log.user?.email || "-"}</TableCell>
                <TableCell>{log.organization?.name || "-"}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{log.ipAddress || "-"}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
