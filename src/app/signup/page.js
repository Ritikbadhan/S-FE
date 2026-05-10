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
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
  CheckCircleOutline,
  CancelOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { AppButton, AppInput, useToast } from "@/components/common";

export default function SignupPage() {
  const router = useRouter();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return brand.error;
    if (passwordStrength < 50) return brand.warning;
    if (passwordStrength < 75) return brand.info;
    return brand.success;
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  // Password requirements
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    {
      label: "Uppercase & lowercase",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await signup(name, email, password, phone);
      const verificationCode = data?.verificationCode || "";
      toast.success(
        verificationCode
          ? `Account created. Demo verification code: ${verificationCode}`
          : "Account created. Verify your email to continue."
      );
      const params = new URLSearchParams({ email });
      if (verificationCode) {
        params.set("code", verificationCode);
      }
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      const message = err.message || "Signup failed";
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
        py: { xs: 2, sm: 3, md: 4 },
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
          px: { xs: 0, sm: 2 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 3, sm: 4 },
            overflow: "hidden",
            background: brand.surface,
            border: `1px solid ${brand.borderSoft}`,
            boxShadow: {
              xs: brand.shadowCard,
              sm: brand.shadowCardStrong,
            },
            backdropFilter: "blur(14px)",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              py: { xs: 3.5, sm: 4, md: 5 },
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
                width: { xs: 56, sm: 64, md: 72 },
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
              <PersonAddOutlined
                sx={{
                  fontSize: { xs: 28, sm: 32, md: 36 },
                }}
              />
            </Box>
            <Typography
              variant="h3"
              fontWeight={600}
              sx={{
                textShadow: brand.heroTextShadow,
                letterSpacing: { xs: 0.5, sm: 1, md: 1.5 },
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                position: "relative",
                zIndex: 1,
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: { xs: 1, sm: 1.5 },
                opacity: 0.95,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: 0.5,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                px: { xs: 2, sm: 0 },
                position: "relative",
                zIndex: 1,
              }}
            >
              Join us today and start your journey
            </Typography>
          </Box>

          {/* Form Section */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, sm: 4 },
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
              label="Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              sx={{
                mb: { xs: 2.5, sm: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: 2.5, sm: 3 },
                  backgroundColor:
                    theme.palette.mode === "dark" ? brand.bg : "transparent",
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
                  backgroundColor:
                    theme.palette.mode === "dark" ? brand.bg : "transparent",
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

            <AppInput
              label="Phone Number (Optional)"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              sx={{
                mb: { xs: 2.5, sm: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: 2.5, sm: 3 },
                  backgroundColor:
                    theme.palette.mode === "dark" ? brand.bg : "transparent",
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

            <AppInput
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size={isMobile ? "small" : "medium"}
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
                mb: password ? 2 : { xs: 2.5, sm: 3 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: 2.5, sm: 3 },
                  backgroundColor:
                    theme.palette.mode === "dark" ? brand.bg : "transparent",
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

            {/* Password Strength Indicator */}
            {password && (
              <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: brand.textMuted,
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      fontWeight: 500,
                    }}
                  >
                    Password Strength
                  </Typography>
                  <Chip
                    label={getPasswordStrengthLabel()}
                    size="small"
                    sx={{
                      backgroundColor: `${getPasswordStrengthColor()}20`,
                      color: getPasswordStrengthColor(),
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: brand.borderSoft,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getPasswordStrengthColor(),
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                    },
                  }}
                />

                {/* Password Requirements */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? brand.overlayLight
                        : `${brand.primary}08`,
                    borderRadius: 2,
                    border: `1px solid ${brand.borderSoft}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: brand.textMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Password Requirements:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {passwordRequirements.map((req, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {req.met ? (
                          <CheckCircleOutline
                            sx={{
                              fontSize: 16,
                              color: brand.success,
                            }}
                          />
                        ) : (
                          <CancelOutlined
                            sx={{
                              fontSize: 16,
                              color: brand.textLight,
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            color: req.met ? brand.success : brand.textMuted,
                            fontWeight: req.met ? 500 : 400,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {req.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            <AppButton
              type="submit"
              disabled={loading}
              fullWidth
              sx={{
                py: { xs: 1.5, sm: 1.75 },
                borderRadius: 30,
                fontSize: { xs: "0.9375rem", sm: "1rem" },
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
              {loading ? "Creating Account..." : "Create Account"}
            </AppButton>

            <Divider
              sx={{
                my: { xs: 3, sm: 3.5 },
                borderColor: brand.border,
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
                  display: "inline-block",
                  padding: "2px 0",
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
                  color: brand.textMuted,
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  lineHeight: 1.6,
                }}
              >
                Already have an account?{" "}
                <Link href="/login">Sign in</Link>
              </Typography>
            </Box>

            {/* Terms & Privacy */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                mt: 3,
                color: brand.textMuted,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                lineHeight: 1.5,
                px: 1,
              }}
            >
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                style={{
                  color: brand.primary,
                  textDecoration: "none",
                }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                style={{
                  color: brand.primary,
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
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
            px: 2,
          }}
        >
          © 2024 Your Company. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
