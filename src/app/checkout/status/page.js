"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Chip, Container, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { AppButton } from "@/components/common";

function CheckoutStatusContent() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const searchParams = useSearchParams();
  const result = searchParams.get("result") || "failed";
  const message = searchParams.get("message") || "Something went wrong.";
  const orderId = searchParams.get("orderId") || "";
  const isSuccess = result === "success";

  return (
    <Box sx={{ minHeight: "70vh", py: { xs: 6, md: 9 }, bgcolor: brand.bg }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: 4, bgcolor: brand.surface, border: `1px solid ${brand.borderSoft}`, boxShadow: brand.shadowCardStrong }}>
          <Box sx={{ py: { xs: 4, md: 5 }, px: { xs: 3, md: 4 }, textAlign: "center", color: "#fff", background: isSuccess ? `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})` : `linear-gradient(135deg, ${brand.error}, ${brand.error}CC)` }}>
            <Box sx={{ width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.18)" }}>
              {isSuccess ? <CheckCircleOutlineIcon sx={{ fontSize: 36 }} /> : <ErrorOutlineIcon sx={{ fontSize: 36 }} />}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, textShadow: brand.heroTextShadow, mb: 1.25 }}>
              {isSuccess ? "Thank you for your order" : "Unable to complete order"}
            </Typography>
            <Typography sx={{ opacity: 0.95 }}>{message}</Typography>
          </Box>

          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
              <Chip label={isSuccess ? "Order Confirmed" : "Order Failed"} color={isSuccess ? "success" : "error"} />
              {orderId ? <Chip label={`Order ID: ${orderId}`} variant="outlined" /> : null}
            </Stack>

            <Divider sx={{ mb: 3, borderColor: brand.border }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {isSuccess ? (
                <AppButton component={Link} href="/account" fullWidth>
                  Go to My Orders
                </AppButton>
              ) : (
                <AppButton component={Link} href="/checkout" fullWidth>
                  Try Again
                </AppButton>
              )}
              <AppButton component={Link} href="/shop" variant="outlined" fullWidth>
                Continue Shopping
              </AppButton>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutStatusContent />
    </Suspense>
  );
}
