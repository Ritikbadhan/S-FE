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
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const printInvoice = (order) => {
    const popup = window.open("", "_blank", "width=700,height=900");
    if (!popup || !order) return;

    popup.document.write(`
      <h2>Sharq Label</h2>
      <hr/>
      <p>Order ID: ${order._id}</p>
      <p>Customer: ${order.userEmail || "-"}</p>
      <p>Total: ${currency(order.totalAmount)}</p>
      <h3>Items</h3>
      <ul>
        ${(order.items || [])
          .map((i) => `<li>${i.name || i.productName} x ${i.quantity || i.qty} - ${currency(i.price)}</li>`)
          .join("")}
      </ul>
    `);
    popup.print();
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

        <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 6 } }}>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder ? (
              <Stack spacing={2}>
                <Typography><b>Order ID:</b> {selectedOrder._id || selectedOrder.id}</Typography>
                <Typography><b>Customer:</b> {selectedOrder.user?.email || selectedOrder.userEmail || "-"}</Typography>
                <Typography><b>Total:</b> {currency(selectedOrder.totalAmount)}</Typography>
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 0.5 }}>Shipping Address</Typography>
                  {selectedOrder.shippingAddress ? (
                    <Stack spacing={0.5}>
                      <Typography>{selectedOrder.shippingAddress.name} | {selectedOrder.shippingAddress.phone}</Typography>
                      <Typography>{selectedOrder.shippingAddress.line1}{selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ""}</Typography>
                      <Typography>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</Typography>
                    </Stack>
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 0.5 }}>Items</Typography>
                  <Stack spacing={0.5}>
                    {(selectedOrder.items || []).map((item, i) => (
                      <Typography key={i}>
                        {item.name || item.productName} | Qty {item.quantity || item.qty || 1}
                        {item.size ? ` | Size ${item.size}` : ""}
                        {item.color ? ` | Color ${item.color}` : ""}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => printInvoice(selectedOrder)}>Print Invoice</Button>
            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
