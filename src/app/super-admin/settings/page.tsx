"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Paper, Button, AppBar, Toolbar, TextField, Grid, Alert, CircularProgress } from "@mui/material";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSettings(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/super-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) setMessage("Settings saved successfully");
      else setMessage("Failed to save settings");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => router.push("/super-admin")} sx={{ mr: 2 }}>Back</Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Settings</Typography>
          <Button color="inherit" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {message && <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>System Settings</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={2}>
              {Object.entries(settings).map(([key, value]) => (
                <Grid size={{ xs: 12 }} key={key}>
                  <TextField
                    fullWidth
                    label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={typeof value === "string" ? value : JSON.stringify(value)}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </Grid>
              ))}
              {Object.keys(settings).length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary">No settings configured yet.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
