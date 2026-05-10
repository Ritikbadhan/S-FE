"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { AppButton } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";

const currency = (value) => `Rs ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

const formatAddress = (value) => {
  if (!value) return "Address not available";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") {
    const parts = [
      value?.name,
      value?.line1,
      value?.line2,
      value?.city,
      value?.state,
      value?.pincode,
      value?.landmark,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : "Address not available";
  }
  return "Address not available";
};

const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);
const getOrderStatus = (order) => String(order?.status || order?.orderStatus || "Processing");
const getOrderDate = (order) => order?.createdAt || order?.date || new Date().toISOString();
const getOrderTotal = (order) => Number(order?.total || order?.totalAmount || 0);
const getTrackingEvents = (order) => {
  const events = order?.events || order?.trackingEvents || order?.timeline || [];
  return Array.isArray(events) ? events : [];
};

const STATUS_FLOW = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function TrackOrderPage() {
  const { orderId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId || !isAuthenticated) {
        if (active) setLoadingOrder(false);
        return;
      }

      try {
        const [orderResponse, trackingResponse] = await Promise.all([
          ordersApi.getById(orderId).catch(() => null),
          ordersApi.trackById(orderId),
        ]);
        if (!active) return;
        const orderRoot =
          orderResponse?.order ||
          orderResponse?.data?.order ||
          orderResponse?.data ||
          orderResponse ||
          {};
        const trackingRoot =
          trackingResponse?.tracking ||
          trackingResponse?.data?.tracking ||
          trackingResponse?.data ||
          trackingResponse ||
          {};
        setOrder({ ...orderRoot, ...trackingRoot, items: orderRoot?.items || trackingRoot?.items || [] });
      } catch (err) {
        if (active) setError(err.message || "Failed to load order details.");
      } finally {
        if (active) setLoadingOrder(false);
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId, isAuthenticated]);

  const currentStatus = getOrderStatus(order);
  const statusIndex = useMemo(() => {
    const idx = STATUS_FLOW.findIndex((step) =>
      currentStatus.toLowerCase().includes(step.toLowerCase())
    );
    return idx >= 0 ? idx : 1;
  }, [currentStatus]);

  if (isLoading || loadingOrder) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Track Order
        </Typography>
        <Typography sx={{ mb: 2 }}>Please login to track your order.</Typography>
        <AppButton component={Link} href={`/login?next=/track-order/${orderId}`}>
          Go to Login
        </AppButton>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Track Order
        </Typography>
        <Typography sx={{ mb: 2 }}>{error || "Order not found."}</Typography>
        <AppButton component={Link} href="/account" variant="outlined">
          Back to Account
        </AppButton>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "start", sm: "center" }}
          spacing={1.2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4">Track Order</Typography>
            <Typography sx={{ opacity: 0.75 }}>Order ID: {orderId}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <AppButton component={Link} href="/account" variant="outlined">
              Back to Account
            </AppButton>
            <AppButton component={Link} href="/shop" variant="outlined">
              Continue Shopping
            </AppButton>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={currentStatus}
                    color={currentStatus.toLowerCase().includes("delivered") ? "success" : "warning"}
                  />
                  {order?.paymentStatus ? (
                    <Chip label={`Payment: ${order.paymentStatus}`} variant="outlined" />
                  ) : null}
                </Stack>

                <Typography sx={{ mb: 1.2, fontWeight: 600 }}>Order Progress</Typography>
                <Stack spacing={1.1} sx={{ mb: 2.5 }}>
                  {(getTrackingEvents(order).length ? getTrackingEvents(order) : STATUS_FLOW).map((step, idx) => {
                    const label =
                      typeof step === "string"
                        ? step
                        : step?.label || step?.status || step?.title || `Step ${idx + 1}`;
                    const isDone =
                      getTrackingEvents(order).length > 0
                        ? Boolean(step?.completed ?? step?.done ?? true)
                        : idx <= statusIndex;
                    return (
                    <Stack key={`${label}-${idx}`} direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        color={isDone ? "success" : "default"}
                        label={isDone ? "Done" : "Pending"}
                      />
                      <Typography sx={{ opacity: isDone ? 1 : 0.65 }}>{label}</Typography>
                    </Stack>
                    );
                  })}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ mb: 0.7, fontWeight: 600 }}>Items</Typography>
                <Stack spacing={0.7} sx={{ mb: 2 }}>
                  {getOrderItems(order).map((item, idx) => (
                    <Typography key={`${orderId}-${idx}`} sx={{ opacity: 0.85 }}>
                      {item?.name || item?.productName || item?.product?.name || "Item"} | Qty:{" "}
                      {item?.quantity || item?.qty || 1} | Size:{" "}
                      {item?.size || item?.variant?.size || "N/A"} | Color:{" "}
                      {item?.color || item?.variant?.color || "N/A"}
                    </Typography>
                  ))}
                </Stack>

                <Typography sx={{ opacity: 0.85 }}>
                  Delivery Address: {formatAddress(order?.shippingAddress || order?.address)}
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>
                  Payment Method: {order?.paymentMethod || "Online"}
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>
                  Tracking ID: {order?.trackingId || "Not assigned yet"}
                </Typography>
                {order?.trackingUrl ? (
                  <Typography sx={{ mt: 0.6 }}>
                    <Link href={order.trackingUrl} target="_blank">
                      Open Tracking Link
                    </Link>
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: { md: "sticky" }, top: 90 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Order Summary</Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ opacity: 0.8 }}>Order Date</Typography>
                  <Typography>{new Date(getOrderDate(order)).toLocaleDateString("en-IN")}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ opacity: 0.8 }}>Items</Typography>
                  <Typography>{getOrderItems(order).length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ opacity: 0.8 }}>Total</Typography>
                  <Typography>{currency(getOrderTotal(order))}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
