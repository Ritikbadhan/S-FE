"use client";

import Link from "next/link";
import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { WishlistContext } from "@/context/WishlistContext";
import { CartContext } from "@/context/CartContext";
import { AppButton, AppTooltip, useToast } from "@/components/common";
import { addRecentlyViewedId } from "@/lib/recentlyViewed";

const getProductId = (product) =>
  product?._id || product?.id || product?.productId;
const getImage = (product, hovered) =>
  hovered && product?.images?.[1]
    ? product.images[1]
    : product?.images?.[0] || product?.image || "/homepic.jpeg";
const getName = (product) => product?.name || "Product";
const getCollection = (product) => product?.collection || "";
const getCategory = (product) => product?.category || "";
const getPrice = (product) => Number(product?.price || 0);
const getSpecs = (product) => product?.productSpecifications || {};
const getOriginalPrice = (product) => {
  const original = Number(product?.originalPrice || product?.mrp || 0);
  return original > getPrice(product) ? original : getPrice(product);
};
const getStock = (product) => Number(product?.stock ?? 0);

const getSizes = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants
      .map((variant) => ({
        label: String(variant?.size || "").toUpperCase(),
        available: Number(variant?.stock ?? 0) > 0,
      }))
      .filter((size) => Boolean(size.label));
  }

  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.map((size) => ({
      label: String(size).toUpperCase(),
      available: true,
    }));
  }

  if (product?.size) {
    return [{ label: String(product.size).toUpperCase(), available: true }];
  }

  return [];
};

