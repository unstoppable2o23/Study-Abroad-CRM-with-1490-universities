"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, Button, Alert, Paper, Link, InputAdornment, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uniCount, setUniCount] = useState(234);

  useEffect(() => {
    fetch("/api/universities/count")
      .then(r => r.json())
      .then(d => { if (d.success) setUniCount(d.data.count); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Login failed"); return; }
      const role = data.data.user.role;
      if (role === "SUPER_ADMIN") router.push("/super-admin");
      else if (["ADMIN", "COUNSELOR", "DOCUMENT_VERIFIER"].includes(role)) router.push("/admin");
      else router.push("/dashboard");
    } catch { setError("An error occurred"); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", bgcolor: "background.default" }}>
      <Box sx={{ position: "fixed", top: "-20vh", left: "-10vw", width: "45vw", height: "45vw", background: "radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", bottom: "-25vh", right: "-8vw", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(240,147,251,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
        <IconButton onClick={() => router.push("/")} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}><ThemeToggle /></Box>

      <Paper elevation={0} sx={{ width: "100%", maxWidth: 400, mx: 2, p: 4, borderRadius: 4, position: "relative", zIndex: 1, bgcolor: "background.paper", backdropFilter: "blur(24px)", border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", mx: "auto", mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Welcome Back</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Sign in to your account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Email or Username" margin="normal" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "action.hover", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "action.active" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiInputLabel-root": { color: "text.secondary" } }} />
          <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "action.hover", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "action.active" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiInputLabel-root": { color: "text.secondary" } }}
            slotProps={{ input: { endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: "text.secondary" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            } }} />
          <Button fullWidth variant="contained" size="large" type="submit" disabled={loading} sx={{ mt: 3, py: 1.5, borderRadius: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 700, fontSize: "1rem", "&:hover": { background: "linear-gradient(135deg, #5a6fd6, #6a4192)" } }}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link href="/register" underline="hover" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>Don&apos;t have an account? Register</Link>
        </Box>
        <Box sx={{ mt: 1, textAlign: "center" }}>
          <Link href="/" underline="hover" sx={{ color: "text.disabled", fontSize: "0.85rem", "&:hover": { color: "text.secondary" } }}>Back to Home</Link>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "center", gap: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{uniCount}+</Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>Universities</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, background: "linear-gradient(135deg, #43e97b, #38f9d7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>33</Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>Careers</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, background: "linear-gradient(135deg, #f093fb, #f5576c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>Powered</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
