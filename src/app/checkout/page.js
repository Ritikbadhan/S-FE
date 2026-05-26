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

const CHECKOUT_STEPS = ["Address", "Review"];

const PAYMENT_METHODS = {
  RAZORPAY: "RAZORPAY",
  COD: "COD",
};

const PAYMENT_OPTIONS = [
  {
    value: PAYMENT_METHODS.RAZORPAY,
    label: "Online Payment",
    description: "Pay securely with Razorpay.",
  },
  {
    value: PAYMENT_METHODS.COD,
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
  },
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
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

const openRazorpayCheckout = async ({
  razorpayOrderId,
  amount,
  currency,
  orderId,
  selectedAddress,
  clearCart,
  toast,
  goToStatus,
}) => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    toast.error("Razorpay SDK failed to load.");
    return;
  }

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

    amount,

    currency,

    order_id: razorpayOrderId,

    name: "Your Store",

    description: "Order Payment",

    prefill: {
      name: selectedAddress?.name || "",
      contact: selectedAddress?.phone || "",
    },

    theme: {
      color: "#000000",
    },

    modal: {
      ondismiss: function () {
        toast.info("Payment cancelled");
      },
    },

    handler: async function (response) {
      console.log("RAZORPAY RESPONSE", response);
      try {
        await paymentsApi.verify({
          orderId,

          razorpayOrderId: response.razorpay_order_id,

          razorpayPaymentId: response.razorpay_payment_id,

          razorpaySignature: response.razorpay_signature,
        });

        await clearCart();

        goToStatus("success", "Payment successful", orderId);
      } catch (err) {
        goToStatus(
          "failed",
          err?.message || "Payment verification failed",
          orderId
        );
      }
    },
  };

  const razorpay = new window.Razorpay(options);

  // PAYMENT FAILED EVENT
  razorpay.on("payment.failed", function (response) {
    goToStatus(
      "failed",
      response?.error?.description || "Payment failed",
      orderId
    );
  });

  razorpay.open();
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
  const [shippingOptions, setShippingOptions] = useState([
    DEFAULT_SHIPPING_OPTION,
  ]);
  const [selectedShippingId, setSelectedShippingId] = useState(
    DEFAULT_SHIPPING_OPTION.id
  );

  const [cartValidated, setCartValidated] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    PAYMENT_METHODS.RAZORPAY
  );

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
  const total = taxableSubtotal; // + shippingAmount + taxAmount;

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) || null;

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
        const [addressResponse, shippingResponse] = await Promise.all([
          addressesApi.list().catch(() => []),
          checkoutApi
            .shippingOptions(subtotal)
            .catch(() => [DEFAULT_SHIPPING_OPTION]),
        ]);
        if (!active) return;

        const normalizedAddresses = normalizeAddresses(addressResponse);
        setAddresses(normalizedAddresses);
        const defaultAddress = normalizedAddresses.find(
          (address) => address.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (normalizedAddresses[0]) {
          setSelectedAddressId(normalizedAddresses[0].id);
        }

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

        paymentMethod: selectedPaymentMethod,

        couponCode: appliedCoupon?.code || undefined,
      };

      // CREATE ORDER
      const orderResponse = await ordersApi.create(payload);

      const orderRoot =
        orderResponse?.order ||
        orderResponse?.data?.order ||
        orderResponse?.data ||
        orderResponse;

      const orderId =
        orderRoot?.id || orderRoot?._id || orderRoot?.orderId || "";

      if (!orderId) {
        throw new Error("Order id missing in response.");
      }

      setPlacedOrderId(orderId);

      if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
        await clearCart();
        setIsActionLoading(false);
        goToStatus(
          "success",
          "Order placed successfully. Please pay cash on delivery.",
          orderId
        );
        return;
      }

      // CREATE RAZORPAY ORDER
      const paymentResponse = await paymentsApi.create({
        orderId,
        paymentMethod: selectedPaymentMethod,
      });

      const paymentRoot = paymentResponse?.data || paymentResponse;

      // STOP BUTTON LOADING BEFORE POPUP
      setIsActionLoading(false);
      console.log("PAYMENT ROOT", paymentRoot);
      // OPEN RAZORPAY
      await openRazorpayCheckout({
        razorpayOrderId: paymentRoot?.payment?.razorpayOrderId,

        amount: paymentRoot?.payment?.amountSubunit,

        currency: paymentRoot?.payment?.currency || "INR",

        orderId,

        selectedAddress,

        clearCart,

        toast,

        goToStatus,
      });
    } catch (err) {
      setIsActionLoading(false);

      goToStatus("failed", err?.message || "Order create failed.");
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
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>
                    Review
                  </Typography>
                  <Typography sx={{ opacity: 0.85, mb: 1.2 }}>
                    {cart.length} item(s)
                  </Typography>
                  <Typography sx={{ opacity: 0.85, mb: 1.2 }}>
                    Deliver to:{" "}
                    {selectedAddress
                      ? `${selectedAddress.name}, ${selectedAddress.city}, ${selectedAddress.state}`
                      : "-"}
                  </Typography>

                  {/* <RadioGroup
                    value={selectedShippingId}
                    onChange={(event) =>
                      setSelectedShippingId(event.target.value)
                    }
                    sx={{ mb: 2 }}
                  >
                    {shippingOptions.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={<Radio />}
                        label={`${option.name} (${currency(option.price)})`}
                      />
                    ))}
                  </RadioGroup> */}

                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ fontWeight: 600, mb: 1.2 }}>
                    Payment Method
                  </Typography>
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onChange={(event) =>
                      setSelectedPaymentMethod(event.target.value)
                    }
                    sx={{ mb: 2 }}
                  >
                    <Stack spacing={1.2}>
                      {PAYMENT_OPTIONS.map((option) => (
                        <Box
                          key={option.value}
                          sx={{
                            border: (theme) =>
                              `1px solid ${
                                selectedPaymentMethod === option.value
                                  ? theme.palette.primary.main
                                  : theme.palette.brand.border
                              }`,
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                            bgcolor:
                              selectedPaymentMethod === option.value
                                ? "action.hover"
                                : "transparent",
                          }}
                        >
                          <FormControlLabel
                            value={option.value}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {option.label}
                                </Typography>
                                <Typography
                                  sx={{ opacity: 0.75, fontSize: 13 }}
                                >
                                  {option.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      ))}
                    </Stack>
                  </RadioGroup>

                  <Stack direction="row" spacing={1} sx={{ mb: 1.2 }}>
                    <AppInput
                      size="small"
                      label="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <AppButton onClick={applyCoupon} disabled={isActionLoading}>
                      Apply
                    </AppButton>
                    {appliedCoupon ? (
                      <AppButton variant="outlined" onClick={removeCoupon}>
                        Remove
                      </AppButton>
                    ) : null}
                  </Stack>
                  {appliedCoupon ? (
                    <Typography sx={{ color: "success.main", mb: 2 }}>
                      Applied {appliedCoupon.code} - {currency(discountAmount)}{" "}
                      off
                    </Typography>
                  ) : null}

                  <Stack direction="row" spacing={1}>
                    <AppButton
                      variant="outlined"
                      onClick={() => setActiveStep(0)}
                    >
                      Back
                    </AppButton>
                    <AppButton onClick={createOrder} disabled={isActionLoading}>
                      {isActionLoading
                        ? "Creating..."
                        : selectedPaymentMethod === PAYMENT_METHODS.COD
                          ? "Place Order"
                          : "Pay Now"}
                    </AppButton>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: { md: "sticky" }, top: 90 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                  Order Summary
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography sx={{ opacity: 0.8 }}>Subtotal</Typography>
                  <Typography>{currency(subtotal)}</Typography>
                </Stack>
                {discountAmount > 0 ? (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography sx={{ opacity: 0.8 }}>
                      Coupon Discount
                    </Typography>
                    <Typography color="success.main">
                      -{currency(discountAmount)}
                    </Typography>
                  </Stack>
                ) : null}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography sx={{ opacity: 0.8 }}>Shipping</Typography>
                  <Typography>{currency(shippingAmount)}</Typography>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {currency(total)}
                  </Typography>
                </Stack>
                <Typography sx={{ opacity: 0.75, fontSize: 14 }}>
                  {cart.length} item(s) in order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
