"use client";

import { useEffect, useState } from "react";
import { Backdrop, Box, Typography } from "@mui/material";
import { subscribeGlobalLoading } from "@/lib/loadingBus";

const LOADING_MESSAGES = [
  "Loading amazing things for you...",
  "Just a moment, getting things ready...",
  "Preparing your experience...",
  "Fetching the latest data...",
  "Hang tight, almost there...",
  "Setting things up...",
  "Getting everything ready...",
  "Good things take a moment...",
  "We are getting things ready...",
  "Making everything perfect for you...",
  "Bringing things together...",
  "Almost ready for you...",
  "Gathering the details...",
  "Putting things in place...",
  "Loading your experience...",
  "Working on it...",
  "Just a second...",
  "Almost done...",
  "Final touches...",
  "One moment please...",
  "Loading your content...",
  "Talking to the server...",
  "Syncing data...",
  "Processing your request...",
  "Connecting to services...",
  "Preparing the response...",
  "Fetching fresh updates...",
];

export default function PageLoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);
  const [variant, setVariant] = useState("dots");

  useEffect(() => {
    const unsubscribe = subscribeGlobalLoading(setIsLoading);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isLoading) return undefined;
    setMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    const variants = ["dots", "bars", "pulse", "orbit"];
    setVariant(variants[Math.floor(Math.random() * variants.length)]);
    const interval = setInterval(() => {
      setMessage((prev) => {
        let next = prev;
        while (next === prev) {
          next = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const renderAnimation = () => {
    if (variant === "bars") {
      return (
        <Box sx={{ display: "flex", gap: 0.7, justifyContent: "center" }}>
          {[0, 1, 2, 3].map((item) => (
            <Box
              key={`bar-${item}`}
              sx={{
                width: 6,
                height: 26,
                borderRadius: 1,
                bgcolor: "white",
                opacity: 0.9,
                animation: "loaderBars 0.9s infinite ease-in-out",
                animationDelay: `${item * 0.1}s`,
                "@keyframes loaderBars": {
                  "0%, 100%": { transform: "scaleY(0.4)", opacity: 0.35 },
                  "50%": { transform: "scaleY(1)", opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      );
    }

    if (variant === "pulse") {
      return (
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.35)",
            position: "relative",
            mx: "auto",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.8)",
              animation: "loaderPulse 1.2s infinite ease-out",
            },
            "@keyframes loaderPulse": {
              "0%": { transform: "scale(0.65)", opacity: 1 },
              "100%": { transform: "scale(1.2)", opacity: 0 },
            },
          }}
        />
      );
    }

    if (variant === "orbit") {
      return (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.35)",
            position: "relative",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "white",
              position: "absolute",
              top: -5,
              left: "50%",
              transform: "translateX(-50%)",
              animation: "loaderOrbit 1s linear infinite",
              transformOrigin: "50% 27px",
              "@keyframes loaderOrbit": {
                "0%": { transform: "translateX(-50%) rotate(0deg)" },
                "100%": { transform: "translateX(-50%) rotate(360deg)" },
              },
            }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", gap: 0.8, justifyContent: "center" }}>
        {[0, 1, 2].map((item) => (
          <Box
            key={`dot-${item}`}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "white",
              animation: "loaderDots 0.8s infinite ease-in-out",
              animationDelay: `${item * 0.12}s`,
              "@keyframes loaderDots": {
                "0%, 100%": { transform: "translateY(0)", opacity: 0.35 },
                "50%": { transform: "translateY(-8px)", opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      {children}
      <Backdrop
        open={isLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 1,
          backdropFilter: "blur(1px)",
        }}
      >
        <Box sx={{ textAlign: "center", px: 2 }}>
          {renderAnimation()}
          <Typography sx={{ mt: 2, fontSize: 14, opacity: 0.95 }}>{message}</Typography>
        </Box>
      </Backdrop>
    </>
  );
}
