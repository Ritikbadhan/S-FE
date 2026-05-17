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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
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
const getPaymentStatus = (order) => String(order?.paymentStatus || order?.payment?.status || "");
const getOrderDate = (order) => order?.createdAt || order?.date || new Date().toISOString();
const getOrderTotal = (order) => Number(order?.total || order?.totalAmount || 0);
const getTrackingEvents = (order) => {
  const events = order?.events || order?.trackingEvents || order?.timeline || [];
  return Array.isArray(events) ? events : [];
};

const STATUS_FLOW = ["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const statusCopy = {
  "order placed": {
    badge: "Order Placed",
    color: "info",
    message: "Your order has been successfully placed. We will begin processing it shortly.",
  },
  pending: {
    badge: "Payment Pending",
    color: "warning",
    message: "Payment is pending. Once confirmed, your order will be processed.",
  },
  confirmed: {
    badge: "Order Placed",
    color: "info",
    message: "Thank you for shopping with us. Your order is now confirmed.",
  },
  processing: {
    badge: "Processing",
    color: "warning",
    message: "Your order is being prepared for shipment. Our team is carefully packing your items.",
  },
  packed: {
    badge: "Processing",
    color: "warning",
    message: "We are getting your items ready for dispatch.",
  },
  dispatched: {
    badge: "Shipped",
    color: "info",
    message: "Great news! Your order has been shipped and is on the way.",
  },
  shipped: {
    badge: "Shipped",
    color: "info",
    message: "Your package is on the way. You can track your shipment using the tracking ID below.",
  },
  "out for delivery": {
    badge: "Out for Delivery",
    color: "secondary",
    message: "Your order is out for delivery today. Please keep your phone available for updates.",
  },
  delivered: {
    badge: "Delivered",
    color: "success",
    message: "Your order has been delivered successfully. We hope you enjoy your purchase.",
  },
  cancelled: {
    badge: "Cancelled",
    color: "error",
    message: "This order has been cancelled. Refund will be processed shortly if payment was completed.",
  },
  returned: {
    badge: "Returned",
    color: "default",
    message: "Your return request has been completed. Refund will be initiated after quality verification.",
  },
  refunded: {
    badge: "Returned",
    color: "default",
    message: "Your return has been processed and the refund workflow is underway.",
  },
};

function getStatusInfo(order) {
  const status = getOrderStatus(order).toLowerCase();
  const paymentStatus = getPaymentStatus(order).toLowerCase();
  if (paymentStatus.includes("failed")) {
    return {
      badge: "Payment Failed",
      color: "error",
      message: "Unfortunately, your payment could not be completed. Please try again using another payment method.",
    };
  }
  if (paymentStatus.includes("pending")) return statusCopy.pending;
  return (
    Object.entries(statusCopy).find(([key]) => status.includes(key))?.[1] ||
    statusCopy.processing
  );
}

function getTrackingInfo(order) {
  if (order?.trackingId) {
    return {
      label: order.trackingId,
      message: "Track your shipment using the tracking ID below.",
    };
  }
  return {
    label: "Not assigned yet",
    message: "Tracking ID will be available once the order is shipped.",
  };
}

