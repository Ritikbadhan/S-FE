"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  Fade,
  Grow,
  Paper,
  Avatar,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, useToast } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { addressesApi, createReturnApi, getAccountApi, getReturnsApi } from "@/lib/api";
import { WishlistContext } from "@/context/WishlistContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { key: "orders", label: "Orders", icon: <ReceiptLongOutlinedIcon /> },
  { key: "wishlist", label: "Wishlist", icon: <FavoriteBorderOutlinedIcon /> },
  { key: "addresses", label: "Addresses", icon: <PlaceOutlinedIcon /> },
  { key: "payments", label: "Payment Methods", icon: <CreditCardOutlinedIcon /> },
  { key: "profile", label: "Profile Details", icon: <PersonOutlineOutlinedIcon /> },
  { key: "returns", label: "Returns", icon: <AutorenewOutlinedIcon /> },
  { key: "logout", label: "Logout", icon: <LogoutOutlinedIcon /> },
];

const getOrderId = (order) => order?.id || order?._id || `ORD-${Math.random().toString(36).slice(2, 8)}`;
const getOrderRouteId = (order) => order?.id || order?._id || order?.orderId || "";
const getOrderDate = (order) => order?.date || order?.createdAt || new Date().toISOString();
const getOrderStatus = (order) => order?.status || "Processing";
const getOrderTotal = (order) => Number(order?.total || order?.totalAmount || 0);
const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);
const formatOrderAddress = (value) => {
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
const getAddressId = (address) => address?.id || address?._id || address?.addressId;
const currency = (value) => `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

const normalizeAddresses = (data) => {
  const root = data?.addresses || data?.data || data;
  const list = Array.isArray(root) ? root : [];
  return list.map((address, index) => ({
    id: getAddressId(address) || `addr-${index + 1}`,
    name: address?.name || address?.fullName || "Address",
    line1: address?.line1 || address?.addressLine1 || address?.street || "",
    line2: address?.line2 || address?.addressLine2 || address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || address?.postalCode || "",
    phone: address?.phone || "",
    landmark: address?.landmark || "",
    instructions: address?.instructions || address?.deliveryInstructions || "",
    isDefault: Boolean(address?.isDefault || address?.default),
  }));
};

const normalizePaymentMethods = (data) => {
  const root = data?.paymentMethods || data?.data || data;
  const list = Array.isArray(root) ? root : [];
  return list.map((method, index) => ({
    id: method?.id || method?._id || `pm-${index + 1}`,
    label: method?.label || method?.provider || method?.type || "Payment Method",
    type: method?.type || method?.method || "Card",
    masked: method?.maskedNumber || method?.masked || method?.value || "",
  }));
};

const normalizeRewards = (data) => {
  const root = data?.rewards || data?.data || data || {};
  return {
    points: Number(root?.points || 0),
    tier: root?.tier || "Member",
  };
};

const normalizeReturns = (data) => {
  const root = data?.returns || data?.data || data;
  const list = Array.isArray(root) ? root : [];
  return list.map((entry, index) => ({
    id: entry?.id || entry?._id || `ret-${index + 1}`,
    orderId: entry?.orderId || entry?.order?.id || "-",
    productId: entry?.productId || entry?.product?.id || "",
    name: entry?.name || entry?.productName || entry?.product?.name || "Item",
    size: entry?.size || entry?.variant?.size || "N/A",
    color: entry?.color || entry?.variant?.color || "N/A",
    status: entry?.status || "Requested",
    reason: entry?.reason || "",
    comment: entry?.comment || "",
    image: entry?.image || "",
  }));
};

const createEmptyAddressForm = () => ({
  id: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  landmark: "",
  instructions: "",
});

export default function AccountPage() {
  const router = useRouter();
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { wishlist } = useContext(WishlistContext);
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState("");

  const [addressForm, setAddressForm] = useState(createEmptyAddressForm);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [couponData, setCouponData] = useState({ points: 0, tier: "Member" });
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadAccountData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const [account, returnsData] = await Promise.all([
          getAccountApi(),
          getReturnsApi().catch(() => []),
        ]);

        if (!active) return;
        const profile = account?.profile?.user || account?.profile?.data || account?.profile || account?.user || null;
        const orderList = account?.orders?.orders || account?.orders?.data || account?.orders || [];
        const addressList = normalizeAddresses(account?.addresses || []);
        const fallbackAddresses = addressList.length
          ? addressList
          : normalizeAddresses(await addressesApi.list().catch(() => []));
        const returnList = normalizeReturns(account?.returns || returnsData);

        setUser(profile);
        setOrders(Array.isArray(orderList) ? orderList : []);
        setAddresses(fallbackAddresses);
        setPaymentMethods(normalizePaymentMethods(account?.paymentMethods || []));
        setCouponData(normalizeRewards(account?.rewards || {}));
        setReturns(returnList);
      } catch (err) {
        if (!active) return;
        toast.error(err.message || "Failed to load account details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccountData();
    return () => {
      active = false;
    };
  }, [isAuthenticated, toast]);

  useEffect(() => {
    if (returns.length) return;
    const returnCandidates = orders
      .filter((order) => ["Delivered", "Shipped", "Processing", "On the Way"].includes(getOrderStatus(order)))
      .flatMap((order) =>
        getOrderItems(order).map((item, index) => ({
          id: `${getOrderId(order)}-${index + 1}`,
          orderId: getOrderId(order),
          productId: item?.productId || item?.id || "",
          name: item?.name || item?.productName || item?.product?.name || "Item",
          size: item?.size || item?.variant?.size || "N/A",
          color: item?.color || item?.variant?.color || "N/A",
          status: "Eligible",
          reason: "",
          image: "",
        }))
      );
    setReturns(returnCandidates);
  }, [orders, returns.length]);

  const ordersPlaced = orders.length;
  const wishlistItems = wishlist.length;
  const savedAddresses = addresses.length;
  const lastOrder = orders[0] || null;
  const recentOrders = orders.slice(0, 3);
  const recentAddresses = addresses.slice(0, 2);
  const recentReturns = returns.slice(0, 3);

  const panelCardSx = {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: { xs: 2, sm: 2.5 },
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.palette.brand?.shadowCard || "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: theme.palette.brand?.shadowCardStrong || "0 4px 16px rgba(0,0,0,0.1)",
      borderColor: theme.palette.primary.light + "40",
    },
  };

  const statCardSx = {
    border: "none",
    borderRadius: { xs: 2, sm: 2.5 },
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
    boxShadow: theme.palette.brand?.shadowCard || "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: theme.palette.brand?.shadowCardStrong || "0 6px 20px rgba(0,0,0,0.12)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: -30,
      right: -30,
      width: "120px",
      height: "120px",
      background: `radial-gradient(circle, ${theme.palette.primary.light}15, transparent)`,
      borderRadius: "50%",
    },
  };

  const handleLogoutTab = async () => {
    await logout();
    router.push("/");
  };

  const onTabClick = async (tab) => {
    if (tab === "logout") {
      setLogoutDialogOpen(true);
      return;
    }
    setActiveTab(tab);
    if (isMobile) setMobileDrawerOpen(false);
  };
  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await logout();
    router.push("/");
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const saveAddress = async () => {
    const payload = { ...addressForm };
    if (!payload.name || !payload.line1 || !payload.city || !payload.pincode || !payload.phone) {
      toast.info("Fill required address fields.");
      return;
    }

    try {
      if (payload.id) {
        await addressesApi.update(payload.id, payload);
        setAddresses((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
        toast.success("Address updated.");
      } else {
        const created = await addressesApi.create(payload);
        const normalized = normalizeAddresses(created);
        if (normalized.length) {
          setAddresses((prev) => [...prev, normalized[0]]);
        } else {
          setAddresses((prev) => [...prev, { ...payload, id: `addr-${Date.now()}` }]);
        }
        toast.success("Address added.");
      }
    } catch (err) {
      if (payload.id) {
        setAddresses((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
      } else {
        setAddresses((prev) => [...prev, { ...payload, id: `addr-${Date.now()}` }]);
      }
      toast.info("Saved locally. Address API not available.");
    } finally {
      setAddressForm(createEmptyAddressForm());
      setShowAddressForm(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await addressesApi.remove(id);
    } catch (err) {
      // Fallback to local delete.
    }
    setAddresses((prev) => prev.filter((address) => address.id !== id));
    toast.info("Address removed.");
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((address) => ({ ...address, isDefault: address.id === id }))
    );
    toast.success("Default address set.");
  };

  const startAddAddress = () => {
    setAddressForm(createEmptyAddressForm());
    setShowAddressForm(true);
  };

  const startEditAddress = (address) => {
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setAddressForm(createEmptyAddressForm());
    setShowAddressForm(false);
  };

  const requestReturn = (returnId, reason) => {
    if (!reason) {
      toast.info("Select a reason for return.");
      return;
    }
    const target = returns.find((entry) => entry.id === returnId);
    if (!target) return;

    createReturnApi({
      orderId: target.orderId || undefined,
      productId: target.productId || undefined,
      reason,
      comment: target.comment || "",
    })
      .then(() => {
        setReturns((prev) =>
          prev.map((entry) =>
            entry.id === returnId ? { ...entry, status: "Requested", reason } : entry
          )
        );
        toast.success("Return request submitted.");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to submit return request.");
      });
  };

  const updateReturnImage = (returnId, file) => {
    setReturns((prev) =>
      prev.map((entry) =>
        entry.id === returnId ? { ...entry, image: file?.name || "" } : entry
      )
    );
  };

  // Sidebar Content Component
  const SidebarContent = () => (
    <Box sx={{ height: "100%" }}>
      {/* User Profile Section */}
      <Box sx={{ 
        p: { xs: 2, sm: 2.5 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}08)`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: "0.938rem", sm: "1rem" },
                mb: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "User"}
            </Typography>
            <Typography 
              sx={{ 
                opacity: 0.7,
                fontSize: { xs: "0.75rem", sm: "0.813rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation Tabs */}
      <List sx={{ py: { xs: 1, sm: 1.5 }, px: 1 }}>
        {TABS.map((tab) => (
          <ListItemButton
            key={tab.key}
            selected={activeTab === tab.key}
            onClick={() => onTabClick(tab.key)}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              mb: 0.5,
              py: { xs: 1, sm: 1.2 },
              px: { xs: 1.5, sm: 2 },
              backgroundColor: activeTab === tab.key ? `${theme.palette.primary.main}15` : "transparent",
              borderLeft: activeTab === tab.key ? `3px solid ${theme.palette.primary.main}` : "3px solid transparent",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: activeTab === tab.key ? `${theme.palette.primary.main}20` : theme.palette.action.hover,
                transform: "translateX(4px)",
              },
              ...(tab.key === "logout" && {
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: `${theme.palette.error.main}10`,
                },
              }),
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: { xs: 36, sm: 40 },
                color: activeTab === tab.key ? theme.palette.primary.main : "inherit",
                ...(tab.key === "logout" && {
                  color: theme.palette.error.main,
                }),
              }}
            >
              {tab.icon}
            </ListItemIcon>
            <ListItemText 
              primary={tab.label} 
              sx={{ 
                "& .MuiTypography-root": { 
                  fontSize: { xs: "0.875rem", sm: "0.938rem" },
                  fontWeight: activeTab === tab.key ? 600 : 500,
                } 
              }} 
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  if (isLoading || loading) {
    return (
      <Container sx={{ py: { xs: 6, sm: 8, md: 10 }, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading your account...
        </Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              borderRadius: { xs: 2.5, sm: 3 },
              border: `1px solid ${theme.palette.divider}`,
              textAlign: "center",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
              My Account
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.75, fontSize: { xs: "0.938rem", sm: "1rem" } }}>
              Please sign in to view your account details and manage your orders.
            </Typography>
            <AppButton component={Link} href="/login" size="large">
              Go to Login
            </AppButton>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Mobile Header */}
        {isMobile && (
          <Fade in timeout={300}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: { xs: 2, sm: 2.5 },
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                My Account
              </Typography>
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "rotate(90deg)",
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Paper>
          </Fade>
        )}

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Fade in timeout={400}>
                <Card 
                  sx={{ 
                    ...panelCardSx, 
                    position: "sticky", 
                    top: { md: 24 },
                    maxHeight: "calc(100vh - 48px)",
                    overflow: "auto",
                  }}
                >
                  <SidebarContent />
                </Card>
              </Fade>
            </Grid>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: "85%", sm: 320 },
                maxWidth: "100%",
                borderRadius: "0 16px 16px 0",
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <IconButton
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <SidebarContent />
          </Drawer>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Fade in timeout={500}>
              <Box>
                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <Stack spacing={{ xs: 2.5, sm: 3 }}>
                    {/* Welcome Section */}
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          mb: 0.5, 
                          fontWeight: 700,
                          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                          background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Welcome back, {user?.name || "Member"}!
                      </Typography>
                      <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.875rem", sm: "0.938rem" } }}>
                        Last order: {lastOrder ? new Date(getOrderDate(lastOrder)).toLocaleDateString("en-IN") : "No orders yet"}
                      </Typography>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                      {[
                        { label: "Orders Placed", value: ordersPlaced, icon: <ShoppingBagOutlinedIcon />, color: theme.palette.primary.main },
                        { label: "Wishlist Items", value: wishlistItems, icon: <FavoriteBorderOutlinedIcon />, color: theme.palette.error.main },
                        { label: "Saved Addresses", value: savedAddresses, icon: <PlaceOutlinedIcon />, color: theme.palette.success.main },
                        { label: "Reward Points", value: couponData.points, icon: <CardGiftcardOutlinedIcon />, color: theme.palette.warning.main },
                      ].map((stat, index) => (
                        <Grid item xs={6} sm={6} md={3} key={stat.label}>
                          <Grow in timeout={500 + index * 100}>
                            <Card sx={statCardSx}>
                              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                  <Box sx={{ position: "relative", zIndex: 1 }}>
                                    <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.813rem" }, mb: { xs: 0.8, sm: 1 }, fontWeight: 500 }}>
                                      {stat.label}
                                    </Typography>
                                    <Typography 
                                      variant="h4" 
                                      sx={{ 
                                        fontWeight: 700,
                                        fontSize: { xs: "1.75rem", sm: "2rem" },
                                        color: stat.color,
                                      }}
                                    >
                                      {stat.value}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      opacity: 0.2,
                                      color: stat.color,
                                      "& svg": {
                                        fontSize: { xs: 32, sm: 36 },
                                      },
                                    }}
                                  >
                                    {stat.icon}
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Loyalty & Rewards Card */}
                    {/* <Grow in timeout={700}>
                      <Card 
                        sx={{ 
                          ...panelCardSx, 
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 100%)`,
                          border: `1px solid ${theme.palette.primary.main}40`,
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  mb: 1.5, 
                                  fontWeight: 700,
                                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                ⭐ Loyalty & Rewards
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.813rem" }, mb: 0.5 }}>Tier Status</Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.125rem" } }}>{couponData.tier}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.813rem" }, mb: 0.5 }}>Points Earned</Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.125rem" }, color: theme.palette.primary.main }}>{couponData.points}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Chip 
                                size="medium" 
                                color="primary" 
                                icon={<TrendingUpIcon />}
                                label="Priority Access" 
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: "0.813rem", sm: "0.875rem" },
                                  px: { xs: 1, sm: 1.5 },
                                }} 
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grow> */}
                  </Stack>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                        Your Orders
                      </Typography>
                      <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                        Showing latest {recentOrders.length} order(s)
                      </Typography>
                    </Box>
                    
                    {recentOrders.map((order, index) => {
                      const oid = getOrderId(order);
                      const routeOrderId = getOrderRouteId(order);
                      const isOpen = expandedOrder === oid;
                      
                      return (
                        <Grow in timeout={400 + index * 100} key={oid}>
                          <Card sx={panelCardSx}>
                            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={{ xs: 2, sm: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" }, mb: 0.5 }}>
                                    Order ID: {oid}
                                  </Typography>
                                  <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                                    Date: {new Date(getOrderDate(order)).toLocaleDateString("en-IN")}
                                  </Typography>
                                  <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.813rem", sm: "0.875rem" }, fontWeight: 600, color: theme.palette.success.main }}>
                                    Total: {currency(getOrderTotal(order))}
                                  </Typography>
                                </Box>
                                <Stack direction={{ xs: "row", sm: "row" }} spacing={1} alignItems="flex-start" flexWrap="wrap">
                                  <Chip 
                                    label={getOrderStatus(order)} 
                                    color={getOrderStatus(order) === "Delivered" ? "success" : "warning"}
                                    sx={{ 
                                      fontWeight: 600,
                                      fontSize: { xs: "0.75rem", sm: "0.813rem" },
                                    }}
                                  />
                                  <AppButton variant="outlined" size="small" onClick={() => setExpandedOrder(isOpen ? "" : oid)}>
                                    {isOpen ? "Hide" : "Details"}
                                  </AppButton>
                                  <AppButton
                                    size="small"
                                    onClick={() => {
                                      if (!routeOrderId) {
                                        toast.info("Tracking not available.");
                                        return;
                                      }
                                      router.push(`/track-order/${routeOrderId}`);
                                    }}
                                  >
                                    Track
                                  </AppButton>
                                </Stack>
                              </Stack>
                              
                              {isOpen && (
                                <Fade in timeout={300}>
                                  <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography sx={{ mb: 1.5, fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" } }}>
                                      Products Purchased
                                    </Typography>
                                    {getOrderItems(order).map((item, idx) => (
                                      <Typography key={`${oid}-${idx}`} sx={{ opacity: 0.8, mb: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                                        • {item?.name || item?.productName || item?.product?.name || "Item"} | 
                                        Size: {item?.size || item?.variant?.size || "N/A"} | 
                                        Color: {item?.color || item?.variant?.color || "N/A"} | 
                                        Qty: {item?.qty || item?.quantity || 1}
                                      </Typography>
                                    ))}
                                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                                      <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" }, mb: 1 }}>
                                        <strong>Delivery Address:</strong> {formatOrderAddress(order?.shippingAddress || order?.address)}
                                      </Typography>
                                      <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                                        <strong>Payment Method:</strong> {order?.paymentMethod || "Online Payment"}
                                      </Typography>
                                    </Box>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                                      <AppButton variant="outlined" size="small" onClick={() => toast.info("Invoice download coming soon.")}>
                                        Download Invoice
                                      </AppButton>
                                      <AppButton variant="outlined" size="small" onClick={() => setActiveTab("returns")}>
                                        Request Return
                                      </AppButton>
                                    </Stack>
                                  </Box>
                                </Fade>
                              )}
                            </CardContent>
                          </Card>
                        </Grow>
                      );
                    })}
                  </Stack>
                )}

                {/* Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <Grow in timeout={400}>
                    <Card sx={panelCardSx}>
                      <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
                        <Box sx={{ mb: 3 }}>
                          <FavoriteBorderOutlinedIcon sx={{ fontSize: { xs: 48, sm: 64 }, opacity: 0.3, mb: 2, color: theme.palette.error.main }} />
                          <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                            ❤️ Your Wishlist
                          </Typography>
                          <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.875rem", sm: "0.938rem" }, mb: 0.5 }}>
                            You have <strong style={{ color: theme.palette.primary.main }}>{wishlistItems}</strong> saved item(s).
                          </Typography>
                          <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                            Continue where you left off and complete your purchase.
                          </Typography>
                        </Box>
                        <AppButton component={Link} href="/wishlist" size="large">
                          View Wishlist
                        </AppButton>
                      </CardContent>
                    </Card>
                  </Grow>
                )}
                

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "stretch", sm: "center" }}
                      spacing={1.5}
                    >
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                          Your Addresses
                        </Typography>
                        <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                          Manage your shipping and delivery addresses
                        </Typography>
                      </Box>
                      <AppButton onClick={startAddAddress} fullWidth={isSmallMobile}>
                        Add Address
                      </AppButton>
                    </Stack>

                    {showAddressForm && (
                        <Card sx={panelCardSx}>
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: "1rem", sm: "1.125rem" } }}>
                              {addressForm.id ? "Edit Address" : "Add New Address"}
                            </Typography>
                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <AppInput 
                                  label="Name" 
                                  value={addressForm.name} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <AppInput 
                                  label="Phone" 
                                  value={addressForm.phone} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <AppInput 
                                  label="Address Line 1" 
                                  value={addressForm.line1} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <AppInput 
                                  label="Address Line 2" 
                                  value={addressForm.line2} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <AppInput 
                                  label="City" 
                                  value={addressForm.city} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <AppInput 
                                  label="State" 
                                  value={addressForm.state} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <AppInput 
                                  label="Pincode" 
                                  value={addressForm.pincode} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <AppInput 
                                  label="Landmark" 
                                  value={addressForm.landmark} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <AppInput 
                                  label="Delivery Instructions" 
                                  value={addressForm.instructions} 
                                  onChange={(e) => setAddressForm((p) => ({ ...p, instructions: e.target.value }))}
                                  fullWidth
                                />
                              </Grid>
                            </Grid>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2.5 }}>
                              <AppButton onClick={saveAddress} fullWidth={isSmallMobile}>
                                {addressForm.id ? "Update Address" : "Add Address"}
                              </AppButton>
                              <AppButton
                                variant="outlined"
                                onClick={cancelAddressForm}
                                fullWidth={isSmallMobile}
                              >
                                {addressForm.id ? "Cancel Edit" : "Cancel"}
                              </AppButton>
                            </Stack>
                          </CardContent>
                        </Card>
                    )}

                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.875rem", sm: "0.938rem" }, fontWeight: 600 }}>
                        Saved Addresses ({addresses.length})
                      </Typography>
                      {addresses.length ? (
                        addresses.map((address, index) => (
                            <Grow in timeout={400 + index * 100} key={address.id}>
                              <Card sx={panelCardSx}>
                                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={{ xs: 1.5, sm: 1 }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Stack direction="row" spacing={1} sx={{ mb: 0.8, flexWrap: "wrap" }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" } }}>
                                          {address.name}
                                        </Typography>
                                        {address.isDefault && (
                                          <Chip size="small" color="secondary" label="Default" sx={{ height: 20 }} />
                                        )}
                                      </Stack>
                                      <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" }, mb: 0.3 }}>
                                        {address.line1} {address.line2}
                                      </Typography>
                                      <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" }, mb: 0.3 }}>
                                        {address.city}, {address.state} - {address.pincode}
                                      </Typography>
                                      <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                                        Phone: {address.phone}
                                      </Typography>
                                      {address.landmark && (
                                        <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.813rem" }, mt: 0.5 }}>
                                          Landmark: {address.landmark}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Stack direction="row" spacing={0.5} sx={{ alignSelf: "flex-start" }}>
                                      <IconButton 
                                        size="small"
                                        onClick={() => startEditAddress(address)}
                                        sx={{
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                            color: theme.palette.primary.main,
                                            transform: "scale(1.1)",
                                          },
                                        }}
                                      >
                                        <EditOutlinedIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton 
                                        size="small"
                                        onClick={() => deleteAddress(address.id)}
                                        sx={{
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                            color: theme.palette.error.main,
                                            transform: "scale(1.1)",
                                          },
                                        }}
                                      >
                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                      </IconButton>
                                      {!address.isDefault && (
                                        <AppButton size="small" variant="outlined" onClick={() => setDefaultAddress(address.id)}>
                                          Set Default
                                        </AppButton>
                                      )}
                                    </Stack>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grow>
                          ))
                      ) : (
                        <Card sx={panelCardSx}>
                          <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
                            <PlaceOutlinedIcon sx={{ fontSize: { xs: 48, sm: 60 }, opacity: 0.28, mb: 1.5 }} />
                            <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
                              No saved addresses yet
                            </Typography>
                            <Typography sx={{ opacity: 0.72, mb: 2, fontSize: { xs: "0.875rem", sm: "0.938rem" } }}>
                              Add your first delivery address to make checkout faster.
                            </Typography>
                            <AppButton onClick={startAddAddress}>Add Address</AppButton>
                          </CardContent>
                        </Card>
                      )}
                    </Stack>
                  </Stack>
                )}

                {/* Payment Methods Tab */}
                {activeTab === "payments" && (
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                        Payment Methods
                      </Typography>
                      <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                        Manage your saved payment options
                      </Typography>
                    </Box>
                    {paymentMethods.length ? (
                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        {paymentMethods.map((method, index) => (
                          <Grid item xs={12} sm={6} md={4} key={method.id}>
                            <Grow in timeout={400 + index * 100}>
                              <Card sx={panelCardSx}>
                                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                      <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" }, mb: 0.5 }}>
                                        {method.label}
                                      </Typography>
                                      <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                                        {method.type}{method.masked ? ` • ${method.masked}` : ""}
                                      </Typography>
                                    </Box>
                                    <CreditCardOutlinedIcon sx={{ opacity: 0.3, fontSize: 32 }} />
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grow>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Grow in timeout={400}>
                        <Card sx={panelCardSx}>
                          <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
                            <CreditCardOutlinedIcon sx={{ fontSize: { xs: 48, sm: 64 }, opacity: 0.3, mb: 2 }} />
                            <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.875rem", sm: "0.938rem" } }}>
                              No saved payment methods yet.
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grow>
                    )}
                  </Stack>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <Grow in timeout={400}>
                    <Card sx={panelCardSx}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                          Profile Details
                        </Typography>
                        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                          {[
                            { label: "Name", value: user?.name || "-" },
                            { label: "Email", value: user?.email || "-" },
                            { label: "Phone", value: user?.phone || "-" },
                            { label: "Gender", value: user?.gender ? String(user.gender).charAt(0).toUpperCase() + String(user.gender).slice(1) : "-" },
                          ].map((field, index) => (
                            <Grid item xs={12} sm={6} key={field.label}>
                              <Grow in timeout={400 + index * 80}>
                                <Box 
                                  sx={{ 
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.action.hover,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      bgcolor: theme.palette.action.selected,
                                      transform: "translateY(-2px)",
                                    },
                                  }}
                                >
                                  <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.813rem" }, mb: 0.5, fontWeight: 500 }}>
                                    {field.label}
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" } }}>
                                    {field.value}
                                  </Typography>
                                </Box>
                              </Grow>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grow>
                )}

                {/* Returns Tab */}
                {activeTab === "returns" && (
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                        Returns & Exchanges
                      </Typography>
                      <Typography sx={{ opacity: 0.65, fontSize: { xs: "0.813rem", sm: "0.875rem" } }}>
                        Showing latest {recentReturns.length} item(s)
                      </Typography>
                    </Box>
                    {recentReturns.map((entry, index) => (
                      <Grow in timeout={400 + index * 100} key={entry.id}>
                        <Card sx={panelCardSx}>
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.938rem", sm: "1rem" }, mb: 0.5 }}>
                              {entry.name}
                            </Typography>
                            <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.813rem", sm: "0.875rem" }, mb: 1.5 }}>
                              Order: {entry.orderId} | Size: {entry.size} | Color: {entry.color}
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                              <AppInput
                                select
                                size="small"
                                label="Reason"
                                value={entry.reason || ""}
                                onChange={(e) =>
                                  setReturns((prev) =>
                                    prev.map((item) =>
                                      item.id === entry.id ? { ...item, reason: e.target.value } : item
                                    )
                                  )
                                }
                                sx={{ minWidth: { xs: "100%", sm: 200 } }}
                              >
                                <MenuItem value="">Select reason</MenuItem>
                                <MenuItem value="size-issue">Size issue</MenuItem>
                                <MenuItem value="quality-issue">Quality issue</MenuItem>
                                <MenuItem value="wrong-item">Wrong item received</MenuItem>
                              </AppInput>
                              <AppButton component="label" variant="outlined" size="small">
                                Upload Image
                                <input
                                  hidden
                                  type="file"
                                  onChange={(e) => updateReturnImage(entry.id, e.target.files?.[0])}
                                />
                              </AppButton>
                              <AppButton size="small" onClick={() => requestReturn(entry.id, entry.reason)}>
                                Request Return
                              </AppButton>
                              <Chip 
                                size="small" 
                                color={entry.status === "Requested" ? "warning" : "success"} 
                                label={entry.status}
                                sx={{ fontWeight: 600 }}
                              />
                            </Stack>
                            {entry.image && (
                              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.813rem" }, opacity: 0.7, mt: 1 }}>
                                Uploaded: {entry.image}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grow>
                    ))}
                  </Stack>
                )}
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
      <Dialog
  open={logoutDialogOpen}
  onClose={handleCancelLogout}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle sx={{ fontWeight: 700 }}>
    Confirm Logout
  </DialogTitle>

  <DialogContent>
    <DialogContentText>
      Are you sure you want to logout from your account?
    </DialogContentText>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <AppButton variant="outlined" onClick={handleCancelLogout}>
      Cancel
    </AppButton>
    <AppButton color="error" onClick={handleConfirmLogout}>
      Logout
    </AppButton>
  </DialogActions>
</Dialog>
    </Box>
  );
}
