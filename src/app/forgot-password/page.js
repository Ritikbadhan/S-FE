"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Container,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import { authApi } from "@/lib/api";
import { AppButton, AppInput, useToast } from "@/components/common";

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await authApi.forgotPassword({ email });
      const demoResetToken = data?.demoResetToken || "";
      const message = demoResetToken
        ? `If this email exists, reset instructions have been sent. Demo token: ${demoResetToken}`
        : "If this email exists, reset instructions have been sent.";
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      const message = err.message || "Failed to send reset instructions";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: brand.bg, position: "relative", py: { xs: 2, md: 4 }, px: 2 }}>
      <Box sx={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 20% 50%, ${brand.primary}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brand.hover}12 0%, transparent 50%)` }} />
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: 4, background: brand.surface, border: `1px solid ${brand.borderSoft}`, boxShadow: brand.shadowCardStrong }}>
          <Box sx={{ background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`, color: "#fff", textAlign: "center", py: { xs: 3.5, md: 4.5 }, px: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)" }}>
              <LockResetOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600, textShadow: brand.heroTextShadow, mb: 1 }}>
              Forgot Password
            </Typography>
            <Typography sx={{ opacity: 0.95 }}>
              Enter your email and we will send reset instructions.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 } }}>
            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
            {success ? <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert> : null}
            <AppInput label="Email" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 3, backgroundColor: theme.palette.mode === "dark" ? brand.bg : "transparent" } }} />
            <AppButton type="submit" disabled={loading} fullWidth sx={{ py: 1.5, borderRadius: 30, fontWeight: 600 }}>
              {loading ? "Submitting..." : "Send Reset Link"}
            </AppButton>
            <Divider sx={{ my: 3, borderColor: brand.border }} />
            <Typography sx={{ textAlign: "center", color: brand.textMuted }}>
              Have token already? <Link href="/reset-password" style={{ color: brand.primary, textDecoration: "none", fontWeight: 600 }}>Reset Password</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
