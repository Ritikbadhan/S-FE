"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !isAdmin) {
      router.replace("/account");
    }
  }, [isAuthenticated, isAdmin, isLoading, router, user]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Checking admin access...</Typography>
      </Box>
    );
  }

  return children;
}
