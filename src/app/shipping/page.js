"use client";

import {
  Box,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { shippingPageContent } from "@/workflow/pages/shipping";

export default function ShippingPage() {
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
            {shippingPageContent.hero.title}
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
            Last updated: {shippingPageContent.hero.updatedAt}
          </Typography>

          {/* Description */}
          {shippingPageContent.hero.description && (
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
              {shippingPageContent.hero.description}
            </Typography>
          )}
        </Container>
      </Box>

      {/* CONTENT */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {shippingPageContent.sections.map((section, index) => (
          <Box
            key={section.title}
            sx={{
              mb: 5,
              pb: 3,
              borderBottom:
                index !== shippingPageContent.sections.length - 1
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

            {/* Points (for COD section) */}
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
      </Container>
    </Box>
  );
}