"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import { Box, Skeleton, Stack, Typography } from "@mui/material";

export function ProductCardSkeleton({ count = 8 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <Box key={`skeleton-${idx}`} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={240} />
          <Stack spacing={0.7} sx={{ pt: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="35%" />
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

export function ButtonSpinner({ size = 16 }) {
  return (
    <Box sx={{ display: "inline-flex", gap: 0.45, alignItems: "center", height: size }}>
      {[0, 1, 2].map((idx) => (
        <Box
          key={`btn-dot-${idx}`}
          sx={{
            width: Math.max(3, Math.round(size / 5)),
            height: Math.max(3, Math.round(size / 5)),
            borderRadius: "50%",
            bgcolor: "currentColor",
            animation: "buttonDots 0.8s infinite ease-in-out",
            animationDelay: `${idx * 0.1}s`,
            "@keyframes buttonDots": {
              "0%, 100%": { transform: "translateY(0)", opacity: 0.35 },
              "50%": { transform: "translateY(-3px)", opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
}

export function LoadingDots({ text = "Loading", dotCount = 3 }) {
  return (
    <Typography sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
      <span>{text}</span>
      {Array.from({ length: dotCount }).map((_, idx) => (
        <Box
          key={`dot-${idx}`}
          component="span"
          sx={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: "currentColor",
            opacity: 0.25,
            animation: "loadingDot 1s infinite ease-in-out",
            animationDelay: `${idx * 0.15}s`,
            "@keyframes loadingDot": {
              "0%, 100%": { transform: "translateY(0)", opacity: 0.25 },
              "50%": { transform: "translateY(-3px)", opacity: 1 },
            },
          }}
        />
      ))}
    </Typography>
  );
}

export function WishlistHeartLoader({ label = "Updating wishlist..." }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      <FavoriteIcon
        sx={{
          color: "error.main",
          animation: "heartPulse 1s infinite ease-in-out",
          "@keyframes heartPulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.2)" },
          },
        }}
      />
      <Typography sx={{ fontSize: 14, opacity: 0.8 }}>{label}</Typography>
    </Stack>
  );
}
