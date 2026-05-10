"use client";

import {
  Box,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { returnsPageContent } from "@/workflow/pages/returns";

export default function ReturnsPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;

  return (
    <Box sx={{ bgcolor: brand.bg }}>
      {/* HERO */}
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          background: `linear-gradient(135deg, ${brand.primary}14, ${brand.hover}10)`,
          borderBottom: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              color: brand.text,
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
            }}
          >
            {returnsPageContent.hero.title}
          </Typography>

          <Divider
            sx={{
              width: 80,
              mx: "auto",
              mb: 3,
              height: 3,
              borderColor: "transparent",
              background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
            }}
          />

          <Typography
            sx={{
              color: brand.textMuted,
              textAlign: "center",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.8,
              fontSize: "0.95rem",
            }}
          >
            {returnsPageContent.hero.description}
          </Typography>
        </Container>
      </Box>

      {/* POLICY SECTIONS */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {returnsPageContent.policyBlocks.map((section, index) => (
          <Box
            key={section.title}
            sx={{
              mb: 5,
              pb: 3,
              borderBottom:
                index !== returnsPageContent.policyBlocks.length - 1
                  ? `1px solid ${brand.borderSoft}`
                  : "none",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
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

              <Typography
                variant="h6"
                sx={{ color: brand.text, fontWeight: 600 }}
              >
                {section.title}
              </Typography>
            </Box>

            {/* Body */}
            {section.body && (
              <Typography
                sx={{
                  color: brand.textMuted,
                  lineHeight: 1.9,
                  fontSize: "0.95rem",
                }}
              >
                {section.body}
              </Typography>
            )}

            {/* Points */}
            {section.points && (
              <Box sx={{ mt: 1 }}>
                {section.points.map((point, i) => (
                  <Typography
                    key={i}
                    sx={{
                      color: brand.textMuted,
                      lineHeight: 1.9,
                      fontSize: "0.95rem",
                      pl: 2,
                      position: "relative",
                      mb: 0.5,
                      "&::before": {
                        content: '"•"',
                        position: "absolute",
                        left: 0,
                        color: brand.primary,
                      },
                    }}
                  >
                    {point}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* STEPS */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{ color: brand.text, fontWeight: 600, mb: 3 }}
          >
            {returnsPageContent.stepsTitle}
          </Typography>

          {returnsPageContent.steps.map((step, index) => (
            <Box
              key={step}
              sx={{
                mb: 3,
                pb: 2,
                borderBottom: `1px dashed ${brand.borderSoft}`,
              }}
            >
              <Typography
                sx={{
                  color: brand.primary,
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Step {(index + 1).toString().padStart(2, "0")}
              </Typography>

              <Typography
                sx={{
                  color: brand.textMuted,
                  lineHeight: 1.8,
                }}
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* NOTES */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{ color: brand.text, fontWeight: 600, mb: 2 }}
          >
            {returnsPageContent.notesTitle}
          </Typography>

          {returnsPageContent.notes.map((note, index) => (
            <Typography
              key={note}
              sx={{
                color: brand.textMuted,
                lineHeight: 1.9,
                mb:
                  index !== returnsPageContent.notes.length - 1 ? 1.5 : 0,
                pl: 2,
                position: "relative",
                "&::before": {
                  content: '"•"',
                  position: "absolute",
                  left: 0,
                  color: brand.primary,
                },
              }}
            >
              {note}
            </Typography>
          ))}
        </Box>
      </Container>
    </Box>
  );
}