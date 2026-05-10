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
  IconButton,
  MenuItem,
  Paper,
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

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
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

  return <Chip label={status} size="small" color={map[status] || "default"} />;
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
          String(o._id || o.id)
            .toLowerCase()
            .includes(s) ||
          (o.userEmail || o.email || "").toLowerCase().includes(s),
      );
    }

    if (statusFilter) {
      result = result.filter(
        (o) => (o.orderStatus || o.status) === statusFilter,
      );
    }

    setFiltered(result);
  }, [search, statusFilter, orders]);

  const analytics = useMemo(() => {
    return {
      total: orders.length,
      processing: orders.filter(
        (o) => (o.orderStatus || o.status) === "Processing",
      ).length,
      shipped: orders.filter((o) => (o.orderStatus || o.status) === "Shipped")
        .length,
      delivered: orders.filter(
        (o) => (o.orderStatus || o.status) === "Delivered",
      ).length,
    };
  }, [orders]);

  const updateOrder = async (id, status) => {
    try {
      await adminApi.updateOrder(id, {
        action: "update_status",
        status,
        orderStatus: status,
      });

      setSuccess(`Order marked as ${status}`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to update order");
    }
  };

  const openDetails = async (id) => {
    const data = await adminApi.orderById(id);
    const order = data?.order || data?.data || data;
    setSelectedOrder(order);
  };

  const exportOrders = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "orders-export.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printInvoice = (order) => {
    const popup = window.open("", "_blank", "width=700,height=900");
    if (!popup) return;

    popup.document.write(`
      <h2>Sharq Label</h2>
      <hr/>
      <p>Order ID: ${order._id}</p>
      <p>Customer: ${order.userEmail || "-"}</p>
      <p>Total: ${currency(order.totalAmount)}</p>

      <h3>Items</h3>
      <ul>
        ${(order.items || [])
          .map(
            (i) =>
              `<li>${i.name || i.productName} x ${
                i.quantity || i.qty
              } - ${currency(i.price)}</li>`,
          )
          .join("")}
      </ul>
    `);

    popup.print();
  };

  return (
    <AdminGuard>
      <AdminShell title="Manage Orders">
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* ANALYTICS */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Total Orders</Typography>
            <Typography variant="h6">{analytics.total}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography>Processing</Typography>
            <Typography variant="h6">{analytics.processing}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography>Shipped</Typography>
            <Typography variant="h6">{analytics.shipped}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography>Delivered</Typography>
            <Typography variant="h6">{analytics.delivered}</Typography>
          </Paper>
        </Stack>

        {/* SEARCH + FILTER */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Packed">Packed</MenuItem>
            <MenuItem value="Dispatched">Dispatched</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>

          <Button variant="outlined" onClick={exportOrders}>
            Export
          </Button>
        </Stack>

        {/* TABLE */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((order) => {
                const id = order._id || order.id;
                const status = order.orderStatus || order.status;

                return (
                  <TableRow key={id}>
                    <TableCell>{id}</TableCell>

                    <TableCell>{order.userId?.email || "-"}</TableCell>
                    <TableCell>{order.userId?.name || "-"}</TableCell>

                    <TableCell>
                      <StatusChip status={status} />
                    </TableCell>

                    <TableCell>
                      {currency(order.totalAmount || order.total)}
                    </TableCell>

                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View">
                          <IconButton onClick={() => openDetails(id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Confirm">
                          <IconButton
                            onClick={() => updateOrder(id, "Confirmed")}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Processing">
                          <IconButton
                            onClick={() => updateOrder(id, "Processing")}
                          >
                            <Inventory2Icon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Packed">
                          <IconButton onClick={() => updateOrder(id, "Packed")}>
                            📦
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Dispatched">
                          <IconButton
                            onClick={() => updateOrder(id, "Dispatched")}
                          >
                            🚚
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Shipped">
                          <IconButton
                            onClick={() => updateOrder(id, "Shipped")}
                          >
                            <LocalShippingIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delivered">
                          <IconButton
                            color="success"
                            onClick={() => updateOrder(id, "Delivered")}
                          >
                            <DoneAllIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Refund">
                          <IconButton
                            color="warning"
                            onClick={() => updateOrder(id, "Refunded")}
                          >
                            <ReplayIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cancel">
                          <IconButton
                            color="error"
                            onClick={() => updateOrder(id, "Cancelled")}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* ORDER DETAILS */}
        <Dialog
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Order Details</DialogTitle>

          <DialogContent>
            {selectedOrder && (
              <Stack spacing={2}>
                <Typography>
                  <b>Order ID:</b> {selectedOrder._id || selectedOrder.id}
                </Typography>

                <Typography>
                  <b>Customer:</b>{" "}
                  {selectedOrder.user?.email || selectedOrder.userEmail || "-"}
                </Typography>

                <Typography>
                  <b>Total:</b> {currency(selectedOrder.totalAmount)}
                </Typography>

                {/* SHIPPING ADDRESS */}
                <Box>
                  <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                    Shipping Address
                  </Typography>

                  {selectedOrder.shippingAddress ? (
                    <Stack spacing={0.5}>
                      <Typography>
                        {selectedOrder.shippingAddress.name} |{" "}
                        {selectedOrder.shippingAddress.phone}
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
                          Landmark: {selectedOrder.shippingAddress.landmark}
                        </Typography>
                      )}

                      {selectedOrder.shippingAddress.instructions && (
                        <Typography>
                          Instructions:{" "}
                          {selectedOrder.shippingAddress.instructions}
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>

                {/* ORDER ITEMS */}
                <Box>
                  <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                    Items
                  </Typography>

                  <Stack spacing={0.5}>
                    {(selectedOrder.items || []).map((item, i) => (
                      <Typography key={i}>
                        {item.name || item.productName} | Qty{" "}
                        {item.quantity || item.qty || 1}
                        {item.size && ` | Size ${item.size}`}
                        {item.color && ` | Color ${item.color}`}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => printInvoice(selectedOrder)}>
              Print Invoice
            </Button>

            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
