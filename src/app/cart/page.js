"use client";

import Link from "next/link";
import { useContext, useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Radio,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CartContext } from "@/context/CartContext";
import { WishlistContext } from "@/context/WishlistContext";
import { AppButton, AppInput, useToast } from "@/components/common";

const FREE_SHIPPING_THRESHOLD = 1999;
const GST_RATE = 0.12;
const STANDARD_SHIPPING = 120;

const getProductId = (item) => item?.id || item?._id || item?.productId;
const currency = (value) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;

const getOriginalPrice = (item) => {
  const original = Number(item?.originalPrice || 0);
  if (original > Number(item?.price || 0)) return original;
  return Number(item?.price || 0);
};

const getItemSize = (item) => item?.size || item?.variant?.size || "Free Size";
const getItemColor = (item) => item?.color || item?.variant?.color || "Default";
const getItemCategory = (item) => item?.category || "General";
const getItemCollection = (item) => item?.collection || "";
const getItemDescription = (item) =>
  item?.description || "Refined essential crafted for modern everyday wear.";

const estimatedDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CartPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const toast = useToast();
  const { cart, removeFromCart, updateCartQuantity } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const [couponCode, setCouponCode] = useState("");
  const [couponValue, setCouponValue] = useState(0);
  const [couponLabel, setCouponLabel] = useState("");
  const [openAddressPopup, setOpenAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Form states for add/edit address
  const [addressForm, setAddressForm] = useState({
    name: "",
    mobile: "",
    pinCode: "",
    houseNumber: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const savedAddresses = localStorage.getItem("addresses");
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      if (parsed.length > 0 && !selectedAddress) {
        setSelectedAddress(parsed[0]);
      }
    }
  }, []);

  const handleOpenAddressPopup = () => {
    setOpenAddressPopup(true);
  };

  const handleCloseAddressPopup = () => {
    setOpenAddressPopup(false);
  };

  const [openEditAddressPopup, setOpenEditAddressPopup] = useState(false);

  const handleOpenEditPopup = () => {
    setOpenEditAddressPopup(true);
  };

  const handleCloseEditPopup = () => {
    setOpenEditAddressPopup(false);
    setAddressForm({
      name: "",
      mobile: "",
      pinCode: "",
      houseNumber: "",
      address: "",
      city: "",
      state: "",
    });
  };

  const handleSaveAddress = () => {
    const newAddress = {
      id: Date.now().toString(),
      ...addressForm,
    };
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    localStorage.setItem("addresses", JSON.stringify(updatedAddresses));
    setSelectedAddress(newAddress);
    toast.success("Address saved successfully.");
    handleCloseEditPopup();
  };

  const itemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const compareSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + getOriginalPrice(item) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const productDiscount = Math.max(0, compareSubtotal - subtotal);
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : STANDARD_SHIPPING;
  const gst = Math.max(0, Math.round((subtotal - couponValue) * GST_RATE));
  const total = Math.max(0, subtotal - couponValue + shipping + gst);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.info("Enter a promo code first.");
      return;
    }

    if (code === "SHARQ10") {
      const amount = Math.round(subtotal * 0.1);
      setCouponValue(amount);
      setCouponLabel("SHARQ10 (10% OFF)");
      toast.success("Coupon applied.");
      return;
    }

    if (code === "WELCOME250") {
      const amount = Math.min(250, subtotal);
      setCouponValue(amount);
      setCouponLabel("WELCOME250 (Rs 250 OFF)");
      toast.success("Coupon applied.");
      return;
    }

    setCouponValue(0);
    setCouponLabel("");
    toast.error("Invalid coupon code.");
  };

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
      toast.info("Item removed from bag.");
    } catch (err) {
      toast.error(err.message || "Failed to remove item.");
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await addToWishlist(item);
      await removeFromCart(getProductId(item));
      toast.success("Moved to wishlist.");
    } catch (err) {
      toast.error(err.message || "Failed to move item.");
    }
  };

  const changeQuantity = async (item, delta) => {
    const current = Number(item.quantity || 1);
    const next = current + delta;

    // If quantity would go to 0 or below, remove the item instead.
    if (next <= 0) {
      await handleRemove(getProductId(item));
      return;
    }

    try {
      await updateCartQuantity(getProductId(item), next);
    } catch (err) {
      toast.error(err.message || "Failed to update quantity.");
    }
  };

  if (!cart.length) {
    return (
      <Container
        sx={{
          py: { xs: 6, md: 12 },
          textAlign: "center",
          minHeight: { xs: "58vh", md: "70vh" },
        }}
      >
        <Box
          sx={{
            mx: "auto",
            width: { xs: 92, md: 120 },
            height: { xs: 92, md: 120 },
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: (theme) => theme.palette.brand.borderSoft,
            mb: { xs: 2, md: 3 },
          }}
        >
          <ShoppingBagOutlinedIcon
            sx={{ fontSize: { xs: 42, md: 56 }, color: "primary.main" }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{ mb: 0.75, fontSize: { xs: "1.35rem", md: "2.125rem" } }}
        >
          Your bag is empty
        </Typography>
        <Typography
          sx={{
            opacity: 0.75,
            mb: { xs: 2, md: 3 },
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          Add pieces to start building your look.
        </Typography>
        <AppButton
          component={Link}
          href="/collection"
          sx={{ px: { xs: 2.25, md: 4 }, fontSize: { xs: "0.8rem", md: "0.875rem" } }}
        >
          Explore Collection
        </AppButton>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#1A2332" : "#fff",
        minHeight: "100vh",
        py: { xs: 2, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* LEFT SECTION */}
          <Grid item xs={12} lg={8}>
            {/* ADDRESS SECTION */}
            <Card
              sx={{
                border: "1px solid #e5e5e5",
                borderRadius: 1,
                boxShadow: "none",
                mb: 2,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1, sm: 2 },
                  py: { xs: 1.25, md: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box sx={{ pr: { xs: 0, sm: 2 } }}>
                  <Typography
                    fontWeight={600}
                    sx={{
                      mb: 0.5,
                      fontSize: { xs: "0.82rem", sm: "15px" },
                      lineHeight: 1.4,
                    }}
                  >
                    Deliver to:{" "}
                    {selectedAddress ? selectedAddress.name : "BHARTI PAWAR"},{" "}
                    {selectedAddress ? selectedAddress.pinCode : "121004"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: { xs: 1.45, sm: 1.6 },
                      fontSize: { xs: "0.74rem", sm: "0.875rem" },
                      maxWidth: "85%",
                    }}
                  >
                    {selectedAddress
                      ? `${selectedAddress.houseNumber}, ${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}`
                      : "2065, HOUSE, BALLABGARH FARIDABAD, Haryana"}
                  </Typography>
                </Box>

                <AppButton
                  variant="outlined"
                  onClick={handleOpenAddressPopup}
                  sx={{ fontSize: { xs: "0.74rem", sm: "0.875rem" }, py: { xs: 0.5, sm: 0.8 } }}
                >
                  CHANGE ADDRESS
                </AppButton>
              </CardContent>
            </Card>

            {/* OFFER SECTION */}
            <Card
              sx={{
                border: "1px solid #e5e5e5",
                borderRadius: 1,
                boxShadow: "none",
                mb: 3,
              }}
            >
              <CardContent>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  Available Offers
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 0.75, fontSize: { xs: "0.74rem", sm: "0.875rem" } }}
                >
                  7.5% Assured Cashback on minimum spend of ₹100
                </Typography>
              </CardContent>
            </Card>

            {/* CART ITEMS */}
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {cart.map((item) => {
                const itemPrice = Number(item.price || 0);
                const originalPrice = getOriginalPrice(item);

                const discountPercent =
                  originalPrice > itemPrice
                    ? Math.round(
                        ((originalPrice - itemPrice) / originalPrice) * 100
                      )
                    : 0;

                return (
                  <Card
                    key={getProductId(item)}
                    sx={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 1,
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
                      <Grid container spacing={{ xs: 1.25, sm: 2 }}>
                        {/* IMAGE */}
                        <Grid item xs={12} sm={3}>
                          <Box
                            component="img"
                            src={item.image || "/homepic.jpeg"}
                            alt={item.name}
                            sx={{
                              width: "100%",
                              height: { xs: 150, sm: 180 },
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        </Grid>

                        {/* DETAILS */}
                        <Grid item xs={12} sm={9}>
                          <Box display="flex" justifyContent="space-between">
                            <Box sx={{ width: "100%" }}>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: { xs: "0.95rem", sm: 18 },
                                }}
                              >
                                {item.brand || item.name}
                              </Typography>

                              <Typography
                                sx={{
                                  color: "text.secondary",
                                  mb: 0.75,
                                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{ mb: 0.75, fontSize: { xs: "0.74rem", sm: "0.875rem" } }}
                              >
                                Size: {getItemSize(item)} | Qty: {item.quantity}
                              </Typography>

                              {/* PRICE */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 0.75 }}
                              >
                                <Typography
                                  fontWeight={700}
                                  sx={{ fontSize: { xs: "0.88rem", sm: "1rem" } }}
                                >
                                  {currency(itemPrice)}
                                </Typography>

                                <Typography
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "gray",
                                    fontSize: { xs: "0.78rem", sm: "0.95rem" },
                                  }}
                                >
                                  {currency(originalPrice)}
                                </Typography>

                                {discountPercent > 0 && (
                                  <Typography
                                    sx={{
                                      color: "#ff3f6c",
                                      fontWeight: 600,
                                      fontSize: { xs: "0.74rem", sm: "0.875rem" },
                                    }}
                                  >
                                    {discountPercent}% OFF
                                  </Typography>
                                )}
                              </Stack>

                              {/* QUANTITY CONTROLS */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1.25 }}
                              >
                                <IconButton
                                  onClick={() => changeQuantity(item, -1)}
                                  sx={{
                                    border: "1px solid #ddd",
                                    borderRadius: 1,
                                    p: { xs: 0.6, sm: 1 },
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>

                                <Typography sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                                  {item.quantity}
                                </Typography>

                                <IconButton
                                  onClick={() => changeQuantity(item, 1)}
                                  sx={{
                                    border: "1px solid #ddd",
                                    borderRadius: 1,
                                    p: { xs: 0.6, sm: 1 },
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Stack>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  mb: 0.75,
                                  fontSize: { xs: "0.74rem", sm: "0.875rem" },
                                }}
                              >
                                Delivery by {estimatedDeliveryDate()}
                              </Typography>

                              {/* ACTION BUTTONS */}
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={0.8}
                                mt={0.8}
                              >
                                <AppButton
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleMoveToWishlist(item)}
                                  sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, py: { xs: 0.45, sm: 0.6 } }}
                                >
                                  MOVE TO WISHLIST
                                </AppButton>

                                <AppButton
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleRemove(getProductId(item))
                                  }
                                  sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, py: { xs: 0.45, sm: 0.6 } }}
                                >
                                  REMOVE
                                </AppButton>
                              </Stack>
                            </Box>

                            <IconButton
                              onClick={() => handleRemove(getProductId(item))}
                              sx={{ p: { xs: 0.6, sm: 1 } }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: { xs: 19, sm: 24 } }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Grid>

          {/* RIGHT SECTION */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                border: "1px solid #e5e5e5",
                borderRadius: 1,
                boxShadow: "none",
                position: { lg: "sticky" },
                top: 20,
              }}
            >
              <CardContent>
                <Typography
                  fontWeight={700}
                  mb={1.5}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  PRICE DETAILS ({itemCount} Items)
                </Typography>

                <Stack spacing={{ xs: 1, sm: 1.5 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      Total MRP
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      {currency(compareSubtotal)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      Discount on MRP
                    </Typography>
                    <Typography color="success.main" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      -{currency(productDiscount)}
                    </Typography>
                  </Box>

                  {couponValue > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                        Coupon Discount
                      </Typography>
                      <Typography color="success.main" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                        -{currency(couponValue)}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      Shipping
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      {shipping === 0 ? "Free" : currency(shipping)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      GST
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                      {currency(gst)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                      Total Amount
                    </Typography>
                    <Typography fontWeight={700} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                      {currency(total)}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 3 } }}>
                  <AppInput
                    size="small"
                    placeholder="Enter Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <AppButton onClick={handleApplyCoupon}>APPLY</AppButton>
                </Stack>

                {couponLabel && (
                  <Typography
                    sx={{
                      color: "success.main",
                      mt: 1,
                      fontSize: { xs: 12, sm: 14 },
                    }}
                  >
                    Applied: {couponLabel}
                  </Typography>
                )}

                <AppButton
                  fullWidth
                  sx={{
                    mt: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "0.82rem", sm: "0.875rem" },
                  }}
                  component={Link}
                  href="/checkout"
                >
                  PLACE ORDER
                </AppButton>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={openAddressPopup}
        onClose={handleCloseAddressPopup}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1rem", sm: "24px" },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Select Delivery Address
          <IconButton onClick={handleCloseAddressPopup}>✕</IconButton>
        </DialogTitle>

        <DialogContent>
          {/* PINCODE */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: { xs: 2, sm: 3 },
              mt: 1,
            }}
          >
            <AppInput fullWidth placeholder="Enter Pincode" />

            <AppButton variant="outlined">CHECK</AppButton>
          </Box>

          {/* SAVED ADDRESS HEADER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography fontWeight={700} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              SAVED ADDRESS
            </Typography>

            <Typography
              sx={{
                color: "#ff3f6c",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: { xs: "0.74rem", sm: "0.875rem" },
              }}
              onClick={handleOpenEditPopup}
            >
              + Add New Address
            </Typography>
          </Box>

          {/* SAVED ADDRESSES */}
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              sx={{
                border: "1px solid #e5e5e5",
                mb: 2,
                boxShadow: "none",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="flex-start">
                  <Radio
                    checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ fontSize: { xs: "0.82rem", sm: "1rem" } }}>
                      {addr.name}
                    </Typography>

                    <Typography variant="body2" sx={{ fontSize: { xs: "0.72rem", sm: "0.875rem" } }}>
                      {addr.houseNumber}, {addr.address}, {addr.city},{" "}
                      {addr.state} - {addr.pinCode}
                    </Typography>

                    <Typography sx={{ mt: 0.75, fontSize: { xs: "0.72rem", sm: "1rem" } }}>
                      Mobile: <b>{addr.mobile}</b>
                    </Typography>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={0.7}
                      sx={{ mt: 1.25 }}
                    >
                      <AppButton
                        size="small"
                        onClick={() => {
                          setSelectedAddress(addr);
                          handleCloseAddressPopup();
                          toast.success("Address selected.");
                        }}
                        sx={{ fontSize: { xs: "0.66rem", sm: "0.75rem" }, py: { xs: 0.45, sm: 0.6 } }}
                      >
                        DELIVER HERE
                      </AppButton>

                      <AppButton
                        variant="outlined"
                        size="small"
                        onClick={handleOpenEditPopup}
                        sx={{ fontSize: { xs: "0.66rem", sm: "0.75rem" }, py: { xs: 0.45, sm: 0.6 } }}
                      >
                        EDIT
                      </AppButton>

                      <AppButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          const updated = addresses.filter(
                            (a) => a.id !== addr.id
                          );
                          setAddresses(updated);
                          localStorage.setItem(
                            "addresses",
                            JSON.stringify(updated)
                          );
                          if (selectedAddress?.id === addr.id) {
                            setSelectedAddress(updated[0] || null);
                          }
                          toast.info("Address deleted.");
                        }}
                        sx={{ fontSize: { xs: "0.66rem", sm: "0.75rem" }, py: { xs: 0.45, sm: 0.6 } }}
                      >
                        DELETE
                      </AppButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog
        open={openEditAddressPopup}
        onClose={handleCloseEditPopup}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: { xs: "0.98rem", sm: "22px" },
          }}
        >
          ADD NEW ADDRESS
          <IconButton onClick={handleCloseEditPopup}>✕</IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 1.25, sm: 2 } }}>
            {/* CONTACT DETAILS */}
            <Typography fontWeight={700} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              CONTACT DETAILS
            </Typography>

            <AppInput
              fullWidth
              placeholder="Name*"
              value={addressForm.name}
              onChange={(e) =>
                setAddressForm({ ...addressForm, name: e.target.value })
              }
            />

            <AppInput
              fullWidth
              placeholder="Mobile No*"
              value={addressForm.mobile}
              onChange={(e) =>
                setAddressForm({ ...addressForm, mobile: e.target.value })
              }
            />

            {/* ADDRESS */}
            <Typography fontWeight={700} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              ADDRESS
            </Typography>

            <AppInput
              fullWidth
              placeholder="Pin Code*"
              value={addressForm.pinCode}
              onChange={(e) =>
                setAddressForm({ ...addressForm, pinCode: e.target.value })
              }
            />

            <AppInput
              fullWidth
              placeholder="House Number/Tower/Block*"
              value={addressForm.houseNumber}
              onChange={(e) =>
                setAddressForm({ ...addressForm, houseNumber: e.target.value })
              }
            />

            <Typography
              sx={{
                color: "#f5a623",
                fontSize: { xs: 12, sm: 14 },
                mt: -2,
              }}
            >
              *House Number will allow a doorstep delivery
            </Typography>

            <AppInput
              fullWidth
              placeholder="Address (locality, building, street)*"
              value={addressForm.address}
              onChange={(e) =>
                setAddressForm({ ...addressForm, address: e.target.value })
              }
            />

            <AppInput
              fullWidth
              placeholder="City*"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({ ...addressForm, city: e.target.value })
              }
            />

            <AppInput
              fullWidth
              placeholder="State*"
              value={addressForm.state}
              onChange={(e) =>
                setAddressForm({ ...addressForm, state: e.target.value })
              }
            />

            {/* BUTTONS */}
            <Stack direction="row" spacing={1.2} sx={{ mt: { xs: 1.25, sm: 2 } }}>
              <AppButton
                fullWidth
                variant="outlined"
                onClick={handleCloseEditPopup}
                sx={{ fontSize: { xs: "0.78rem", sm: "0.875rem" }, py: { xs: 0.55, sm: 0.8 } }}
              >
                Cancel
              </AppButton>

              <AppButton
                fullWidth
                onClick={handleSaveAddress}
                sx={{
                  bgcolor: "#ff3f6c",
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
                  py: { xs: 0.55, sm: 0.8 },
                  "&:hover": {
                    bgcolor: "#ff3f6c",
                  },
                }}
              >
                Save
              </AppButton>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
