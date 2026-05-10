"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Rating,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { AppButton, AppInput, useToast } from "@/components/common";
import { CartContext } from "@/context/CartContext";
import { WishlistContext } from "@/context/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import {
  addRecentlyViewedId,
  getRecentlyViewedIds,
} from "@/lib/recentlyViewed";
import { getProductByIdApi, reviewsApi } from "@/lib/api";

const getProductId = (product) =>
  String(product?._id || product?.id || product?.productId || "");
const getImageList = (product) => {
  if (Array.isArray(product?.images) && product.images.length)
    return product.images;
  if (product?.image) return [product.image];
  return ["/homepic.jpeg"];
};
const getPrice = (product) => Number(product?.price || 0);
const getOriginalPrice = (product) => {
  const original = Number(product?.originalPrice || product?.mrp || 0);
  return original > getPrice(product) ? original : getPrice(product);
};
const getStock = (product) => Number(product?.stock ?? 0);
const getName = (product) => product?.name || "Product";
const getCollection = (product) => product?.collection || "Black Edition";
const getCategory = (product) => product?.category || "Fashion";
const getSpecs = (product) => product?.productSpecifications || {};
const currency = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const discount = (price, original) =>
  original > price ? Math.round(((original - price) / original) * 100) : 0;

const getSizes = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants
      .map((variant) => ({
        label: String(variant?.size || "").toUpperCase(),
        available: Number(variant?.stock ?? 0) > 0,
      }))
      .filter((item) => Boolean(item.label));
  }
  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.map((size) => ({
      label: String(size).toUpperCase(),
      available: true,
    }));
  }
  return ["XS", "S", "M", "L", "XL"].map((size) => ({
    label: size,
    available: true,
  }));
};

const getColors = (product) => {
  if (Array.isArray(product?.colors) && product.colors.length)
    return product.colors;
  if (Array.isArray(product?.variants) && product.variants.length) {
    const options = Array.from(
      new Set(product.variants.map((variant) => variant?.color).filter(Boolean))
    );
    if (options.length) return options;
  }
  return ["Black", "Stone", "Navy"];
};

