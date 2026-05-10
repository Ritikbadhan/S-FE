"use client";

import {
  Box,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { termsPageContent } from "@/workflow/pages/terms";

export default function TermsPage() {
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
            {termsPageContent.hero.title}
          </Typography>

          <Divider
            sx={{
              width: 80,
              mx: "auto",
              mb: 2.5,
              height: 3,
              borderColor: "transparent",
              background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
            }}
          />

          <Typography
            sx={{
              color: brand.textMuted,
              textAlign: "center",
              mb: 1,
            }}
          >
            Last updated: {termsPageContent.hero.updatedAt}
          </Typography>

          {/* Description */}
          {termsPageContent.hero.description && (
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
              {termsPageContent.hero.description}
            </Typography>
          )}
        </Container>
      </Box>

      {/* CONTENT */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {termsPageContent.sections.map((section, index) => (
          <Box
            key={section.title}
            sx={{
              mb: 5,
              pb: 3,
              borderBottom:
                index !== termsPageContent.sections.length - 1
                  ? `1px solid ${brand.borderSoft}`
                  : "none",
            }}
          >
            {/* Section Header */}
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
                sx={{
                  color: brand.text,
                  fontWeight: 600,
                }}
              >
                {section.title}
              </Typography>
            </Box>

            {/* Body */}
            <Typography
              sx={{
                color: brand.textMuted,
                lineHeight: 1.9,
                fontSize: "0.95rem",
              }}
            >
              {section.body}
            </Typography>
          </Box>
        ))}
      </Container>
    </Box>
  );
}