function getEstimatedDelivery(order) {
  if (order?.estimatedDelivery) return order.estimatedDelivery;
  if (order?.deliveryEstimate) return order.deliveryEstimate;
  const start = new Date(getOrderDate(order));
  if (Number.isNaN(start.getTime())) return "Expected to arrive within 3-5 business days";
  const from = new Date(start);
  const to = new Date(start);
  from.setDate(from.getDate() + 3);
  to.setDate(to.getDate() + 5);
  return `${from.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${to.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

function normalizeTimelineStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("pending") || value.includes("placed") || value.includes("confirmed")) return "Order Placed";
  if (value.includes("paid") || value.includes("payment")) return "Payment Confirmed";
  if (value.includes("process") || value.includes("pack")) return "Processing";
  if (value.includes("ship") || value.includes("dispatch")) return "Shipped";
  if (value.includes("out for delivery")) return "Out for Delivery";
  if (value.includes("deliver")) return "Delivered";
  return status || "Update";
}

function getTimelineIcon(label, isDone) {
  if (!isDone) return <RadioButtonUncheckedIcon fontSize="small" />;
  if (label === "Shipped" || label === "Out for Delivery") return <LocalShippingIcon fontSize="small" />;
  if (label === "Processing") return <Inventory2Icon fontSize="small" />;
  return <CheckCircleIcon fontSize="small" />;
}

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
	  const statusInfo = getStatusInfo(order);
	  const trackingInfo = getTrackingInfo(order);
	  const statusIndex = useMemo(() => {
	    const normalized = normalizeTimelineStatus(currentStatus);
	    const idx = STATUS_FLOW.findIndex((step) => step === normalized);
	    if (idx >= 0) return idx;
	    if (currentStatus.toLowerCase().includes("cancel")) return 0;
	    if (currentStatus.toLowerCase().includes("return") || currentStatus.toLowerCase().includes("refund")) return STATUS_FLOW.length - 1;
	    return 2;
	  }, [currentStatus]);
	  const timelineEntries = getTrackingEvents(order);

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
	                    label={statusInfo.badge}
	                    color={statusInfo.color}
	                    sx={{ fontWeight: 700 }}
	                  />
	                  {order?.paymentStatus ? (
	                    <Chip label={`Payment: ${order.paymentStatus}`} variant="outlined" />
	                  ) : null}
	                </Stack>
	                <Typography sx={{ mb: 2.2, opacity: 0.82, lineHeight: 1.7 }}>
	                  {statusInfo.message}
	                </Typography>
	
	                <Typography sx={{ mb: 1.2, fontWeight: 600 }}>Order Progress</Typography>
	                <Stack spacing={1.1} sx={{ mb: 2.5 }}>
	                  {(timelineEntries.length ? timelineEntries : STATUS_FLOW).map((step, idx) => {
	                    const label =
	                      typeof step === "string"
	                        ? step
	                        : normalizeTimelineStatus(step?.label || step?.status || step?.title || `Step ${idx + 1}`);
	                    const isDone =
	                      timelineEntries.length > 0
	                        ? Boolean(step?.completed ?? step?.done ?? true)
	                        : idx <= statusIndex;
	                    return (
	                    <Stack key={`${label}-${idx}`} direction="row" spacing={1.2} alignItems="flex-start">
	                      <Box
	                        sx={{
	                          width: 28,
	                          height: 28,
	                          borderRadius: "50%",
	                          display: "grid",
	                          placeItems: "center",
	                          color: isDone ? "success.main" : "text.disabled",
	                          bgcolor: isDone ? "success.light" : "action.hover",
	                          flexShrink: 0,
	                        }}
	                      >
	                        {getTimelineIcon(label, isDone)}
	                      </Box>
	                      <Box>
	                        <Typography sx={{ opacity: isDone ? 1 : 0.65, fontWeight: isDone ? 700 : 500 }}>
	                          {label}
	                        </Typography>
	                        {typeof step !== "string" && (step?.message || step?.description || step?.date || step?.createdAt) ? (
	                          <Typography variant="caption" sx={{ opacity: 0.65 }}>
	                            {step?.message || step?.description || formatDate(step?.date || step?.createdAt)}
	                          </Typography>
	                        ) : null}
	                      </Box>
	                    </Stack>
	                    );
	                  })}
	                  {!timelineEntries.length ? (
	                    <Typography sx={{ opacity: 0.7, fontSize: "0.9rem" }}>
	                      No live tracking updates available yet. We will update this page as your order progresses.
	                    </Typography>
	                  ) : null}
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
	                  Estimated Delivery: {getEstimatedDelivery(order)}
	                </Typography>
	                <Typography sx={{ opacity: 0.85, mt: 1 }}>
	                  {trackingInfo.message}
	                </Typography>
	                <Typography sx={{ opacity: 0.85 }}>
	                  Tracking ID: {trackingInfo.label}
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
