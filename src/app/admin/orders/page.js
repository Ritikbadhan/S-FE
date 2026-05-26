"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ReplayIcon from "@mui/icons-material/Replay";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import PaymentsIcon from "@mui/icons-material/Payments";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard, AdminTableWrap } from "@/components/admin/AdminUi";
import { adminApi } from "@/lib/api";
import { printInvoice } from "./printInvoice";

function currency(v) {
  return `Rs ${Number(v || 0).toLocaleString("en-IN")}`;
}

function StatusChip({ status }) {
  const map = {
    Pending: "default",
    Confirmed: "info",
    Processing: "warning",
    Packed: "secondary",
    Dispatched: "secondary",
    Shipped: "info",
    Delivered: "success",
    Cancelled: "error",
    Refunded: "secondary",
  };

  return <Chip label={status || "Pending"} size="small" color={map[status] || "default"} sx={{ fontWeight: 700 }} />;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    try {
      const data = await adminApi.orders();
      const list = data?.orders || data?.data || data || [];
      setOrders(list);
      setFiltered(list);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = [...orders];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          String(o._id || o.id).toLowerCase().includes(s) ||
          (o.userId?.email || o.userEmail || o.email || "").toLowerCase().includes(s),
      );
    }
    if (statusFilter) {
      result = result.filter((o) => (o.orderStatus || o.status) === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || order.total || 0), 0);
    const countStatus = (status) => orders.filter((o) => (o.orderStatus || o.status) === status).length;
    return {
      total: orders.length,
      pending: countStatus("Pending"),
      delivered: countStatus("Delivered"),
      revenue,
    };
  }, [orders]);

  const updateOrder = async (id, status) => {
    try {
      await adminApi.updateOrder(id, { action: "update_status", status, orderStatus: status });
      setSuccess(`Order marked as ${status}`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to update order");
    }
  };

  const openDetails = async (id) => {
    const data = await adminApi.orderById(id);
    setSelectedOrder(data?.order || data?.data || data);
  };

 const exportOrders = () => {
  if (!orders?.length) return;

  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Customer Email",
    "Phone",
    "City",
    "State",
    "Pincode",
    "Address",
    "Products",
    "Sizes",
    "Colors",
    "Quantity",
    "Subtotal",
    "GST Rate",
    "GST Amount",
    "Total Amount",
    "Payment Type",
    "Payment Status",
    "Order Status",
  ];

  const rows = orders.map((order) => {
    const shipping = order.shippingAddress || {};

    const subtotal = Number(order.subtotalAmount || 0);

    const gstRate = subtotal <= 1000 ? 5 : 12;

    const taxableAmount =
      subtotal / (1 + gstRate / 100);

    const gstAmount =
      subtotal - taxableAmount;

    const items = order.items || [];

    return [

      // Order ID
      order._id || "",

      // Date
      order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "",

      // Customer Name
      order.userId?.name || "",

      // Email
      order.userId?.email || "",

      // Phone
      shipping.phone || "",

      // City
      shipping.city || "",

      // State
      shipping.state || "",

      // Pincode
      shipping.pincode || "",

      // Full Address
      `${shipping.line1 || ""} ${shipping.line2 || ""}`.trim(),

      // Products
      items
        .map((item) => item.name || item.productName)
        .join(" | "),

      // Sizes
      items
        .map((item) => item.size || "-")
        .join(" | "),

      // Colors
      items
        .map((item) => item.color || "-")
        .join(" | "),

      // Quantity
      items
        .map(
          (item) =>
            item.quantity || item.qty || 1
        )
        .join(" | "),

      // Subtotal
      subtotal,

      // GST Rate
      `${gstRate}%`,

      // GST Amount
      gstAmount.toFixed(2),

      // Total
      order.totalAmount || 0,

      // Payment Type
      order.paymentMethod === "RAZORPAY"
        ? "ONLINE"
        : "COD",

      // Payment Status
      order.paymentStatus || "",

      // Order Status
      order.orderStatus || "",
    ];
  });

  const csvContent = [
    headers.join(","),

    ...rows.map((row) =>
      row
        .map((field) =>
          `"${String(field).replace(/"/g, '""')}"`
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = `orders-export-${
    new Date().toISOString().split("T")[0]
  }.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  return (
    <AdminGuard>
      <AdminShell title="Manage Orders">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <AdminPanel
          title="Orders"
          action={
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportOrders}>
              Export
            </Button>
          }
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3, position: "sticky", top: { xs: 72, md: 80 }, zIndex: 5, bgcolor: "background.paper", py: 1 }}
          >
            <TextField
              size="small"
              placeholder="Search order id or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { md: 340 }, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />
            <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 190, borderRadius: 4 }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Packed">Packed</MenuItem>
              <MenuItem value="Dispatched">Dispatched</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </Stack>

          <AdminTableWrap maxHeight={680}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Date</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((order) => {
                  const id = order._id || order.id;
                  const status = order.orderStatus || order.status;
                  const name = order.userId?.name || order.user?.name || "-";
                  const email = order.userId?.email || order.user?.email || order.userEmail || "-";

                  return (
                    <TableRow key={id} hover>
                      <TableCell sx={{ fontWeight: 800, color: "primary.dark", maxWidth: 180 }}>
                        {String(id).slice(0, 14)}...
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
                        <Typography variant="caption" color="text.secondary">{email}</Typography>
                      </TableCell>
                      <TableCell><StatusChip status={status} /></TableCell>
                      <TableCell><Chip size="small" label={order.paymentStatus || "Paid"} color={order.paymentStatus === "Failed" ? "error" : "success"} /></TableCell>
                      <TableCell>{order.paymentMethod || "Unknown"}</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{currency(order.totalAmount || order.total)}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View"><IconButton onClick={() => openDetails(id)}><VisibilityIcon /></IconButton></Tooltip>
                          <Tooltip title="Confirm"><IconButton onClick={() => updateOrder(id, "Confirmed")}><CheckCircleIcon /></IconButton></Tooltip>
                          <Tooltip title="Processing"><IconButton onClick={() => updateOrder(id, "Processing")}><Inventory2Icon /></IconButton></Tooltip>
                          <Tooltip title="Shipped"><IconButton onClick={() => updateOrder(id, "Shipped")}><LocalShippingIcon /></IconButton></Tooltip>
                          <Tooltip title="Delivered"><IconButton color="success" onClick={() => updateOrder(id, "Delivered")}><DoneAllIcon /></IconButton></Tooltip>
                          <Tooltip title="Refund"><IconButton color="warning" onClick={() => updateOrder(id, "Refunded")}><ReplayIcon /></IconButton></Tooltip>
                          <Tooltip title="Cancel"><IconButton color="error" onClick={() => updateOrder(id, "Cancelled")}><CancelIcon /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AdminTableWrap>
        </AdminPanel>


        <Dialog
  open={Boolean(selectedOrder)}
  onClose={() => setSelectedOrder(null)}
  fullWidth
  maxWidth="md"
  PaperProps={{ sx: { borderRadius: 2 } }}
>
  <DialogTitle>Order Details</DialogTitle>

  <DialogContent>
    {selectedOrder ? (
      <Stack spacing={3}>
        {/* Order Info */}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Order Information
          </Typography>

          <Stack spacing={0.7}>
            <Typography>
              <b>Order ID:</b> {selectedOrder._id || selectedOrder.id}
            </Typography>

            <Typography>
              <b>Order Status:</b> {selectedOrder.orderStatus || "-"}
            </Typography>

            <Typography>
              <b>Payment Status:</b> {selectedOrder.paymentStatus || "-"}
            </Typography>

            <Typography>
              <b>Payment Method:</b> {selectedOrder.paymentMethod || "-"}
            </Typography>

            <Typography>
              <b>Currency:</b> {selectedOrder.paymentCurrency || "-"}
            </Typography>

            <Typography>
              <b>Created At:</b>{" "}
              {selectedOrder.createdAt
                ? new Date(selectedOrder.createdAt).toLocaleString()
                : "-"}
            </Typography>
          </Stack>
        </Box>

        {/* Customer Info */}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Customer Details
          </Typography>

          <Stack spacing={0.7}>
            <Typography>
              <b>Name:</b>{" "}
              {selectedOrder.userId?.name ||
                selectedOrder.user?.name ||
                "-"}
            </Typography>

            <Typography>
              <b>Email:</b>{" "}
              {selectedOrder.userId?.email ||
                selectedOrder.user?.email ||
                selectedOrder.userEmail ||
                "-"}
            </Typography>

            <Typography>
              <b>Phone:</b>{" "}
              {selectedOrder.shippingAddress?.phone || "-"}
            </Typography>
          </Stack>
        </Box>

        {/* Shipping Address */}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Shipping Address
          </Typography>

          {selectedOrder.shippingAddress ? (
            <Stack spacing={0.5}>
              <Typography>
                {selectedOrder.shippingAddress.name}
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress.line1}
                {selectedOrder.shippingAddress.line2
                  ? `, ${selectedOrder.shippingAddress.line2}`
                  : ""}
              </Typography>

              <Typography>
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state} -{" "}
                {selectedOrder.shippingAddress.pincode}
              </Typography>

              {selectedOrder.shippingAddress.landmark && (
                <Typography>
                  <b>Landmark:</b>{" "}
                  {selectedOrder.shippingAddress.landmark}
                </Typography>
              )}

              {selectedOrder.shippingAddress.instructions && (
                <Typography>
                  <b>Instructions:</b>{" "}
                  {selectedOrder.shippingAddress.instructions}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography>-</Typography>
          )}
        </Box>

        {/* Items */}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Order Items
          </Typography>

          <Stack spacing={2}>
            {(selectedOrder.items || []).map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 2,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                />

                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>
                    {item.name || item.productName}
                  </Typography>

                  <Typography>
                    <b>Qty:</b> {item.quantity || item.qty || 1}
                  </Typography>

                  <Typography>
                    <b>Size:</b> {item.size || "-"}
                  </Typography>

                  <Typography>
                    <b>Color:</b> {item.color || "-"}
                  </Typography>

                  <Typography>
                    <b>Price:</b> {currency(item.price || 0)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Price Breakdown */}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Pricing Details
          </Typography>

          <Stack spacing={0.5}>
            <Typography>
              <b>Subtotal:</b>{" "}
              {currency(selectedOrder.subtotalAmount || 0)}
            </Typography>

            <Typography>
              <b>Shipping:</b>{" "}
              {currency(selectedOrder.shippingAmount || 0)}
            </Typography>

            <Typography>
              <b>Tax:</b>{" "}
              {currency(selectedOrder.taxAmount || 0)}
            </Typography>

            <Typography>
              <b>Discount:</b>{" "}
              {currency(selectedOrder.discountAmount || 0)}
            </Typography>

            <Typography fontWeight={700}>
              <b>Total:</b>{" "}
              {currency(selectedOrder.totalAmount || 0)}
            </Typography>
          </Stack>
        </Box>

        
      </Stack>
    ) : null}
  </DialogContent>
   <DialogActions>
            <Button onClick={() => printInvoice(selectedOrder, currency)}>Print Invoice</Button>
            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogActions>
</Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
