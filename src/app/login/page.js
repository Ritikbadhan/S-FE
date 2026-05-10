"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff, LoginOutlined } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { isAdminUser } from "@/lib/authRole";
import { AppButton, AppInput, useToast } from "@/components/common";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      const loggedInUser = data?.user || null;
      toast.success("Logged in successfully.");
      router.push(isAdminUser(loggedInUser) ? "/admin" : "/account");
    } catch (err) {
      const message = err.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brand.bg,
        position: "relative",
        py: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        px: { xs: 2, sm: 3 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${brand.primary}15 0%, transparent 50%), 
                       radial-gradient(circle at 80% 80%, ${brand.hover}12 0%, transparent 50%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: "relative", 
          zIndex: 1,
          px: { xs: 0, sm: 2 }, // Remove padding on mobile for full width
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 3, sm: 4 }, // Smaller radius on mobile
            overflow: "hidden",
            background: brand.surface,
            border: `1px solid ${brand.borderSoft}`,
            boxShadow: { 
              xs: brand.shadowCard, 
              sm: brand.shadowCardStrong 
            },
            backdropFilter: "blur(14px)",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              py: { xs: 3.5, sm: 4, md: 5 }, // Responsive padding
              px: { xs: 2, sm: 3 },
              textAlign: "center",
              color: "#FFFFFF",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                right: "-50%",
                width: "200%",
                height: "200%",
                background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                pointerEvents: "none",
              },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 56, sm: 64, md: 72 }, // Responsive icon size
                height: { xs: 56, sm: 64, md: 72 },
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                mb: { xs: 1.5, sm: 2, md: 2.5 },
                position: "relative",
                zIndex: 1,
              }}
            >
              <LoginOutlined 
                sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 36 } // Responsive icon
                }} 
              />
            </Box>
            <Typography
              variant="h3"
              fontWeight={600}
              sx={{
                textShadow: brand.heroTextShadow,
                letterSpacing: { xs: 0.5, sm: 1, md: 1.5 },
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" }, // Responsive font
                position: "relative",
                zIndex: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: { xs: 1, sm: 1.5 },
                opacity: 0.95,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: 0.5,
                fontSize: { xs: "0.875rem", sm: "1rem" }, // Responsive font
                px: { xs: 2, sm: 0 }, // Extra padding on mobile for text
                position: "relative",
                zIndex: 1,
              }}
            >
              Sign in to continue to your account
            </Typography>
          </Box>

          {/* Form Section */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, sm: 4 }, // Responsive padding
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: { xs: 2, sm: 3 },
                  border: "1px solid",
                  borderColor: "error.light",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  "& .MuiAlert-icon": {
                    fontSize: { xs: 20, sm: 24 },
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <AppInput
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              sx={{
                mb: { xs: 2.5, sm: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: 2.5, sm: 3 },
                  backgroundColor: theme.palette.mode === "dark" ? brand.bg : "transparent",
                  transition: "all 0.3s ease",
                  fontSize: { xs: "0.9375rem", sm: "1rem" }, // Slightly smaller on mobile
                  "&:hover": {
                    boxShadow: `0 4px 12px ${brand.primary}25`,
                    borderColor: brand.primary,
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 4px 16px ${brand.primary}35`,
                    borderColor: brand.primary,
                  },
                },
                "& .MuiInputLabel-root": {
                  fontWeight: 500,
                  letterSpacing: 0.3,
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                },
              }}
            />

            <AppInput
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size={isMobile ? "small" : "medium"} // Smaller on mobile
                      sx={{
                        color: brand.primary,
                        "&:hover": {
                          backgroundColor: brand.borderSoft,
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: { xs: 2.5, sm: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: 2.5, sm: 3 },
                  backgroundColor: theme.palette.mode === "dark" ? brand.bg : "transparent",
                  transition: "all 0.3s ease",
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  "&:hover": {
                    boxShadow: `0 4px 12px ${brand.primary}25`,
                    borderColor: brand.primary,
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 4px 16px ${brand.primary}35`,
                    borderColor: brand.primary,
                  },
                },
                "& .MuiInputLabel-root": {
                  fontWeight: 500,
                  letterSpacing: 0.3,
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                },
              }}
            />

            <AppButton
              type="submit"
              disabled={loading}
              fullWidth
              sx={{
                py: { xs: 1.5, sm: 1.75 }, // Responsive button padding
                borderRadius: 30,
                fontSize: { xs: "0.9375rem", sm: "1rem" }, // Responsive font
                fontWeight: 600,
                letterSpacing: { xs: 0.5, sm: 1 },
                textTransform: "none",
                background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                boxShadow: brand.shadowCard,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: brand.shadowCardStrong,
                  background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.Mui-disabled": {
                  background: brand.borderSoft,
                  color: brand.textMuted,
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Signing in..." : "Log in"}
            </AppButton>

            <Divider 
              sx={{ 
                my: { xs: 3, sm: 3.5 }, // Responsive spacing
                borderColor: brand.border 
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: brand.textMuted,
                  fontWeight: 500,
                  letterSpacing: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2 },
                }}
              >
                OR
              </Typography>
            </Divider>

            <Box
              sx={{
                textAlign: "center",
                "& a": {
                  color: brand.primary,
                  textDecoration: "none",
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  transition: "all 0.2s ease",
                  borderBottom: `1px solid transparent`,
                  display: "inline-block", // Better for mobile touch targets
                  padding: "2px 0", // Increase touch area
                  "&:hover": {
                    color: brand.hover,
                    borderBottomColor: brand.hover,
                  },
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ 
                  mb: { xs: 1.25, sm: 1.5 },
                  color: brand.textMuted,
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  lineHeight: 1.6, // Better readability on mobile
                }}
              >
                Don't have an account?{" "}
                <Link href="/signup">Sign up</Link>
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  color: brand.textMuted,
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  lineHeight: 1.6,
                }}
              >
                Forgot password?{" "}
                <Link href="/forgot-password">Reset it</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer Text */}
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            mt: { xs: 3, sm: 4 },
            color: brand.textMuted,
            fontWeight: 500,
            letterSpacing: 0.5,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            px: 2, // Padding for mobile
          }}
        >
          © 2024 Your Company. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
