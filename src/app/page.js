"use client";
import Link from "next/link";
import { Box, Typography, Container } from "@mui/material";
import { AppButton } from "@/components/common";
import { homePageContent } from "@/workflow/pages/home";

export default function HomePage() {
  const { video, hero } = homePageContent;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        color: "background.paper",
      }}
    >
      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={video.src} type="video/mp4" />
        {video.fallbackText}
      </video>

      {/* 🌑 Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: (theme) => theme.palette.brand.overlaySoft,
          zIndex: 1,
        }}
      />

      {/* ✨ Content */}
      <Container sx={{ position: "relative", zIndex: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            letterSpacing: 3,
            mb: 0.2,
            lineHeight: 1.1,
          }}
        >
          {hero.title}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            letterSpacing: 5,
            color: "primary.main",
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          {hero.eyebrow}
        </Typography>

        <Typography variant="h5" sx={{ mt: 3, mb: 4 }}>
          {hero.subtitle}
        </Typography>

        <Link href={hero.ctaHref} style={{ textDecoration: "none" }}>
          <AppButton sx={{ px: 4, py: 1.5, fontWeight: 600, letterSpacing: 1 }}>
            {hero.ctaLabel}
          </AppButton>
        </Link>
      </Container>
    </Box>
  );
}