const discountPercent = (price, originalPrice) => {
  if (originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const stockLabel = (stock, soldOutLabel = "Sold Out") => {
  if (stock <= 0) return { label: soldOutLabel, color: "default" };
  if (stock <= 3) return { label: `Only ${stock} left`, color: "error" };
  if (stock < 10) return { label: "Low stock", color: "warning" };
  return { label: "In stock", color: "success" };
};

const currency = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default function ProductCard({
  product,
  hideWishlistWhenOutOfStock = false,
  soldOutLabel = "Sold Out",
  hideWishlist = false,
  hideQuickAdd = false,
}) {
  const router = useRouter();
  const toast = useToast();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [hovered, setHovered] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const productId = getProductId(product);
  const isWishlisted = wishlist.some(
    (item) => getProductId(item) === productId
  );

  const price = getPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discount = discountPercent(price, originalPrice);
  const stock = getStock(product);
  const stockChip = stockLabel(stock, soldOutLabel);
  const shouldShowWishlist =
    !hideWishlist && !(hideWishlistWhenOutOfStock && stock <= 0);
  const sizes = getSizes(product);
  const specs = getSpecs(product);
  const specPreview = [specs?.fit, specs?.material]
    .filter(Boolean)
    .join(" • ");

  const badges = useMemo(() => {
    const list = [];
    if (product?.isNew)
      list.push({ label: "New", color: "secondary", icon: "✨" });
    if (product?.isBestSeller || Number(product?.rating || 0) >= 4.7) {
      list.push({ label: "Best Seller", color: "warning", icon: "🔥" });
    }
    if (stock > 0 && stock <= 5)
      list.push({ label: "Limited", color: "error", icon: "⚡" });
    if (discount > 0)
      list.push({ label: `${discount}% Off`, color: "success", icon: "%" });
    if (stock <= 0)
      list.push({ label: "Sold Out", color: "default", icon: "×" });
    return list.slice(0, 2);
  }, [discount, product?.isBestSeller, product?.isNew, product?.rating, stock]);

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        toast.info(`${getName(product)} removed from wishlist.`);
      } else {
        await addToWishlist(product);
        toast.success(`${getName(product)} added to wishlist.`);
      }
    } catch (err) {
      if (err.message === "Unauthorized") {
        toast.info("Please login to update your wishlist.");
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to update wishlist.");
    }
  };

  const addToBag = async (sizeValue) => {
    if (stock <= 0) {
      toast.error("This product is sold out.");
      return;
    }
    try {
      await addToCart({ ...product, size: sizeValue || selectedSize });
      toast.success(`${getName(product)} added to bag.`);
    } catch (err) {
      if (err.message === "Unauthorized") {
        toast.info("Please login to add items to bag.");
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to add product to cart.");
    }
  };

  const onQuickAdd = async () => {
    const hasSizeOptions = sizes.length > 0;
    if (hasSizeOptions && !selectedSize) {
      setSizeModalOpen(true);
      return;
    }
    await addToBag(selectedSize);
  };

  return (
    <>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: "relative",
          maxWidth: { xs: "100%", sm: 320 },
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: `1px solid ${brand.borderSoft}`,
          bgcolor: brand.surface,
          boxShadow: brand.shadowCard,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: brand.shadowCardStrong,
            borderColor: brand.border,
          },
        }}
      >
        {/* Image Section */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: brand.bg,
          }}
        >
          <Box
            component={Link}
            href={`/shop/${encodeURIComponent(productId)}`}
            onClick={() => addRecentlyViewedId(productId)}
            sx={{ display: "block", textDecoration: "none" }}
          >
            <CardMedia
              component="img"
              image={getImage(product, hovered)}
              alt={getName(product)}
              sx={{
                width: "100%",
                aspectRatio: "4 / 5",
                objectFit: "cover",
                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hovered ? "scale(1.08)" : "scale(1)",
              }}
            />
          </Box>

          {/* Overlay Gradient on Hover */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, ${brand.overlayStrong} 0%, transparent 50%)`,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
            }}
          />

          {/* Badges */}
          {badges.length > 0 && (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
                flexWrap: "wrap",
                gap: 0.75,
              }}
            >
              {badges.map((badge) => (
                <Zoom key={badge.label} in timeout={300}>
                  <Chip
                    size="small"
                    label={badge.label}
                    color={badge.color}
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      height: { xs: 22, sm: 24 },
                      fontWeight: 600,
                      backdropFilter: "blur(8px)",
                      background:
                        badge.color === "default"
                          ? brand.overlaySoft
                          : undefined,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                </Zoom>
              ))}
            </Stack>
          )}

          {/* Wishlist Button */}
          {shouldShowWishlist && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 3,
                }}
              >
                <AppTooltip
                  title={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <IconButton
                    onClick={handleWishlistToggle}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#FFFFFF",
                        transform: "scale(1.1)",
                        boxShadow: `0 4px 12px ${brand.primary}40`,
                      },
                    }}
                  >
                    {isWishlisted ? (
                      <FavoriteIcon
                        sx={{
                          color: brand.primary,
                          fontSize: { xs: 18, sm: 20 },
                        }}
                      />
                    ) : (
                      <FavoriteBorderIcon
                        sx={{
                          color: brand.text,
                          fontSize: { xs: 18, sm: 20 },
                        }}
                      />
                    )}
                  </IconButton>
                </AppTooltip>
              </Box>
            </Fade>
          )}

          {/* Quick Add Button */}
          {!hideQuickAdd && (
            <Box
              sx={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: 12,
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateY(0)" : "translateY(12px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: hovered ? "auto" : "none",
              }}
            >
              <AppButton
                fullWidth
                startIcon={<ShoppingBagOutlinedIcon />}
                size="medium"
                onClick={onQuickAdd}
                disabled={stock <= 0}
                sx={{
                  borderRadius: "24px",
                  py: 1.25,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                  color: "#FFFFFF",
                  boxShadow: brand.shadowButton,
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
                    transform: "translateY(-2px)",
                    boxShadow: brand.shadowCardStrong,
                  },
                  "&:disabled": {
                    background: brand.borderSoft,
                    color: brand.textMuted,
                  },
                }}
              >
                {sizes.length > 0 && !selectedSize
                  ? "Select Size"
                  : "Quick Add"}
              </AppButton>
            </Box>
          )}

          {/* Discount Badge (Bottom Left) */}
          {discount > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                left: 12,
                display: hovered ? "none" : "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: brand.success,
                color: "#FFFFFF",
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                fontSize: { xs: 11, sm: 12 },
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />
              {discount}% OFF
            </Box>
          )}
        </Box>

        {/* Content Section */}
        <CardContent
          sx={{
            p: { xs: 1.75, sm: 2 },
            "&:last-child": { pb: { xs: 1.75, sm: 2 } },
          }}
        >
          {/* Category/Collection */}
          {(getCollection(product) || getCategory(product)) && (
            <Typography
              sx={{
                fontSize: { xs: 11, sm: 12 },
                color: brand.primary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              {getCollection(product) || getCategory(product)}
            </Typography>
          )}

          {/* Specs Preview */}
          {specPreview && (
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                color: brand.textMuted,
                mb: 0.75,
                letterSpacing: 0.3,
              }}
            >
              {specPreview}
            </Typography>
          )}

          {/* Product Name */}
          <Typography
            component={Link}
            href={`/shop/${encodeURIComponent(productId)}`}
            onClick={() => addRecentlyViewedId(productId)}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: { xs: 36, sm: 40 },
              textDecoration: "none",
              color: brand.text,
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "0.9375rem", sm: "1rem" },
              lineHeight: 1.4,
              transition: "color 0.2s ease",
              "&:hover": {
                color: brand.primary,
              },
            }}
          >
            {getName(product)}
          </Typography>

          {/* Price Section */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.125rem", sm: "1.25rem" },
                color: brand.text,
              }}
            >
              {currency(price)}
            </Typography>
            {originalPrice > price && (
              <>
                <Typography
                  sx={{
                    textDecoration: "line-through",
                    color: brand.textMuted,
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  }}
                >
                  {currency(originalPrice)}
                </Typography>
                <Chip
                  label={`-${discount}%`}
                  size="small"
                  color="success"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </>
            )}
          </Stack>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: { xs: 10, sm: 11 },
                  color: brand.textMuted,
                  fontWeight: 600,
                  mb: 0.75,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Available Sizes
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
              >
                {sizes.slice(0, 6).map((size) => (
                  <Chip
                    key={size.label}
                    label={size.label}
                    size="small"
                    onClick={() =>
                      size.available ? setSelectedSize(size.label) : null
                    }
                    clickable={size.available}
                    variant={
                      selectedSize === size.label ? "filled" : "outlined"
                    }
                    color={
                      selectedSize === size.label ? "primary" : "default"
                    }
                    icon={
                      selectedSize === size.label ? (
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      ) : undefined
                    }
                    sx={{
                      height: { xs: 24, sm: 26 },
                      fontSize: { xs: 11, sm: 12 },
                      fontWeight: 600,
                      opacity: size.available ? 1 : 0.4,
                      textDecoration: size.available ? "none" : "line-through",
                      transition: "all 0.2s ease",
                      "&:hover": size.available
                        ? {
                            transform: "scale(1.05)",
                            borderColor: brand.primary,
                          }
                        : {},
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Stock Status */}
          <Chip
            size="small"
            color={stockChip.color}
            label={stockChip.label}
            sx={{
              fontSize: { xs: 10, sm: 11 },
              height: { xs: 22, sm: 24 },
              fontWeight: 600,
              borderRadius: "12px",
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        </CardContent>
      </Card>

      {/* Size Selection Dialog */}
      <Dialog
        open={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: brand.surface,
            border: `1px solid ${brand.borderSoft}`,
            boxShadow: brand.shadowCardStrong,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: brand.text,
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            pb: 2,
          }}
        >
          Select Your Size
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: brand.textMuted,
              mb: 2,
            }}
          >
            Choose an available size to add this item to your bag
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {sizes.map((size) => (
              <Chip
                key={size.label}
                label={size.label}
                clickable={size.available}
                onClick={() =>
                  size.available ? setSelectedSize(size.label) : null
                }
                variant={selectedSize === size.label ? "filled" : "outlined"}
                color={selectedSize === size.label ? "primary" : "default"}
                icon={
                  selectedSize === size.label ? (
                    <CheckCircleIcon />
                  ) : undefined
                }
                sx={{
                  height: 40,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  px: 2,
                  opacity: size.available ? 1 : 0.4,
                  textDecoration: size.available ? "none" : "line-through",
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <AppButton
            variant="outlined"
            onClick={() => setSizeModalOpen(false)}
            fullWidth
            sx={{
              borderRadius: "24px",
              py: 1.25,
              borderColor: brand.border,
              color: brand.text,
              "&:hover": {
                borderColor: brand.primary,
                backgroundColor: brand.borderSoft,
              },
            }}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={async () => {
              if (!selectedSize) {
                toast.info("Please select a size first.");
                return;
              }
              await addToBag(selectedSize);
              setSizeModalOpen(false);
            }}
            disabled={!selectedSize}
            fullWidth
            sx={{
              borderRadius: "24px",
              py: 1.25,
              background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              color: "#FFFFFF",
              fontWeight: 600,
              "&:hover": {
                background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
                transform: "translateY(-2px)",
                boxShadow: brand.shadowButton,
              },
            }}
          >
            Add to Bag
          </AppButton>
        </DialogActions>
      </Dialog>
    </>
  );
}