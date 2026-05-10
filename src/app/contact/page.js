"use client";

import {
  Box,
  Container,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { contactPageContent } from "@/workflow/pages/contact";

export default function ContactPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;

  const iconMap = {
    email: <EmailOutlinedIcon sx={{ fontSize: 20 }} />,
    phone: <PhoneOutlinedIcon sx={{ fontSize: 20 }} />,
    address: <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />,
    hours: <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />,
  };

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
              letterSpacing: { xs: 1.5, md: 3 },
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
            }}
          >
            {contactPageContent.hero.title}
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
            {contactPageContent.hero.description}
          </Typography>
        </Container>
      </Box>

      {/* CONTACT LIST */}
      {/* CONTACT LIST */}
{/* CONTACT LIST */}
<Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    {contactPageContent.items.map((item, index) => (
      <Box
        key={item.title}
        sx={{
          flex: {
            xs: "1 1 100%",
            sm: "1 1 calc(50% - 8px)",
            md: "1 1 calc(25% - 12px)", // 4 items in one row
          },
          p: 2.5,
          borderRadius: 3,
          bgcolor: brand.surface,
          border: `1px solid ${brand.borderSoft}`,
          boxShadow: brand.shadowCard,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: brand.shadowCardStrong,
          },
        }}
      >
        {/* Top Row */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: brand.primary,
              bgcolor: `${brand.primary}10`,
              mr: 1,
            }}
          >
            {iconMap[item.iconKey]}
          </Box>

          {/* Title */}
          <Typography
            sx={{
              color: brand.text,
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {item.title}
          </Typography>
        </Box>

        {/* Value */}
        <Typography
          component={
            item.iconKey === "email" || item.iconKey === "phone"
              ? "a"
              : "p"
          }
          href={
            item.iconKey === "email"
              ? `mailto:${item.value}`
              : item.iconKey === "phone"
              ? `tel:${item.value}`
              : undefined
          }
          sx={{
            color: brand.textMuted,
            lineHeight: 1.8,
            fontSize: "0.9rem",
            textDecoration: "none",
            wordBreak: "break-word",
            "&:hover": {
              color: brand.primary,
            },
          }}
        >
          {item.value}
        </Typography>
      </Box>
    ))}
  </Box>
</Container>
    </Box>
  );
}