const CRAFT_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
  "https://images.unsplash.com/photo-1551232864-3f0890e580d9",
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { products } = useProducts();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  const productId = String(params?.productId || "");
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    text: "",
  });
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadProductById() {
      if (!productId) return;
      setProductLoading(true);
      setProductError("");
      try {
        const data = await getProductByIdApi(productId);
        if (!active) return;
        const resolved = data?.product || data?.data || data || null;
        setProduct(resolved);
      } catch (err) {
        if (!active) return;
        setProductError(err.message || "Failed to load product.");
      } finally {
        if (active) setProductLoading(false);
      }
    }
    loadProductById();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const sizes = getSizes(product);
    const colors = getColors(product);
    if (!selectedSize && sizes.length) {
      const firstAvailable =
        sizes.find((size) => size.available)?.label || sizes[0].label;
      setSelectedSize(firstAvailable);
    }
    if (!selectedColor && colors.length) {
      setSelectedColor(String(colors[0]));
    }
  }, [product, selectedColor, selectedSize]);

  useEffect(() => {
    if (!productId) return;
    const next = addRecentlyViewedId(productId);
    setRecentlyViewed(next);
  }, [productId]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewedIds());
  }, []);

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      if (!productId) return;
      try {
        const data = await reviewsApi.listByProduct(productId);
        if (!active) return;
        const list = data?.reviews || data?.data || data || [];
        setReviews(Array.isArray(list) ? list : []);
      } catch (err) {
        if (active) {
          setReviews([]);
        }
      }
    }
    loadReviews();
    return () => {
      active = false;
    };
  }, [productId]);

  const isWishlisted = wishlist.some(
    (item) => getProductId(item) === productId
  );

  const images = product ? getImageList(product) : [];
  const activeImage = images[selectedImageIndex] || images[0];
  const price = getPrice(product || {});
  const original = getOriginalPrice(product || {});
  const off = discount(price, original);
  const stock = getStock(product || {});
  const specs = getSpecs(product || {});

  const specPairs = [
    { label: "Fit", value: specs?.fit || "-", icon: "👔" },
    { label: "Material", value: specs?.material || "-", icon: "🧵" },
    { label: "Pattern", value: specs?.pattern || "-", icon: "🎨" },
    { label: "Neckline", value: specs?.neckline || "-", icon: "👕" },
    { label: "Sleeve Type", value: specs?.sleeveType || "-", icon: "👐" },
    { label: "Closure", value: specs?.closure || "-", icon: "🔘" },
    { label: "Country of Origin", value: specs?.countryOfOrigin || "-", icon: "🌍" },
    {
      label: "Fabric GSM",
      value: specs?.fabricWeightGsm ? String(specs.fabricWeightGsm) : "-",
      icon: "⚖️",
    },
  ];

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => getProductId(item) !== productId)
      .filter(
        (item) =>
          item?.category === product?.category ||
          item?.collection === product?.collection
      )
      .slice(0, 4);
  }, [product, productId, products]);

  const recentlyViewedProducts = useMemo(() => {
    if (!products.length) return [];
    return recentlyViewed
      .filter((id) => id !== productId)
      .map((id) => products.find((item) => getProductId(item) === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [productId, products, recentlyViewed]);

  const averageRating = useMemo(() => {
    const apiRating = Number(product?.rating || 0);
    const combined = [...reviews];
    if (!combined.length) return apiRating || 4.5;
    const sum = combined.reduce(
      (acc, review) => acc + Number(review.rating || 0),
      0
    );
    return sum / combined.length;
  }, [product?.rating, reviews]);

  const reviewCount = Math.max(Number(product?.reviewCount || 0), reviews.length);

  if (productLoading) {
    return (
      <Container sx={{ py: 10 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <CircularProgress size={60} sx={{ color: brand.primary }} />
          <Typography sx={{ color: brand.textMuted, fontSize: "1.125rem" }}>
            Loading product details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (productError || !product) {
    return (
      <Container sx={{ py: 10 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: brand.surface,
            border: `1px solid ${brand.borderSoft}`,
            borderRadius: 4,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: brand.text }}>
            {productError || "Product not found"}
          </Typography>
          <Typography sx={{ mb: 3, color: brand.textMuted }}>
            The product you're looking for doesn't exist or has been removed.
          </Typography>
          <AppButton
            component={Link}
            href="/shop"
            variant="contained"
            size="large"
            sx={{
              background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              borderRadius: "24px",
              px: 4,
            }}
          >
            Back to Shop
          </AppButton>
        </Paper>
      </Container>
    );
  }

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        toast.info("Removed from wishlist.");
      } else {
        await addToWishlist(product);
        toast.success("Saved to wishlist.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update wishlist.");
    }
  };

  const addToBag = async (buyNow = false) => {
    if (stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (!selectedSize) {
      toast.info("Please select a size.");
      return;
    }

    try {
      await addToCart({
        ...product,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      toast.success("Added to bag.");
      if (buyNow) router.push("/cart");
    } catch (err) {
      if (err.message === "Unauthorized") {
        toast.info("Please login to continue.");
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to add to bag.");
    }
  };

  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.text) {
      toast.info("Please enter your name and review.");
      return;
    }
    try {
      await reviewsApi.create({
        productId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.text,
        title: "",
      });
      const data = await reviewsApi.listByProduct(productId);
      const list = data?.reviews || data?.data || data || [];
      setReviews(Array.isArray(list) ? list : []);
      setReviewForm({ name: "", rating: 5, text: "" });
      toast.success("Review submitted successfully!");
    } catch (err) {
      if (err.message === "Unauthorized") {
        toast.info("Please login to submit a review.");
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to submit review.");
    }
  };

  const stockText =
    stock <= 0 ? "Out of stock" : stock <= 3 ? `Only ${stock} left` : "In stock";

  const modelInfo = "Model is 6'1\" wearing size M";
  const estimatedDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <Box sx={{ bgcolor: brand.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": { color: brand.textMuted },
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: brand.textMuted,
              fontSize: "0.875rem",
            }}
          >
            Home
          </Link>
          <Link
            href="/shop"
            style={{
              textDecoration: "none",
              color: brand.textMuted,
              fontSize: "0.875rem",
            }}
          >
            Shop
          </Link>
          <Typography sx={{ color: brand.text, fontSize: "0.875rem", fontWeight: 600 }}>
            {getName(product)}
          </Typography>
        </Breadcrumbs>

        {/* Main Product Section */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Image Gallery */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: "sticky",
                top: 80,
              }}
            >
              <Grid container spacing={1.5}>
                {/* Thumbnails */}
                <Grid item xs={12} md={2}>
                  <Stack
                    direction={{ xs: "row", md: "column" }}
                    spacing={1.5}
                    sx={{
                      overflowX: { xs: "auto", md: "visible" },
                      overflowY: { md: "auto" },
                      maxHeight: { md: "600px" },
                      pb: { xs: 1, md: 0 },
                    }}
                  >
                    {images.map((image, idx) => (
                      <Paper
                        key={`${image}-${idx}`}
                        elevation={0}
                        sx={{
                          flexShrink: 0,
                          cursor: "pointer",
                          overflow: "hidden",
                          borderRadius: 2,
                          border:
                            selectedImageIndex === idx
                              ? `2px solid ${brand.primary}`
                              : `1px solid ${brand.borderSoft}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: brand.primary,
                            transform: "scale(1.05)",
                          },
                        }}
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <Box
                          component="img"
                          src={image}
                          alt={`${getName(product)}-${idx + 1}`}
                          sx={{
                            width: { xs: 80, md: "100%" },
                            height: { xs: 100, md: 120 },
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </Grid>

                {/* Main Image */}
                <Grid item xs={12} md={10}>
                  <Paper
                    elevation={0}
                    sx={{
                      overflow: "hidden",
                      borderRadius: 3,
                      border: `1px solid ${brand.borderSoft}`,
                      position: "relative",
                      bgcolor: brand.surface,
                    }}
                  >
                    <Box
                      component="img"
                      src={activeImage}
                      alt={getName(product)}
                      sx={{
                        width: "100%",
                        aspectRatio: "4 / 5",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />

                    {/* Discount Badge */}
                    {off > 0 && (
                      <Chip
                        icon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={`${off}% OFF`}
                        color="success"
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          fontWeight: 700,
                          fontSize: { xs: 12, sm: 14 },
                          height: { xs: 28, sm: 32 },
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: 3,
                position: { md: "sticky" },
                top: { md: 80 },
              }}
            >
              <Stack spacing={2.5}>
                {/* Collection & Category */}
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={getCollection(product)}
                    size="small"
                    sx={{
                      bgcolor: `${brand.primary}15`,
                      color: brand.primary,
                      fontWeight: 600,
                      fontSize: { xs: 11, sm: 12 },
                    }}
                  />
                  <Chip
                    label={getCategory(product)}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: brand.border,
                      fontSize: { xs: 11, sm: 12 },
                    }}
                  />
                </Stack>

                {/* Product Name */}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: brand.text,
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  {getName(product)}
                </Typography>

                {/* Rating */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Rating
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: brand.warning,
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      color: brand.textMuted,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                  >
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </Typography>
                </Stack>

                {/* Price */}
                <Box>
                  <Stack direction="row" spacing={2} alignItems="baseline">
                    <Typography
                      sx={{
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                        fontWeight: 700,
                        color: brand.text,
                      }}
                    >
                      {currency(price)}
                    </Typography>
                    {original > price && (
                      <Typography
                        sx={{
                          textDecoration: "line-through",
                          color: brand.textMuted,
                          fontSize: { xs: "1.125rem", sm: "1.25rem" },
                        }}
                      >
                        {currency(original)}
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      color: brand.success,
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    EMI from {currency(Math.max(1, Math.ceil(price / 3)))}/month
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      color: brand.textMuted,
                      mt: 1,
                    }}
                  >
                    {specs?.fit || "Regular fit"} • {specs?.material || "Premium fabric"}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: brand.border }} />

                {/* Size Selector */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      color: brand.text,
                    }}
                  >
                    Select Size
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {getSizes(product).map((size) => (
                      <Chip
                        key={size.label}
                        label={size.label}
                        clickable={size.available}
                        onClick={() =>
                          size.available ? setSelectedSize(size.label) : null
                        }
                        variant={
                          selectedSize === size.label ? "filled" : "outlined"
                        }
                        color={
                          selectedSize === size.label ? "primary" : "default"
                        }
                        icon={
                          selectedSize === size.label ? (
                            <CheckCircleIcon />
                          ) : undefined
                        }
                        sx={{
                          height: { xs: 36, sm: 40 },
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          fontWeight: 600,
                          px: 2,
                          opacity: size.available ? 1 : 0.4,
                          textDecoration: size.available
                            ? "none"
                            : "line-through",
                          transition: "all 0.2s ease",
                          "&:hover": size.available
                            ? {
                                transform: "scale(1.05)",
                                boxShadow: brand.shadowButton,
                              }
                            : {},
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      color: brand.textMuted,
                      mt: 1.5,
                    }}
                  >
                    📏 Size guide available • {modelInfo}
                  </Typography>
                </Box>

                {/* Color Selector */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      color: brand.text,
                    }}
                  >
                    Select Color
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    {getColors(product).map((color) => (
                      <Chip
                        key={String(color)}
                        label={String(color)}
                        onClick={() => setSelectedColor(String(color))}
                        variant={
                          selectedColor === String(color) ? "filled" : "outlined"
                        }
                        color={
                          selectedColor === String(color) ? "primary" : "default"
                        }
                        icon={
                          selectedColor === String(color) ? (
                            <CheckCircleIcon />
                          ) : undefined
                        }
                        sx={{
                          height: { xs: 36, sm: 40 },
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          fontWeight: 600,
                          px: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: brand.shadowButton,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Stock Status */}
                <Chip
                  icon={stock > 0 ? <CheckCircleIcon /> : undefined}
                  size="medium"
                  color={
                    stock <= 0 ? "default" : stock <= 3 ? "error" : "success"
                  }
                  label={stockText}
                  sx={{
                    alignSelf: "start",
                    fontWeight: 600,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  }}
                />

                <Divider sx={{ borderColor: brand.border }} />

                {/* Quantity Selector */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      color: brand.text,
                    }}
                  >
                    Quantity
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      sx={{
                        border: `1px solid ${brand.border}`,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: brand.primary,
                          bgcolor: brand.borderSoft,
                        },
                      }}
                    >
                      −
                    </IconButton>
                    <Typography
                      sx={{
                        minWidth: 40,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: { xs: "1.125rem", sm: "1.25rem" },
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={quantity >= stock}
                      sx={{
                        border: `1px solid ${brand.border}`,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: brand.primary,
                          bgcolor: brand.borderSoft,
                        },
                      }}
                    >
                      +
                    </IconButton>
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1.5}>
                  <AppButton
                    fullWidth
                    size="large"
                    onClick={() => addToBag(false)}
                    disabled={stock <= 0}
                    sx={{
                      py: 1.75,
                      borderRadius: "24px",
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                      color: "#FFFFFF",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
                        transform: "translateY(-2px)",
                        boxShadow: brand.shadowCardStrong,
                      },
                    }}
                  >
                    Add to Bag
                  </AppButton>
                  <AppButton
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={() => addToBag(true)}
                    disabled={stock <= 0}
                    sx={{
                      py: 1.75,
                      borderRadius: "24px",
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                      fontWeight: 600,
                      borderColor: brand.primary,
                      color: brand.primary,
                      "&:hover": {
                        borderColor: brand.hover,
                        bgcolor: brand.borderSoft,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Buy Now
                  </AppButton>
                  <IconButton
                    onClick={toggleWishlist}
                    size="large"
                    sx={{
                      border: `2px solid ${brand.border}`,
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: brand.primary,
                        bgcolor: brand.borderSoft,
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    {isWishlisted ? (
                      <FavoriteIcon sx={{ color: brand.primary, fontSize: 24 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>
                </Stack>

                {/* Benefits Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: `${brand.primary}08`,
                    border: `1px solid ${brand.borderSoft}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalShippingOutlinedIcon
                        sx={{ color: brand.primary, fontSize: 22 }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          color: brand.text,
                          fontWeight: 500,
                        }}
                      >
                        Free shipping over ₹1999
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AutorenewOutlinedIcon
                        sx={{ color: brand.primary, fontSize: 22 }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          color: brand.text,
                          fontWeight: 500,
                        }}
                      >
                        7-day easy returns & exchange
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PaymentsOutlinedIcon
                        sx={{ color: brand.primary, fontSize: 22 }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          color: brand.text,
                          fontWeight: 500,
                        }}
                      >
                        COD available • Delivery by {estimatedDate}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <VerifiedUserOutlinedIcon
                        sx={{ color: brand.primary, fontSize: 22 }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          color: brand.text,
                          fontWeight: 500,
                        }}
                      >
                        100% Authentic & Quality Checked
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Product Description */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Product Description
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              bgcolor: brand.surface,
              border: `1px solid ${brand.borderSoft}`,
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                color: brand.text,
                fontSize: { xs: "1rem", sm: "1.0625rem" },
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              {product?.description ||
                "Crafted with deliberate structure and a clean silhouette, this piece is designed for elevated everyday dressing with long-term wardrobe value. Experience luxury that speaks through quality craftsmanship and timeless design."}
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  title: "Fabric",
                  value:
                    specs?.material || "Premium blended weave with soft finish.",
                  icon: "🧵",
                },
                {
                  title: "Care",
                  value: Array.isArray(specs?.careInstructions) &&
                    specs.careInstructions.length
                    ? specs.careInstructions[0]
                    : "Dry clean preferred. Cool iron if needed.",
                  icon: "🧼",
                },
                {
                  title: "Fit",
                  value:
                    specs?.fit ||
                    "Structured regular fit with clean shoulder line.",
                  icon: "👔",
                },
                {
                  title: "Occasion",
                  value: Array.isArray(specs?.occasion) && specs.occasion.length
                    ? specs.occasion.join(", ")
                    : "Evening, smart casual, and formal styling.",
                  icon: "🎩",
                },
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: "100%",
                      bgcolor: `${brand.primary}05`,
                      border: `1px solid ${brand.borderSoft}`,
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: brand.shadowCard,
                        borderColor: brand.border,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "2rem", mb: 1 }}>
                      {item.icon}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        mb: 0.75,
                        color: brand.text,
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: brand.textMuted,
                        fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                        lineHeight: 1.6,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* Product Specifications */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Product Specifications
          </Typography>
          <Grid container spacing={2}>
            {specPairs.map((spec, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: brand.surface,
                    border: `1px solid ${brand.borderSoft}`,
                    borderRadius: 2,
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: brand.shadowCard,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                    <Typography sx={{ fontSize: "1.5rem" }}>
                      {spec.icon}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                        color: brand.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      {spec.label}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: brand.text,
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                    }}
                  >
                    {spec.value || "-"}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Size & Fit Accordion */}
          {specs?.sizeAndFit && (
            <Accordion
              elevation={0}
              sx={{
                mt: 3,
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: "12px !important",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    my: 1.5,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                    color: brand.text,
                  }}
                >
                  📐 Size & Fit Guide
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <Typography sx={{ color: brand.textMuted }}>
                    Model Height: {specs.sizeAndFit.modelHeight || "-"} |
                    Wearing: {specs.sizeAndFit.modelWearing || "-"}
                  </Typography>
                  <Typography sx={{ color: brand.textMuted }}>
                    {specs.sizeAndFit.fitNote || "-"}
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Size Chart Accordion */}
          {specs?.measurementsCm && (
            <Accordion
              elevation={0}
              sx={{
                mt: 2,
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: "12px !important",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    my: 1.5,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                    color: brand.text,
                  }}
                >
                  📏 Size Chart (cm)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  {Object.entries(specs.measurementsCm).map(([sizeKey, values]) => (
                    <Grid item xs={12} md={6} key={sizeKey}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: `${brand.primary}05`,
                          border: `1px solid ${brand.borderSoft}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: brand.primary,
                            fontSize: { xs: "0.9375rem", sm: "1rem" },
                          }}
                        >
                          Size {sizeKey}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                            color: brand.textMuted,
                            lineHeight: 1.8,
                          }}
                        >
                          Chest: {values?.chest ?? "-"} | Length:{" "}
                          {values?.length ?? "-"}
                          <br />
                          Shoulder: {values?.shoulder ?? "-"} | Sleeve:{" "}
                          {values?.sleeve ?? "-"}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        {/* Craft & Detail */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Craft & Detail
          </Typography>
          <Typography
            sx={{
              color: brand.textMuted,
              mb: 3,
              fontSize: { xs: "0.9375rem", sm: "1rem" },
            }}
          >
            Close-up detailing on stitch precision, button finishing, and fabric
            quality that defines luxury craftsmanship.
          </Typography>
          <Grid container spacing={2}>
            {CRAFT_IMAGES.map((img, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 2,
                    border: `1px solid ${brand.borderSoft}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: brand.shadowCardStrong,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`Craft detail ${idx + 1}`}
                    sx={{
                      width: "100%",
                      height: 280,
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Reviews Section */}
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Customer Reviews
          </Typography>

          {/* Rating Overview */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 3,
              bgcolor: `${brand.primary}08`,
              border: `1px solid ${brand.borderSoft}`,
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} textAlign={{ xs: "center", md: "left" }}>
                <Typography
                  sx={{
                    fontSize: { xs: "3rem", sm: "3.5rem" },
                    fontWeight: 700,
                    color: brand.text,
                    lineHeight: 1,
                  }}
                >
                  {averageRating.toFixed(1)}
                </Typography>
                <Rating
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size="large"
                  sx={{
                    my: 1,
                    "& .MuiRating-iconFilled": {
                      color: brand.warning,
                    },
                  }}
                />
                <Typography sx={{ color: brand.textMuted, fontWeight: 500 }}>
                  Based on {reviewCount} reviews
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {/* Add Review Form */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: brand.surface,
                    border: `1px solid ${brand.borderSoft}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: brand.text,
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    Write a Review
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <AppInput
                        fullWidth
                        size="small"
                        label="Your Name"
                        placeholder="Enter your name"
                        value={reviewForm.name}
                        onChange={(e) =>
                          setReviewForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <AppInput
                        select
                        fullWidth
                        size="small"
                        label="Rating"
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((p) => ({
                            ...p,
                            rating: Number(e.target.value),
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <MenuItem key={r} value={r}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <StarIcon sx={{ fontSize: 16, color: brand.warning }} />
                              <Typography>{r}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </AppInput>
                    </Grid>
                    <Grid item xs={12}>
                      <AppInput
                        fullWidth
                        multiline
                        rows={3}
                        label="Your Review"
                        placeholder="Share your experience with this product..."
                        value={reviewForm.text}
                        onChange={(e) =>
                          setReviewForm((p) => ({ ...p, text: e.target.value }))
                        }
                      />
                    </Grid>
                  </Grid>
                  <AppButton
                    sx={{
                      mt: 2,
                      borderRadius: "24px",
                      px: 4,
                      background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                    }}
                    onClick={submitReview}
                  >
                    Submit Review
                  </AppButton>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Reviews List */}
          <Stack spacing={2}>
            {reviews.slice(0, 5).map((review, idx) => (
              <Paper
                key={review.id || review._id || idx}
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  bgcolor: brand.surface,
                  border: `1px solid ${brand.borderSoft}`,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: brand.shadowCard,
                    borderColor: brand.border,
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: brand.text,
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                    }}
                  >
                    {review.name || review.userName || "Anonymous User"}
                  </Typography>
                  <Typography
                    sx={{
                      color: brand.textMuted,
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    }}
                  >
                    {new Date(review.createdAt || Date.now()).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </Typography>
                </Stack>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{
                    mb: 1,
                    "& .MuiRating-iconFilled": {
                      color: brand.warning,
                    },
                  }}
                />
                <Typography
                  sx={{
                    color: brand.textMuted,
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    lineHeight: 1.7,
                  }}
                >
                  {review.comment || review.text || "No comment provided."}
                </Typography>
              </Paper>
            ))}
          </Stack>

          {reviews.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 1, color: brand.text }}
              >
                No reviews yet
              </Typography>
              <Typography sx={{ color: brand.textMuted }}>
                Be the first to review this product!
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: brand.text,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                Complete the Look
              </Typography>
              <AppButton
                component={Link}
                href="/shop"
                variant="outlined"
                sx={{
                  borderRadius: "24px",
                  borderColor: brand.primary,
                  color: brand.primary,
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                View All
              </AppButton>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {relatedProducts.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={getProductId(item)}>
                  <ProductCard product={item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: brand.text,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              Recently Viewed
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {recentlyViewedProducts.map((item) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={`recent-${getProductId(item)}`}
                >
                  <ProductCard product={item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  )};