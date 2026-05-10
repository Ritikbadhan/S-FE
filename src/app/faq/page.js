"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faqPageContent } from "@/workflow/pages/faq";

export default function FAQPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;

  return (
    <Box sx={{ bgcolor: brand.bg }}>
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
              letterSpacing: { xs: 1.5, md: 3 },
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
            }}
          >
            {faqPageContent.hero.title}
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
          <Typography sx={{ color: brand.textMuted, textAlign: "center", lineHeight: 1.8 }}>
            {faqPageContent.hero.description}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        {faqPageContent.items.map((item) => (
          <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.5,
              borderRadius: "18px !important",
              bgcolor: brand.surface,
              border: `1px solid ${brand.borderSoft}`,
              boxShadow: brand.shadowCard,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: brand.primary }} />}
              sx={{ px: { xs: 2, md: 2.5 }, py: 0.5 }}
            >
              <Typography sx={{ fontWeight: 600, color: brand.text }}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5 }}>
              <Typography sx={{ color: brand.textMuted, lineHeight: 1.8 }}>
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
