"use client";

import {
  Box,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { aboutPageContent } from "@/workflow/pages/about";

export default function AboutPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;

  const iconMap = {
    vision: <AutoAwesomeOutlinedIcon sx={{ fontSize: 22 }} />,
    craft: <CheckroomOutlinedIcon sx={{ fontSize: 22 }} />,
    promise: <VerifiedOutlinedIcon sx={{ fontSize: 22 }} />,
  };

  return (
    <Box sx={{ bgcolor: brand.bg }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          background: `linear-gradient(135deg, ${brand.primary}14, ${brand.hover}10)`,
          borderBottom: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container maxWidth="md">
          {/* Title */}
          <Typography
            variant="h2"
            sx={{
              color: brand.text,
              fontWeight: 700,
              letterSpacing: { xs: 1.5, md: 3 },
              textAlign: "center",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
            }}
          >
            {aboutPageContent.hero.title}
          </Typography>

          {/* Divider */}
          <Divider
            sx={{
              width: 80,
              mx: "auto",
              mb: 4,
              height: 3,
              borderColor: "transparent",
              background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
            }}
          />

          {/* CONTENT */}
          <Box
            sx={{
              maxWidth: 760,
              mx: "auto",
              textAlign: { xs: "left", md: "center" },
            }}
          >
            {/* Paragraphs */}
            {aboutPageContent.hero.description.map((para, index) => (
              <Typography
                key={index}
                sx={{
                  color: brand.textMuted,
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  mb: 3,
                }}
              >
                {para}
              </Typography>
            ))}

            {/* Statements */}
            {aboutPageContent.hero.statements.map((line, index) => (
              <Typography
                key={index}
                sx={{
                  color: brand.text,
                  fontWeight: 500,
                  mb: 1.5,
                }}
              >
                {line}
              </Typography>
            ))}

            {/* Tagline */}
            <Typography
              sx={{
                mt: 2,
                color: brand.textMuted,
                fontStyle: "italic",
              }}
            >
              {aboutPageContent.hero.tagline}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* VALUES SECTION */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {aboutPageContent.values.map((item, index) => (
          <Box
            key={item.title}
            sx={{
              mb: 5,
              pb: 3,
              borderBottom:
                index !== aboutPageContent.values.length - 1
                  ? `1px solid ${brand.borderSoft}`
                  : "none",

              // OPTIONAL premium touch 👇
              // borderLeft: `3px solid ${brand.primary}`,
              // pl: 2,
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              {/* Number */}
              <Typography
                sx={{
                  fontWeight: 700,
                  color: brand.primary,
                  mr: 1.5,
                  minWidth: 30,
                }}
              >
                {(index + 1).toString().padStart(2, "0")}
              </Typography>

              {/* Icon */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: brand.primary,
                  bgcolor: `${brand.primary}10`,
                  mr: 1.5,
                }}
              >
                {iconMap[item.iconKey]}
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  color: brand.text,
                  fontWeight: 600,
                }}
              >
                {item.title}
              </Typography>
            </Box>

            {/* Body */}
            <Typography
              sx={{
                color: brand.textMuted,
                lineHeight: 1.9,
                fontSize: "0.95rem",
                pl: 6,
              }}
            >
              {item.body}
            </Typography>
          </Box>
        ))}
      </Container>
    </Box>
  );
}