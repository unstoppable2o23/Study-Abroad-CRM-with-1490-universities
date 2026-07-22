"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box, Container, Typography, TextField, Button, Paper, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon, Avatar, IconButton, Divider,
  Chip, Alert, Skeleton,
} from "@mui/material";
import { Send, Search, Clear, AutoAwesome, Delete } from "@mui/icons-material";
import { accent, accentDark, accentGradient, glassBg, glassBorder, cardSx, gradientIcon, sectionHeaderSx, sectionTitleSx, pageContainerSx, fadeInSx, chipStatusSx, tableRowHoverSx, tableHeadSx, staggerFadeIn } from "@/lib/dashboard-ui";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AISearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    historyRef.current = [...historyRef.current, userMessage];
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: historyRef.current }),
      });
      const data = await res.json();
      if (data.success) {
        const assistantMessage: Message = { role: "assistant", content: data.reply, timestamp: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);
        historyRef.current = [...historyRef.current, assistantMessage];
      } else {
        setError(data.error || "AI request failed");
      }
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    historyRef.current = [];
  };

  const suggestedQueries = [
    "What are the top 5 universities for Computer Science in the US?",
    "Compare costs of studying in UK vs Canada",
    "What scholarships are available for Indian students?",
    "Which universities have Spring intake for Data Science?",
    "What are the visa requirements for Australia?",
  ];

  return (
    <Container maxWidth="md" sx={pageContainerSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={sectionHeaderSx}>
          <Box sx={gradientIcon()}><AutoAwesome sx={{ fontSize: 18 }} /></Box>
          <Box>
            <Typography variant="h5" sx={sectionTitleSx}>AI Study Abroad Assistant</Typography>
            <Typography variant="body2" color="text.secondary">Ask anything about studying abroad</Typography>
          </Box>
        </Box>
        {messages.length > 0 && (
          <Button variant="outlined" size="small" startIcon={<Delete />} onClick={clearHistory}
            sx={{ borderRadius: 2, borderColor: "divider", color: "text.secondary", "&:hover": { borderColor: "error.main", color: "error.main" } }}>
            Clear Chat
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {messages.length === 0 && !loading && (
        <Paper sx={{ ...cardSx, ...glassBg, p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            <AutoAwesome sx={{ mr: 1, verticalAlign: "middle", color: accent, fontSize: 24 }} />
            How can I help you?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ask about universities, courses, scholarships, visas, or career guidance.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {suggestedQueries.map((q) => (
              <Chip
                key={q}
                label={q}
                variant="outlined"
                size="small"
                onClick={() => { setInput(q); handleSend(); }}
                sx={{ cursor: "pointer", borderRadius: 2, borderColor: `${accent}40`, color: accent, fontWeight: 600, "&:hover": { bgcolor: `${accent}10` } }}
              />
            ))}
          </Box>
        </Paper>
      )}

      <Paper sx={{ ...cardSx, ...glassBg, flex: 1, display: "flex", flexDirection: "column", minHeight: 500, maxHeight: 600, overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {messages.length === 0 && loading ? (
            <Box sx={{ p: 2 }}>
              {[1, 2].map((i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2, justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                  {i % 2 !== 0 && <Skeleton variant="circular" width={32} height={32} />}
                  <Skeleton variant="rounded" width={i % 2 === 0 ? 180 : 260} height={48} sx={{ borderRadius: 3 }} />
                  {i % 2 === 0 && <Skeleton variant="circular" width={32} height={32} />}
                </Box>
              ))}
            </Box>
          ) : (
            <List disablePadding dense>
              {messages.map((msg, i) => (
                <ListItem key={i} sx={{
                  mb: 2, display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  px: 0,
                }}>
                  <Box sx={{
                    display: "flex", gap: 1.5, alignItems: "flex-start",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    maxWidth: "85%",
                  }}>
                    <Avatar sx={{
                      width: 32, height: 32,
                      background: msg.role === "user" ? accentGradient : `linear-gradient(135deg, #a8c0ff, #3f2b96)`,
                      color: "#fff",
                      fontSize: 14,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}>
                      {msg.role === "user" ? <Search fontSize="small" /> : <AutoAwesome sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <Paper sx={{
                      p: 1.5, borderRadius: 3,
                      background: msg.role === "user"
                        ? accentGradient
                        : "rgba(255,255,255,0.7)",
                      color: msg.role === "user" ? "#fff" : "inherit",
                      backdropFilter: msg.role === "user" ? "none" : "blur(20px)",
                      boxShadow: msg.role === "user"
                        ? "0 4px 14px rgba(102,126,234,0.35)"
                        : "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
                      border: msg.role === "user" ? "none" : glassBorder,
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              {loading && (
                <ListItem sx={{ justifyContent: "flex-start", px: 0 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Avatar sx={{
                      width: 32, height: 32,
                      background: `linear-gradient(135deg, #a8c0ff, #3f2b96)`,
                      color: "#fff", fontSize: 14,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}>
                      <AutoAwesome sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {[0, 1, 2].map((d) => (
                        <Box key={d} sx={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: accentGradient,
                          animation: "pulse 1.2s ease-in-out infinite",
                          animationDelay: `${d * 0.2}s`,
                          "@keyframes pulse": { "0%, 80%, 100%": { opacity: 0.3 }, "40%": { opacity: 1 } },
                        }} />
                      ))}
                    </Box>
                  </Box>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <Box sx={{ p: 2, ...glassBg }}>
          <form onSubmit={handleSend}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about universities, courses, scholarships..."
                multiline
                rows={1}
                maxRows={4}
                variant="outlined"
                disabled={loading}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                    "&:hover fieldset": { borderColor: `${accent}60` },
                    "&.Mui-focused fieldset": { borderColor: accent, borderWidth: 2 },
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send"
                sx={{
                  background: !input.trim() || loading ? "rgba(0,0,0,0.08)" : accentGradient,
                  color: "#fff",
                  borderRadius: 2,
                  width: 40, height: 40,
                  "&:hover": { background: !input.trim() || loading ? "rgba(0,0,0,0.08)" : accentGradient, opacity: 0.9 },
                  "&.Mui-disabled": { background: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.26)" },
                }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <Send fontSize="small" />}
              </IconButton>
              {input && (
                <IconButton onClick={() => setInput("")} aria-label="Clear" size="small"
                  sx={{ color: "text.secondary", borderRadius: 2 }}>
                  <Clear fontSize="small" />
                </IconButton>
              )}
            </Box>
          </form>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", opacity: 0.7 }}>
            Powered by AI — responses may not be 100% accurate. Verify critical information.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
