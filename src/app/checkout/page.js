"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { AppButton, AppInput, useToast } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { CartContext } from "@/context/CartContext";
import { addressesApi, checkoutApi, ordersApi, paymentsApi } from "@/lib/api";

const CHECKOUT_STEPS = ["Address", "Payment Method", "Review", "Verification"];

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "UPI", label: "UPI" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "STRIPE", label: "Stripe" },
  { value: "WALLET", label: "Wallet" },
];

const DEFAULT_SHIPPING_OPTION = {
  id: "standard",
  name: "Standard Shipping",
  price: 0,
  eta: "3-5 business days",
};

const currency = (value) =>
  `Rs ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
const getAddressId = (address) =>
  address?.id || address?._id || address?.addressId;

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

const normalizeShippingOptions = (data) => {
  const root = data?.shippingOptions || data?.data || data;
  const list = Array.isArray(root) ? root : [];
  if (!list.length) return [DEFAULT_SHIPPING_OPTION];
  return list.map((option, index) => ({
    id: option?.id || option?._id || `ship-${index + 1}`,
    name: option?.name || option?.label || "Shipping",
    price: Number(option?.price ?? option?.amount ?? 0),
    eta: option?.eta || option?.estimatedDelivery || "",
  }));
};

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { cart, clearCart } = useContext(CartContext);

  const [activeStep, setActiveStep] = useState(0);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingOptions, setShippingOptions] = useState([
    DEFAULT_SHIPPING_OPTION,
  ]);
  const [selectedShippingId, setSelectedShippingId] = useState(
    DEFAULT_SHIPPING_OPTION.id
  );

  const [cartValidated, setCartValidated] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [signature, setSignature] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [addressForm, setAddressForm] = useState({
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

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const selectedShipping =
    shippingOptions.find((option) => option.id === selectedShippingId) ||
    shippingOptions[0];
  const shippingAmount = Number(selectedShipping?.price || 0);
  const rawDiscountAmount = Number(appliedCoupon?.discountAmount || 0);
  const discountAmount = Math.max(0, Math.min(subtotal, rawDiscountAmount));
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.max(0, Math.round(taxableSubtotal * 0.12));
  const total = taxableSubtotal + shippingAmount + taxAmount;

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) || null;
  const isOnlinePayment = paymentMethod !== "COD";

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.info("Enter coupon code.");
      return;
    }
    setIsActionLoading(true);
    try {
      const response = await ordersApi.validateCoupon({ code, subtotal });
      const root = response?.data || response;
      const isValid = Boolean(
        root?.valid ??
        root?.isValid ??
        root?.applicable ??
        root?.success ??
        Number(root?.discountAmount || root?.discount || root?.amount || 0) > 0
      );
      if (!isValid) {
        throw new Error(root?.message || "Coupon is not valid.");
      }
      const amount = Number(
        root?.discountAmount || root?.discount || root?.amount || 0
      );
      setAppliedCoupon({ code: code.toUpperCase(), discountAmount: amount });
      toast.success(root?.message || "Coupon applied.");
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.message || "Failed to apply coupon.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const goToStatus = (result, message, orderId = placedOrderId) => {
    const q = new URLSearchParams({
      result,
      message: message || "",
      orderId: orderId || "",
    });
    router.push(`/checkout/status?${q.toString()}`);
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!isAuthenticated) {
        if (active) setIsScreenLoading(false);
        return;
      }

      try {
        // const [addressResponse, shippingResponse] = await Promise.all([
        //   addressesApi.list().catch(() => []),
        //   checkoutApi
        //     .shippingOptions(subtotal)
        //     .catch(() => [DEFAULT_SHIPPING_OPTION]),
        // ]);
        const localAddresses = JSON.parse(
          localStorage.getItem("addresses") || "[]"
        );

        const [shippingResponse] = await Promise.all([
          checkoutApi
            .shippingOptions(subtotal)
            .catch(() => [DEFAULT_SHIPPING_OPTION]),
        ]);

        const normalizedAddresses = localAddresses.map((address, index) => ({
          id: address?.id || `addr-${index + 1}`,
          name: address?.name || "",
          line1: `${address?.houseNumber || ""}, ${address?.address || ""}`,
          line2: "",
          city: address?.city || "",
          state: address?.state || "",
          pincode: address?.pinCode || "",
          phone: address?.mobile || "",
          landmark: "",
          instructions: "",
          isDefault: index === 0,
        }));

        setAddresses(normalizedAddresses);

        if (normalizedAddresses[0]) {
          setSelectedAddressId(normalizedAddresses[0].id);
        }
        if (!active) return;

        // const normalizedAddresses = normalizeAddresses(addressResponse);
        // setAddresses(normalizedAddresses);
        // const defaultAddress = normalizedAddresses.find(
        //   (address) => address.isDefault
        // );
        // if (defaultAddress) {
        //   setSelectedAddressId(defaultAddress.id);
        // } else if (normalizedAddresses[0]) {
        //   setSelectedAddressId(normalizedAddresses[0].id);
        // }

        const normalizedShipping = normalizeShippingOptions(shippingResponse);
        setShippingOptions(normalizedShipping);
        if (normalizedShipping[0]) {
          setSelectedShippingId(normalizedShipping[0].id);
        }

        if (cart.length) {
          const payload = {
            items: cart.map((item) => ({
              productId: item.id,
              quantity: Number(item.quantity || 1),
              size: item.size || undefined,
              color: item.color || undefined,
            })),
          };
          await checkoutApi.validate(payload);
          if (active) setCartValidated(true);
        }
      } finally {
        if (active) setIsScreenLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [isAuthenticated, subtotal, cart]);

  const saveAddress = async () => {
    if (
      !addressForm.name ||
      !addressForm.line1 ||
      !addressForm.city ||
      !addressForm.pincode ||
      !addressForm.phone
    ) {
      toast.info("Please fill required address fields.");
      return;
    }

    try {
      const created = await addressesApi.create(addressForm);
      const normalized = normalizeAddresses(created);
      const nextAddress = normalized[0] || {
        ...addressForm,
        id: `addr-${Date.now()}`,
      };
      setAddresses((prev) => [...prev, nextAddress]);
      setSelectedAddressId(nextAddress.id);
      toast.success("Address saved.");
    } catch (err) {
      const localAddress = { ...addressForm, id: `addr-${Date.now()}` };
      setAddresses((prev) => [...prev, localAddress]);
      setSelectedAddressId(localAddress.id);
      toast.info("Address saved locally.");
    } finally {
      setAddressForm({
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
    }
  };

  const createOrder = async () => {
    if (!cartValidated) {
      toast.error("Cart is not valid anymore. Please review cart.");
      router.push("/cart");
      return;
    }
    if (!selectedAddress) {
      toast.info("Select address first.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity || 1),
          size: item.size || undefined,
          color: item.color || undefined,
        })),
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          line1: selectedAddress.line1,
          line2: selectedAddress.line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          landmark: selectedAddress.landmark,
          instructions: selectedAddress.instructions,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      };

      const orderResponse = await ordersApi.create(payload);
      const orderRoot =
        orderResponse?.order ||
        orderResponse?.data?.order ||
        orderResponse?.data ||
        orderResponse;
      const orderId =
        orderRoot?.id || orderRoot?._id || orderRoot?.orderId || "";

      if (!orderId) {
        throw new Error("Order id missing in create order response.");
      }

      setPlacedOrderId(orderId);

      if (isOnlinePayment) {
        await paymentsApi.create({
          orderId,
          paymentMethod,
        });
      }

      setActiveStep(3);
    } catch (err) {
      goToStatus("failed", err.message || "Order create failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!placedOrderId) {
      toast.error("Order not created yet.");
      return;
    }

    if (!isOnlinePayment) {
      try {
        await clearCart();
      } catch (err) {
        // no-op
      }
      goToStatus("success", "Order confirmed.", placedOrderId);
      return;
    }

    if (!paymentId || !signature) {
      toast.info("Payment ID and signature are required.");
      return;
    }

    setIsActionLoading(true);
    try {
      await paymentsApi.verify({
        orderId: placedOrderId,
        paymentId,
        signature,
      });
      try {
        await clearCart();
      } catch (err) {
        // no-op
      }
      goToStatus(
        "success",
        "Payment verified and order confirmed.",
        placedOrderId
      );
    } catch (err) {
      goToStatus(
        "failed",
        err.message || "Payment verification failed.",
        placedOrderId
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || isScreenLoading) {
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
          Checkout
        </Typography>
        <Typography sx={{ mb: 2 }}>Please login before checkout.</Typography>
        <AppButton component={Link} href="/login?next=/checkout">
          Go to Login
        </AppButton>
      </Container>
    );
  }

  if (!cart.length) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Checkout
        </Typography>
        <Typography sx={{ mb: 2 }}>Your cart is empty.</Typography>
        <AppButton component={Link} href="/cart">
          Back to Cart
        </AppButton>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {CHECKOUT_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {activeStep === 0 ? (
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>
                    Address
                  </Typography>
                  {addresses.length ? (
                    <RadioGroup
                      value={selectedAddressId}
                      onChange={(event) =>
                        setSelectedAddressId(event.target.value)
                      }
                    >
                      <Stack spacing={1.2} sx={{ mb: 2 }}>
                        {addresses.map((address) => (
                          <Box
                            key={address.id}
                            sx={{
                              border: (theme) =>
                                `1px solid ${theme.palette.brand.border}`,
                              borderRadius: 2,
                              px: 1.5,
                              py: 1,
                            }}
                          >
                            <FormControlLabel
                              value={address.id}
                              control={<Radio />}
                              label={`${address.name}, ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </RadioGroup>
                  ) : (
                    <Typography sx={{ opacity: 0.8, mb: 2 }}>
                      No saved addresses. Add one below.
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ fontWeight: 600, mb: 1.2 }}>
                    Add New Address
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <AppInput
                        label="Full Name"
                        value={addressForm.name}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <AppInput
                        label="Phone"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AppInput
                        label="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            line1: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AppInput
                        label="Address Line 2"
                        value={addressForm.line2}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            line2: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <AppInput
                        label="City"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <AppInput
                        label="State"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <AppInput
                        label="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            pincode: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <AppButton variant="outlined" onClick={saveAddress}>
                      Save Address
                    </AppButton>
                    <AppButton
                      disabled={!selectedAddressId}
                      onClick={() => setActiveStep(1)}
                    >
                      Continue
                    </AppButton>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {activeStep === 1 ? (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  border: "1px solid #eee",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2, md: 2.5 },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    Select Payment Method
                  </Typography>

                  <Stack spacing={1.2}>
                    {PAYMENT_METHODS.map((method) => {
                      const selected = paymentMethod === method.value;

                      return (
                        <Box
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          sx={{
                            border: selected
                              ? "1.5px solid #c7927b"
                              : "1px solid #e5e5e5",
                            borderRadius: 2,
                            py: 1.4,
                            px: 1.8,
                            cursor: "pointer",
                            transition: "0.25s ease",
                            bgcolor: selected ? "#fff8f5" : "#fff",

                            "&:hover": {
                              borderColor: "#c7927b",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{ flex: 1 }}
                            >
                              <Radio
                                checked={selected}
                                value={method.value}
                                size="small"
                                sx={{
                                  p: 0.5,
                                  color: "#c7927b",
                                  "&.Mui-checked": {
                                    color: "#c7927b",
                                  },
                                }}
                              />

                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {method.label}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    mt: 0.1,
                                    lineHeight: 1.3,
                                    fontSize: "13px",
                                  }}
                                >
                                  {method.value === "COD" &&
                                    "Pay after delivery"}

                                  {method.value === "UPI" &&
                                    "Google Pay, PhonePe, Paytm"}

                                  {method.value === "RAZORPAY" &&
                                    "Cards, UPI & Netbanking"}

                                  {method.value === "STRIPE" &&
                                    "Secure online payments"}

                                  {method.value === "WALLET" &&
                                    "Use wallet balance"}
                                </Typography>
                              </Box>
                            </Stack>

                            {selected && (
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#c7927b",
                                  letterSpacing: 0.5,
                                  ml: 2,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                SELECTED
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                    <AppButton
                      variant="outlined"
                      onClick={() => setActiveStep(0)}
                      sx={{
                        px: 3,
                        borderRadius: 8,
                      }}
                    >
                      Back
                    </AppButton>

                    <AppButton
                      onClick={() => setActiveStep(2)}
                      sx={{
                        px: 4,
                        borderRadius: 8,
                        bgcolor: "#c7927b",
                        "&:hover": {
                          bgcolor: "#b67d65",
                        },
                      }}
                    >
                      Continue
                    </AppButton>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {activeStep === 2 ? (
              <Card
                sx={{
                  borderRadius: 4,
                  border: "1px solid #eee",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                  }}
                >
                  {/* HEADER */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    Review Order
                  </Typography>

                  {/* ORDER INFO */}
                  <Stack spacing={2.2}>
                    <Box
                      sx={{
                        border: "1px solid #f0e3dc",
                        bgcolor: "#fff8f5",
                        borderRadius: 3,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "15px",
                          mb: 0.8,
                        }}
                      >
                        Order Details
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "14px",
                          lineHeight: 1.6,
                        }}
                      >
                        {cart.length} item(s) | Payment Method:{" "}
                        <b>{paymentMethod}</b>
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          mt: 0.5,
                        }}
                      >
                        Deliver to:{" "}
                        <b>
                          {selectedAddress
                            ? `${selectedAddress.name}, ${selectedAddress.city}, ${selectedAddress.state}`
                            : "-"}
                        </b>
                      </Typography>
                    </Box>

                    {/* SHIPPING */}
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          mb: 1.5,
                          fontSize: "15px",
                        }}
                      >
                        Shipping Method
                      </Typography>

                      <RadioGroup
                        value={selectedShippingId}
                        onChange={(event) =>
                          setSelectedShippingId(event.target.value)
                        }
                      >
                        <Stack spacing={1.2}>
                          {shippingOptions.map((option) => (
                            <Box
                              key={option.id}
                              sx={{
                                border:
                                  selectedShippingId === option.id
                                    ? "1.5px solid #c7927b"
                                    : "1px solid #e5e5e5",
                                borderRadius: 2,
                                px: 1.5,
                                py: 1.2,
                                bgcolor:
                                  selectedShippingId === option.id
                                    ? "#fff8f5"
                                    : "#fff",
                                transition: "0.25s ease",
                              }}
                            >
                              <FormControlLabel
                                value={option.id}
                                control={
                                  <Radio
                                    size="small"
                                    sx={{
                                      color: "#c7927b",
                                      "&.Mui-checked": {
                                        color: "#c7927b",
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: "14px",
                                      }}
                                    >
                                      {option.name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        color: "text.secondary",
                                      }}
                                    >
                                      Delivery ETA: {option.eta}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Box>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </Box>

                    {/* COUPON */}
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          mb: 1.5,
                          fontSize: "15px",
                        }}
                      >
                        Apply Coupon
                      </Typography>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                      >
                        <AppInput
                          fullWidth
                          size="small"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />

                        <AppButton
                          onClick={applyCoupon}
                          disabled={isActionLoading}
                          sx={{
                            minWidth: 110,
                            borderRadius: 8,
                            bgcolor: "#c7927b",
                            "&:hover": {
                              bgcolor: "#b67d65",
                            },
                          }}
                        >
                          Apply
                        </AppButton>

                        {appliedCoupon ? (
                          <AppButton
                            variant="outlined"
                            onClick={removeCoupon}
                            sx={{
                              borderRadius: 8,
                            }}
                          >
                            Remove
                          </AppButton>
                        ) : null}
                      </Stack>

                      {appliedCoupon ? (
                        <Typography
                          sx={{
                            color: "success.main",
                            mt: 1.5,
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          Coupon "{appliedCoupon.code}" applied successfully •
                          Saved {currency(discountAmount)}
                        </Typography>
                      ) : null}
                    </Box>

                    {/* BUTTONS */}
                    <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                      <AppButton
                        variant="outlined"
                        onClick={() => setActiveStep(1)}
                        sx={{
                          px: 3,
                          borderRadius: 8,
                        }}
                      >
                        Back
                      </AppButton>

                      <AppButton
                        onClick={createOrder}
                        disabled={isActionLoading}
                        sx={{
                          px: 4,
                          borderRadius: 8,
                          bgcolor: "#c7927b",
                          "&:hover": {
                            bgcolor: "#b67d65",
                          },
                        }}
                      >
                        {isActionLoading ? "Creating..." : "Create Order"}
                      </AppButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {activeStep === 3 ? (
              <Card
                sx={{
                  borderRadius: 4,
                  border: "1px solid #eee",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                  }}
                >
                  {/* HEADER */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    Payment Verification
                  </Typography>

                  {/* ONLINE PAYMENT FORM */}
                  {isOnlinePayment ? (
                    <Box
                      sx={{
                        border: "1px solid #f0e3dc",
                        bgcolor: "#fff8f5",
                        borderRadius: 3,
                        p: 2,
                        mb: 3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "15px",
                          mb: 2,
                        }}
                      >
                        Verify Your Payment
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <AppInput
                            fullWidth
                            label="Payment ID"
                            placeholder="Enter payment id"
                            value={paymentId}
                            onChange={(e) => setPaymentId(e.target.value)}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <AppInput
                            fullWidth
                            label="Signature"
                            placeholder="Enter payment signature"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                          />
                        </Grid>
                      </Grid>

                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "text.secondary",
                          mt: 1.5,
                          lineHeight: 1.5,
                        }}
                      >
                        Please enter the payment details received after
                        successful transaction verification.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: "1px solid #f0e3dc",
                        bgcolor: "#fff8f5",
                        borderRadius: 3,
                        p: 2,
                        mb: 3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "15px",
                          mb: 1,
                        }}
                      >
                        Cash on Delivery Selected
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: "text.secondary",
                          lineHeight: 1.6,
                        }}
                      >
                        Your order will be confirmed instantly. Payment can be
                        made at the time of delivery.
                      </Typography>
                    </Box>
                  )}

                  {/* BUTTONS */}
                  <Stack direction="row" spacing={1.5}>
                    <AppButton
                      variant="outlined"
                      onClick={() => setActiveStep(2)}
                      sx={{
                        px: 3,
                        borderRadius: 8,
                      }}
                    >
                      Back
                    </AppButton>

                    <AppButton
                      onClick={verifyPayment}
                      disabled={isActionLoading}
                      sx={{
                        px: 4,
                        borderRadius: 8,
                        bgcolor: "#c7927b",
                        "&:hover": {
                          bgcolor: "#b67d65",
                        },
                      }}
                    >
                      {isActionLoading ? "Verifying..." : "Confirm Order"}
                    </AppButton>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}
          </Grid>

          <Grid item xs={12} md={5} lg={4.5}>
            <Card
              sx={{
                position: { md: "sticky" },
                top: 90,
                borderRadius: 3,
                border: "1px solid #eee",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                minWidth: 280,
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "22px",
                    mb: 2.5,
                  }}
                >
                  Order Summary
                </Typography>

                <Stack spacing={1.8}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "15px",
                      }}
                    >
                      Subtotal
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "15px",
                      }}
                    >
                      {currency(subtotal)}
                    </Typography>
                  </Stack>

                  {discountAmount > 0 ? (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "15px",
                        }}
                      >
                        Discount
                      </Typography>

                      <Typography
                        sx={{
                          color: "success.main",
                          fontWeight: 600,
                          fontSize: "15px",
                        }}
                      >
                        -{currency(discountAmount)}
                      </Typography>
                    </Stack>
                  ) : null}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "15px",
                      }}
                    >
                      Shipping
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "15px",
                      }}
                    >
                      {currency(shippingAmount)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "15px",
                      }}
                    >
                      Tax (GST)
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "15px",
                      }}
                    >
                      {currency(taxAmount)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "20px",
                      }}
                    >
                      Total
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "22px",
                        color: "#c7927b",
                      }}
                    >
                      {currency(total)}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "14px",
                      mt: 1,
                    }}
                  >
                    {cart.length} item(s) in order
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
