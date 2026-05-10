"use client";

import { createTheme } from "@mui/material/styles";

const lightBrand = {
  bg: "#F7F1ED",
  surface: "#FFFFFF",
  surfaceElevated: "#FDFBFA",     // NEW: for cards/modals
  primary: "#CFA292",
  hover: "#B98573",
  accent: "#E8C1B2",              // NEW: lighter accent color
  text: "#2A1E1A",
  textMuted: "rgba(42,30,26,0.65)",
  textLight: "rgba(42,30,26,0.45)", // NEW: even lighter text
  border: "rgba(207,162,146,0.35)",
  borderSoft: "rgba(207,162,146,0.2)",
  gradientStart: "#CFA292",
  gradientEnd: "#B98573",
  gradientLight: "linear-gradient(135deg, #CFA29220, #B9857320)", // NEW
  overlayStrong: "rgba(42,30,26,0.65)",
  overlaySoft: "rgba(42,30,26,0.35)",
  overlayLight: "rgba(42,30,26,0.15)", // NEW
  navGlass: "rgba(247,241,237,0.85)",  // Increased opacity
  shadowCard: "0 6px 18px rgba(42,30,26,0.06)",
  shadowCardStrong: "0 12px 28px rgba(42,30,26,0.12)",
  shadowButton: "0 4px 12px rgba(207,162,146,0.25)", // NEW
  heroTextShadow: "0 6px 25px rgba(42,30,26,0.6)",
  success: "#7C9885",             // NEW: muted green
  error: "#C67B7B",               // NEW: muted red
  warning: "#D4A574",             // NEW: warm orange
  info: "#8BA3B8",                // NEW: muted blue
};

const darkBrand = {
  bg: "#0B1220",
  surface: "#1A2332",             // Lighter for better contrast
  surfaceElevated: "#344462",     // NEW: for elevated elements
  primary: "#CFA292",
  hover: "#E8C1B2",
  accent: "#F5D5C8",              // NEW: even lighter accent
  text: "#F8FAFC",
  textMuted: "rgba(248,250,252,0.82)",
  textLight: "rgba(248,250,252,0.55)", // NEW
  border: "rgba(207,162,146,0.28)",
  borderSoft: "rgba(207,162,146,0.18)",
  gradientStart: "#CFA292",
  gradientEnd: "#E8C1B2",
  gradientLight: "linear-gradient(135deg, #CFA29215, #E8C1B215)", // NEW
  overlayStrong: "rgba(11,18,32,0.72)",
  overlaySoft: "rgba(11,18,32,0.42)",
  overlayLight: "rgba(11,18,32,0.25)", // NEW
  navGlass: "rgba(11,18,32,0.85)",     // Increased opacity
  shadowCard: "0 8px 24px rgba(0,0,0,0.45)",
  shadowCardStrong: "0 14px 38px rgba(0,0,0,0.6)",
  shadowButton: "0 4px 12px rgba(207,162,146,0.35)", // NEW
  heroTextShadow: "0 8px 30px rgba(0,0,0,0.85)",
  success: "#88B497",             // NEW
  error: "#D99090",               // NEW
  warning: "#E3B887",             // NEW
  info: "#9FB9CE",                // NEW
};

