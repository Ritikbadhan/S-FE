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
        {error && (
          <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 2.5 } }}>
            {error}
          </Alert>
        )}

        <Box sx={{
          display: 'flex', 
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, sm: 4, md: 5 }, 
          width: "100%"
        }}>
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
              <Grid item xs={6} sm={6} md={6}>
                <StatCard
                  label="Revenue"
                  value={currency(summary.revenue)}
                  icon={<AttachMoneyIcon/>}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <StatCard
                  label="Orders"
                  value={summary.orders}
                  icon={<ShoppingCartIcon />}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <StatCard
                  label="Products"
                  value={summary.products}
                  icon={<InventoryIcon />}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <StatCard
                  label="Users"
                  value={summary.users}
                  icon={<PeopleIcon />}
                />
              </Grid>
            </Grid>

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {/* ORDER STATUS */}
              <Grid item xs={12} md={12}>
                <Paper sx={{ 
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: { xs: 2.5, sm: 3 },
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    borderColor: theme.palette.primary.light,
                  },
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: { xs: 2, sm: 2.5 },
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::before": {
                      content: '""',
                      width: 4,
                      height: 24,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      borderRadius: 2,
                    },
                  }}>
                    Order Status
                  </Typography>

                  {orderStatus.length ? (
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      {orderStatus.map((item) => (
                        <Stack
                          key={item._id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            background: theme.palette.action.hover,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateX(8px)",
                              background: theme.palette.action.selected,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            },
                          }}
                        >
                          <Typography sx={{
                            fontSize: { xs: "0.875rem", sm: "0.938rem" },
                            fontWeight: 500,
                          }}>
                            {item._id}
                          </Typography>
                          <Chip 
                            label={item.count} 
                            size="small"
                            color={statusColor(item._id)}
                            sx={{
                              fontWeight: 600,
                              minWidth: 45,
                              fontSize: { xs: "0.75rem", sm: "0.813rem" },
                            }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ 
                      opacity: 0.7,
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "0.938rem" },
                    }}>
                      No order data yet
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* LOW STOCK */}
              <Grid item xs={12} md={12}>
                <Paper sx={{ 
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: { xs: 2.5, sm: 3 },
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    borderColor: theme.palette.warning.light,
                  },
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: { xs: 2, sm: 2.5 },
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::before": {
                      content: '""',
                      width: 4,
                      height: 24,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                      borderRadius: 2,
                    },
                  }}>
                    Low Stock Products
                  </Typography>

                  {lowStock.length ? (
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      {lowStock.map((item) => (
                        <Stack
                          key={`${item._id}-${item.size}`}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            background: theme.palette.action.hover,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateX(8px)",
                              background: theme.palette.action.selected,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            },
                          }}
                        >
                          <Typography sx={{
                            fontSize: { xs: "0.813rem", sm: "0.875rem" },
                            fontWeight: 500,
                            flex: 1,
                            pr: 1,
                          }}>
                            {item.productName}
                            <Typography
                              component="span"
                              sx={{
                                fontSize: { xs: "0.688rem", sm: "0.75rem" },
                                opacity: 0.7,
                                ml: 0.5,
                              }}
                            >
                              ({item.size}/{item.color})
                            </Typography>
                          </Typography>

                          <Chip
                            size="small"
                            color="warning"
                            label={`Stock: ${item.stock}`}
                            sx={{
                              fontWeight: 600,
                              minWidth: { xs: 75, sm: 85 },
                              fontSize: { xs: "0.688rem", sm: "0.75rem" },
                            }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ 
                      opacity: 0.7,
                      textAlign: "center",
                      py: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "0.938rem" },
                    }}>
                      All products sufficiently stocked
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Grid item xs={12}>
              <Paper sx={{ 
                p: { xs: 2.5, sm: 3 },
                borderRadius: { xs: 2.5, sm: 3 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  borderColor: theme.palette.primary.light,
                },
              }}>
                <Typography variant="h6" sx={{ 
                  mb: { xs: 2, sm: 2.5 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&::before": {
                    content: '""',
                    width: 4,
                    height: 24,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    borderRadius: 2,
                  },
                }}>
                  Recent Orders
                </Typography>

                {recentOrders.length ? (
                  <TableContainer
                    sx={{
                      borderRadius: { xs: 1.5, sm: 2 },
                      border: `1px solid ${theme.palette.divider}`,
                      overflowX: "auto",
                      maxHeight: { md: 600 },
                      "&::-webkit-scrollbar": {
                        height: "8px",
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: theme.palette.action.hover,
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: theme.palette.primary.main,
                        borderRadius: "4px",
                        "&:hover": {
                          background: theme.palette.primary.dark,
                        },
                      },
                    }}
                  >
                    <Table size={isSmallMobile ? "small" : "medium"} sx={{ minWidth: { xs: 500, sm: 600 } }}>
                      <TableHead>
                        <TableRow sx={{ background: theme.palette.action.hover }}>
                          <TableCell sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.813rem", sm: "0.875rem" },
                            py: { xs: 1.5, sm: 2 },
                          }}>
                            Order ID
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.813rem", sm: "0.875rem" },
                            py: { xs: 1.5, sm: 2 },
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.813rem", sm: "0.875rem" },
                            py: { xs: 1.5, sm: 2 },
                          }}>
                            Date
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.813rem", sm: "0.875rem" },
                            py: { xs: 1.5, sm: 2 },
                          }}>
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
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                background: theme.palette.action.hover,
                              },
                              "&:last-child td": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell sx={{
                              fontSize: { xs: "0.75rem", sm: "0.813rem" },
                              fontFamily: "monospace",
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              py: { xs: 1.5, sm: 2 },
                            }}>
                              {isSmallMobile ? `${order._id.substring(0, 8)}...` : order._id}
                            </TableCell>

                            <TableCell sx={{ py: { xs: 1.5, sm: 2 } }}>
                              <Chip
                                size="small"
                                label={order.orderStatus}
                                color={statusColor(order.orderStatus)}
                                sx={{
                                  fontSize: { xs: "0.688rem", sm: "0.75rem" },
                                  fontWeight: 600,
                                  height: { xs: 22, sm: 24 },
                                }}
                              />
                            </TableCell>

                            <TableCell sx={{
                              fontSize: { xs: "0.75rem", sm: "0.813rem" },
                              color: theme.palette.text.secondary,
                              py: { xs: 1.5, sm: 2 },
                            }}>
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: isSmallMobile ? "2-digit" : "numeric",
                              })}
                            </TableCell>

                            <TableCell sx={{
                              fontSize: { xs: "0.813rem", sm: "0.875rem" },
                              fontWeight: 600,
                              py: { xs: 1.5, sm: 2 },
                            }}>
                              {currency(order.totalAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography sx={{ 
                    opacity: 0.7,
                    textAlign: "center",
                    py: { xs: 4, sm: 6 },
                    fontSize: { xs: "0.875rem", sm: "0.938rem" },
                  }}>
                    No recent orders
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Box>
        </Box>
      </AdminShell>
    </AdminGuard>
  );
}