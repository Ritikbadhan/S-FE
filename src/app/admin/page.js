"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  TableContainer,
} from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

function currency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function statusColor(status) {
  const map = {
    Processing: "warning",
    Confirmed: "info",
    Shipped: "secondary",
    Delivered: "success",
    Cancelled: "error",
  };

  return map[status] || "default";
}

function StatCard({ label, value, icon }) {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 2.5, sm: 3 },
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
          borderColor: theme.palette.primary.main,
          "& .stat-icon-box": {
            transform: "scale(1.1) rotate(5deg)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: -30,
          right: -30,
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${theme.palette.primary.light}20, transparent)`,
          borderRadius: "50%",
        },
      }}
    >
      {/* Title Row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, mb: { xs: 1.5, sm: 2 }, position: "relative", zIndex: 1 }}>
        <Box
          className="stat-icon-box"
          sx={{
            bgcolor: "primary.main",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "#FFFFFF",
            p: { xs: 1, sm: 1.2 },
            borderRadius: { xs: 1.5, sm: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.4s ease",
            "& svg": {
              fontSize: { xs: 20, sm: 22, md: 24 },
            },
          }}
        >
          {icon}
        </Box>

        <Typography sx={{ 
          opacity: 0.85, 
          fontSize: { xs: "0.813rem", sm: "0.875rem", md: "0.938rem" },
          fontWeight: 600,
          letterSpacing: 0.3,
        }}>
          {label}
        </Typography>
      </Box>

      {/* Value */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mt: 1.2,
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const data = await adminApi.dashboardStats();

        if (active) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <AdminShell title="Admin Dashboard">
          <Box sx={{ 
            py: { xs: 8, sm: 10 }, 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}>
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Loading dashboard...
            </Typography>
          </Box>
        </AdminShell>
      </AdminGuard>
    );
  }

  if (!stats) {
    return (
      <AdminGuard>
        <AdminShell title="Admin Dashboard">
          <Alert severity="error" sx={{ borderRadius: { xs: 2, sm: 2.5 } }}>
            Dashboard data unavailable
          </Alert>
        </AdminShell>
      </AdminGuard>
    );
  }

  const { summary, orderStatus, recentOrders, lowStock } = stats;

  return (
    <AdminGuard>
   <AdminShell title="Admin Dashboard">
  {/* ERROR */}

  {error && (
    <Alert
      severity="error"
      sx={{
        mb: 3,
        borderRadius: "16px",
      }}
    >
      {error}
    </Alert>
  )}

  {/* PAGE HEADER */}

  <Box sx={{ mb: 4 }}>
    <Typography
      sx={{
        fontSize: "2rem",
        fontWeight: 800,
        color: "#0f172a",
        letterSpacing: "-0.03em",
      }}
    >
      Dashboard
    </Typography>

    <Typography
      sx={{
        color: "#64748b",
        mt: 0.5,
        fontSize: "0.95rem",
      }}
    >
      Overview of revenue, orders, products and stock activity.
    </Typography>
  </Box>

  {/* STATS */}

  <Grid container spacing={2.5} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} lg={3}>
      <StatCard
        label="Revenue"
        value={currency(summary.revenue)}
        icon={<AttachMoneyIcon />}
      />
    </Grid>

    <Grid item xs={12} sm={6} lg={3}>
      <StatCard
        label="Orders"
        value={summary.orders}
        icon={<ShoppingCartIcon />}
      />
    </Grid>

    <Grid item xs={12} sm={6} lg={3}>
      <StatCard
        label="Products"
        value={summary.products}
        icon={<InventoryIcon />}
      />
    </Grid>

    <Grid item xs={12} sm={6} lg={3}>
      <StatCard
        label="Users"
        value={summary.users}
        icon={<PeopleIcon />}
      />
    </Grid>
  </Grid>

  {/* MAIN DASHBOARD GRID */}

  <Grid container spacing={3}>
    {/* RECENT ORDERS */}

    <Grid item xs={12} lg={8}>
      <Paper
        sx={{
          borderRadius: "24px",
          border: "1px solid #eef2f7",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Recent Orders
          </Typography>
        </Box>

        {recentOrders.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "#fafbfd",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    Order ID
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    Date
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid #f8fafc",
                        py: 2,
                      },

                      "&:hover": {
                        background: "#fafbfd",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#2563eb",
                        fontFamily: "monospace",
                      }}
                    >
                      {order._id.substring(0, 12)}...
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={order.orderStatus}
                        color={statusColor(order.orderStatus)}
                        sx={{
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#64748b",
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-IN"
                      )}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {currency(order.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              py: 8,
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            No recent orders
          </Box>
        )}
      </Paper>
    </Grid>

    {/* RIGHT SIDEBAR */}

    <Grid item xs={12} lg={4}>
      <Stack spacing={3}>
        {/* ORDER STATUS */}

        <Paper
          sx={{
            borderRadius: "24px",
            border: "1px solid #eef2f7",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2.5,
              color: "#0f172a",
            }}
          >
            Order Status
          </Typography>

          <Stack spacing={1.5}>
            {orderStatus.length ? (
              orderStatus.map((item) => (
                <Stack
                  key={item._id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: "14px",
                    background: "#fafbfd",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {item._id}
                  </Typography>

                  <Chip
                    size="small"
                    label={item.count}
                    color={statusColor(item._id)}
                    sx={{
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">
                No order data
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* LOW STOCK */}

        <Paper
          sx={{
            borderRadius: "24px",
            border: "1px solid #eef2f7",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2.5,
              color: "#0f172a",
            }}
          >
            Low Stock Products
          </Typography>

          <Stack spacing={1.5}>
            {lowStock.length ? (
              lowStock.map((item) => (
                <Stack
                  key={`${item._id}-${item.size}`}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: "14px",
                    background: "#fafbfd",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.productName}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.76rem",
                        color: "#94a3b8",
                      }}
                    >
                      {item.size} / {item.color}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    color="warning"
                    label={item.stock}
                    sx={{
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">
                All products are healthy
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Grid>
  </Grid>
</AdminShell>
    </AdminGuard>
  );
}