export const getTheme = (mode) => {
  const brand = mode === "dark" ? darkBrand : lightBrand;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.primary,
        dark: brand.hover,
        light: brand.accent,        // NEW
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: brand.hover,
        light: brand.accent,        // NEW
        contrastText: "#FFFFFF",
      },
      success: {
        main: brand.success,        // NEW
      },
      error: {
        main: brand.error,          // NEW
      },
      warning: {
        main: brand.warning,        // NEW
      },
      info: {
        main: brand.info,           // NEW
      },
      background: {
        default: brand.bg,
        paper: brand.surface,
      },
      text: {
        primary: brand.text,
        secondary: brand.textMuted,
        disabled: brand.textLight,  // NEW
      },
      divider: brand.border,
      brand,
    },

    typography: {
      fontFamily: `"Playfair Display", "Georgia", serif`,
      fontFamilyBody: `"Inter", "Helvetica", "Arial", sans-serif`, // NEW: for body text
      
      h1: {
        fontWeight: 700,
        letterSpacing: 1.5,
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        letterSpacing: 1.2,
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        letterSpacing: 2,
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 500,
        letterSpacing: 1,
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 500,
        letterSpacing: 0.8,
      },
      h6: {
        fontWeight: 500,
        letterSpacing: 0.5,
      },
      body1: {
        fontFamily: `"Inter", "Helvetica", "Arial", sans-serif`, // NEW
        letterSpacing: 0.3,
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: `"Inter", "Helvetica", "Arial", sans-serif`, // NEW
        letterSpacing: 0.2,
        lineHeight: 1.5,
      },
      button: {
        textTransform: "none",
        letterSpacing: 0.8,
        fontWeight: 600,           // Increased from 500
        fontFamily: `"Inter", "Helvetica", "Arial", sans-serif`, // NEW
      },
      caption: {
        letterSpacing: 0.3,
        fontFamily: `"Inter", "Helvetica", "Arial", sans-serif`, // NEW
      },
    },

    shape: {
      borderRadius: 12,            // NEW: default border radius
    },

    shadows: [
      "none",
      brand.shadowCard,
      brand.shadowCardStrong,
      // ... MUI needs 25 shadow levels, you can customize more
      ...Array(22).fill(brand.shadowCardStrong),
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: brand.bg,
            color: brand.text,
            scrollBehavior: "smooth",  // NEW
          },
          "*": {
            scrollbarWidth: "thin",    // NEW: for Firefox
            scrollbarColor: `${brand.primary} ${brand.surface}`,
          },
          "*::-webkit-scrollbar": {   // NEW: for Chrome/Safari
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-track": {
            background: brand.surface,
          },
          "*::-webkit-scrollbar-thumb": {
            background: brand.primary,
            borderRadius: "4px",
            "&:hover": {
              background: brand.hover,
            },
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: brand.navGlass,
            borderBottom: `1px solid ${brand.borderSoft}`,
            backdropFilter: "blur(14px)",
            boxShadow: brand.shadowCard,  // NEW
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            padding: "10px 24px",      // Increased padding
            fontWeight: 600,
            letterSpacing: 0.8,
            transition: "all 0.3s ease", // NEW
          },

          containedPrimary: {
            background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
            color: "#FFFFFF",
            boxShadow: brand.shadowButton,  // NEW: use dedicated shadow
            "&:hover": {
              background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
              boxShadow: brand.shadowCardStrong,
              transform: "translateY(-2px)", // NEW
            },
            "&:active": {
              transform: "translateY(0)",    // NEW
            },
          },

          outlined: {
            borderColor: brand.border,
            borderWidth: "1.5px",        // NEW: thicker border
            "&:hover": {
              borderColor: brand.hover,
              backgroundColor: brand.borderSoft,
              borderWidth: "1.5px",
            },
          },

          text: {                        // NEW
            "&:hover": {
              backgroundColor: brand.borderSoft,
            },
          },

          // NEW: Size variants
          sizeLarge: {
            padding: "12px 32px",
            fontSize: "1rem",
          },
          sizeSmall: {
            padding: "6px 16px",
            fontSize: "0.875rem",
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: brand.text,
            transition: "all 0.2s ease",  // NEW
            "&:hover": {
              backgroundColor: brand.borderSoft,
              transform: "scale(1.05)",   // NEW
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${brand.borderSoft}`,
            boxShadow: brand.shadowCard,
            backgroundColor: brand.surface,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // NEW: better easing
            "&:hover": {
              boxShadow: brand.shadowCardStrong,
              transform: "translateY(-6px)",  // Increased from -4px
              borderColor: brand.border,      // NEW
            },
          },
        },
      },

      MuiPaper: {                        // NEW
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          elevation1: {
            boxShadow: brand.shadowCard,
          },
          elevation2: {
            boxShadow: brand.shadowCardStrong,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
            letterSpacing: 0.3,
            transition: "all 0.2s ease",  // NEW
          },
          filled: {                      // NEW
            backgroundColor: brand.primary,
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: brand.hover,
            },
          },
          outlined: {                    // NEW
            borderColor: brand.border,
            "&:hover": {
              backgroundColor: brand.borderSoft,
            },
          },
        },
      },

      MuiTextField: {                    // NEW
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "all 0.3s ease",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: brand.primary,
                },
              },
              "&.Mui-focused": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: brand.primary,
                  borderWidth: "2px",
                },
              },
            },
          },
        },
      },

      MuiAlert: {                        // NEW
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          standardSuccess: {
            backgroundColor: mode === "dark" ? `${brand.success}20` : `${brand.success}15`,
            color: brand.success,
          },
          standardError: {
            backgroundColor: mode === "dark" ? `${brand.error}20` : `${brand.error}15`,
            color: brand.error,
          },
          standardWarning: {
            backgroundColor: mode === "dark" ? `${brand.warning}20` : `${brand.warning}15`,
            color: brand.warning,
          },
          standardInfo: {
            backgroundColor: mode === "dark" ? `${brand.info}20` : `${brand.info}15`,
            color: brand.info,
          },
        },
      },

      MuiDivider: {                      // NEW
        styleOverrides: {
          root: {
            borderColor: brand.border,
          },
        },
      },

      MuiTooltip: {                      // NEW
        styleOverrides: {
          tooltip: {
            backgroundColor: brand.surface,
            color: brand.text,
            border: `1px solid ${brand.border}`,
            boxShadow: brand.shadowCard,
            borderRadius: 8,
            fontSize: "0.875rem",
          },
          arrow: {
            color: brand.surface,
            "&::before": {
              border: `1px solid ${brand.border}`,
            },
          },
        },
      },

      MuiLink: {                         // NEW
        styleOverrides: {
          root: {
            color: brand.primary,
            textDecoration: "none",
            transition: "all 0.2s ease",
            borderBottom: "1px solid transparent",
            "&:hover": {
              color: brand.hover,
              borderBottomColor: brand.hover,
            },
          },
        },
      },
    },
  });
};