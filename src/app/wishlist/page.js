"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useRouter } from "next/navigation";
import { AppButton, useToast } from "@/components/common";
import { WishlistContext } from "@/context/WishlistContext";
import { CartContext } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";

const getProductId = (product) =>
  product?._id || product?.id || product?.productId;
const getName = (product) => product?.name || "Saved Piece";
const getPrice = (product) => Number(product?.price || 0);
const getOriginalPrice = (product) => {
  const original = Number(product?.originalPrice || product?.mrp || 0);
  return original > getPrice(product) ? original : getPrice(product);
};
const getImage = (product, hovered) =>
  hovered && product?.images?.[1]
    ? product.images[1]
    : product?.images?.[0] || product?.image || "/homepic.jpeg";
const getStock = (product) => Number(product?.stock ?? 0);
const getSizes = (product) => {
  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.map((size) => String(size).toUpperCase());
  }
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants
      .map((variant) => variant?.size)
      .filter(Boolean)
      .map((size) => String(size).toUpperCase());
  }
  if (product?.size) return [String(product.size).toUpperCase()];
  return [];
};

const currency = (value) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;

const stockLabel = (product) => {
  const stock = getStock(product);
  if (stock <= 0) return { label: "Out of stock", color: "error" };
  if (stock <= 3) return { label: `Only ${stock} left`, color: "warning" };
  return { label: "Back in stock", color: "success" };
};

export default function WishlistPage() {
  const router = useRouter();
  const toast = useToast();
  const theme = useTheme();
  const brand = theme.palette.brand;

  const { products } = useProducts();
  const { wishlist, removeFromWishlist, clearWishlist } =
    useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [hoveredId, setHoveredId] = useState(null);
  const [sizeModal, setSizeModal] = useState({ open: false, product: null });
  const [selectedSizes, setSelectedSizes] = useState({});
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  const savedCount = wishlist.length;

  const recentlyViewed = useMemo(() => {
    const wishlistIds = new Set(
      wishlist.map((item) => String(getProductId(item)))
    );
    const productMap = new Map(
      products.map((product) => [String(getProductId(product)), product])
    );
    return recentlyViewedIds
      .filter((id) => !wishlistIds.has(String(id)))
      .map((id) => productMap.get(String(id)))
      .filter(Boolean)
      .slice(0, 4);
  }, [products, recentlyViewedIds, wishlist]);

  useEffect(() => {
    setRecentlyViewedIds(getRecentlyViewedIds());
  }, []);

  const handleRemove = async (product) => {
    const id = getProductId(product);
    try {
      await removeFromWishlist(id);
      toast.info(`${getName(product)} removed from wishlist.`);
    } catch (err) {
      if (err.message === "Unauthorized") {
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to remove from wishlist.");
    }
  };

  const handleClearAll = async () => {
    await clearWishlist();
    toast.info("Wishlist cleared.");
  };

  const closeSizeModal = () => setSizeModal({ open: false, product: null });

  const handleAddToBag = async (product) => {
    const sizes = getSizes(product);
    const selectedSize =
      selectedSizes[getProductId(product)] || product?.selectedSize || "";
    const requiresSize = sizes.length > 0;
    const stock = getStock(product);

    if (stock <= 0) {
      toast.error("This piece is out of stock.");
      return;
    }

    if (requiresSize && !selectedSize) {
      setSizeModal({ open: true, product });
      return;
    }

    try {
      await addToCart({ ...product, size: selectedSize || product?.size });
      toast.success(`${getName(product)} added to bag.`);
    } catch (err) {
      if (err.message === "Unauthorized") {
        toast.info("Please login to add items to bag.");
        router.push("/login");
        return;
      }
      toast.error(err.message || "Failed to add product to bag.");
    }
  };

  const confirmSizeSelection = async () => {
    const product = sizeModal.product;
    if (!product) return;
    const productId = getProductId(product);
    const selectedSize = selectedSizes[productId];
    if (!selectedSize) {
      toast.info("Select a size first.");
      return;
    }
    closeSizeModal();
    await handleAddToBag({ ...product, selectedSize });
  };

  if (!wishlist.length) {
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
          <FavoriteBorderIcon
            sx={{ fontSize: { xs: 42, md: 56 }, color: "primary.main" }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{ mb: 0.75, fontSize: { xs: "1.35rem", md: "2.125rem" } }}
        >
          Your wishlist is empty
        </Typography>
        <Typography
          sx={{
            opacity: 0.75,
            mb: { xs: 2, md: 3 },
            fontSize: { xs: "0.9rem", md: "1rem" },
            lineHeight: { xs: 1.55, md: 1.75 },
          }}
        >
          Save pieces you love and revisit them anytime.
        </Typography>
        <AppButton
          component={Link}
          href="/collection"
          sx={{
            px: { xs: 2.25, md: 3 },
            fontSize: { xs: "0.8rem", md: "0.875rem" },
          }}
        >
          Explore Collection
        </AppButton>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 3.5, md: 8 },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: {
            xs: 1.5,
            sm: 2,
            md: 3,
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={{ xs: 1, md: 1.5 }}
          sx={{ mb: { xs: 2.5, md: 4 } }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                letterSpacing: { xs: 1, md: 2 },
                fontWeight: 700,
                fontSize: { xs: "1.3rem", md: "2.125rem" },
              }}
            >
              YOUR WISHLIST
            </Typography>
            <Typography
              sx={{ opacity: 0.75, fontSize: { xs: "0.82rem", md: "1rem" } }}
            >
              {savedCount} Saved {savedCount > 1 ? "Pieces" : "Piece"}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0.8, sm: 1.2 }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <AppButton
              component={Link}
              href="/shop"
              variant="outlined"
              fullWidth
              sx={{
                fontSize: { xs: "0.78rem", md: "0.875rem" },
                py: { xs: 0.6, md: 0.8 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Continue Shopping
            </AppButton>
            <AppButton
              variant="outlined"
              color="error"
              onClick={handleClearAll}
              fullWidth
              sx={{
                fontSize: { xs: "0.78rem", md: "0.875rem" },
                py: { xs: 0.6, md: 0.8 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Clear All
            </AppButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, sm: 2.5, md: 4 },
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          {wishlist.map((product) => {
            const id = getProductId(product);
            const sizes = getSizes(product);
            const selectedSize =
              selectedSizes[id] || product?.selectedSize || product?.size || "";
            const price = getPrice(product);
            const originalPrice = getOriginalPrice(product);
            const stock = stockLabel(product);

            return (
              <Box key={id} sx={{ minWidth: 0 }}>
                <Card
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    maxWidth: { xs: "100%", sm: 320 },
                    mx: "auto",
                    borderRadius: { xs: 2, sm: 3 },
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
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      bgcolor: brand.bg,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={getImage(product, hoveredId === id)}
                      alt={getName(product)}
                      sx={{
                        width: "100%",
                        aspectRatio: "4 / 5",
                        objectFit: "contain",
                      }}
                    />

                    <IconButton
                      onClick={() => handleRemove(product)}
                      sx={(theme) => ({
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: { xs: 30, sm: 40 },
                        height: { xs: 30, sm: 40 },
                        bgcolor: theme.palette.brand.navGlass,
                        "&:hover": {
                          bgcolor: "#FFFFFF",
                          transform: "scale(1.1)",
                          boxShadow: `0 4px 12px ${brand.primary}40`,
                        },
                      })}
                    >
                      <FavoriteIcon sx={{ color: "primary.main" }} />
                    </IconButton>
                  </Box>

                  <CardContent
                    sx={{
                      p: { xs: 0.75, sm: 2 },
                      "&:last-child": { pb: { xs: 0.75, sm: 2 } },
                    }}
                  >
                    <Typography
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontWeight: 600,
                        minHeight: { xs: 24, sm: 40 },
                        fontSize: { xs: "0.7rem", sm: "1rem" },
                        lineHeight: { xs: 1.18, sm: 1.4 },
                      }}
                    >
                      {getName(product)}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        mt: { xs: 0.35, sm: 0.6 },
                        mb: { xs: 0.5, sm: 0.6 },
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                        }}
                      >
                        {currency(price)}
                      </Typography>
                      {originalPrice > price ? (
                        <Typography
                          sx={{
                            textDecoration: "line-through",
                            opacity: 0.6,
                            fontSize: { xs: "0.62rem", sm: "0.95rem" },
                          }}
                        >
                          {currency(originalPrice)}
                        </Typography>
                      ) : null}
                    </Stack>

                    <Chip
                      size="small"
                      color={stock.color}
                      label={stock.label}
                      sx={{
                        mb: { xs: 0.45, sm: 1 },
                        height: { xs: 18, sm: 24 },
                        fontSize: { xs: 8, sm: 11 },
                        fontWeight: 600,
                        "& .MuiChip-label": { px: { xs: 0.7, sm: 1.5 } },
                      }}
                    />

                    {sizes.length > 0 ? (
                      <Box sx={{ mb: { xs: 0.55, sm: 1.1 } }}>
                        <Typography
                          sx={{
                            fontSize: { xs: 8, sm: 13 },
                            opacity: 0.75,
                            mb: { xs: 0.3, sm: 0.5 },
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: { xs: 0.35, sm: 0.5 },
                          }}
                        >
                          Available sizes
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={{ xs: 0.3, sm: 0.6 }}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {sizes.slice(0, 6).map((size) => (
                            <Chip
                              key={size}
                              label={size}
                              size="small"
                              variant={
                                selectedSize === size ? "filled" : "outlined"
                              }
                              color={
                                selectedSize === size ? "secondary" : "default"
                              }
                              onClick={() =>
                                setSelectedSizes((prev) => ({
                                  ...prev,
                                  [id]: size,
                                }))
                              }
                              sx={{
                                height: { xs: 18, sm: 26 },
                                fontSize: { xs: 8, sm: 12 },
                                fontWeight: 600,
                                "& .MuiChip-label": {
                                  px: { xs: 0.55, sm: 1.5 },
                                },
                              }}
                            />
                          ))}
                        </Stack>
                        {selectedSize ? (
                          <Typography
                            sx={{
                              fontSize: { xs: 8, sm: 12 },
                              opacity: 0.75,
                              mt: 0.5,
                            }}
                          >
                            Selected size: {selectedSize}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : null}

                    <Stack direction="row" spacing={1}>
                      <AppButton
                        fullWidth
                        startIcon={<ShoppingBagOutlinedIcon />}
                        onClick={() => handleAddToBag(product)}
                        disabled={getStock(product) <= 0}
                        sx={{
                          borderRadius: "24px",
                          minHeight: { xs: 32, sm: 42 },
                          py: { xs: 0.625, sm: 0.875 },
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        }}
                      >
                        Add to Bag
                      </AppButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* {recentlyViewed.length ? (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 0.8 }}>
              Recently Viewed
            </Typography>
            <Typography sx={{ opacity: 0.75, mb: 2.5 }}>
              Revisit products you may want to save next.
            </Typography>
            <Grid container spacing={2.5}>
              {recentlyViewed.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={`recent-${getProductId(product)}`}>
                  <Card sx={{ borderRadius: 2.5, overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={getImage(product, false)}
                      alt={getName(product)}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{getName(product)}</Typography>
                      <Typography sx={{ opacity: 0.78 }}>{currency(getPrice(product))}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : null} */}
      </Container>

      <Dialog
        open={sizeModal.open}
        onClose={closeSizeModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
          Select Size
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            spacing={0.8}
            flexWrap="wrap"
            useFlexGap
            sx={{ pt: 0.75 }}
          >
            {getSizes(sizeModal.product || {}).map((size) => {
              const productId = getProductId(sizeModal.product || {});
              const active = selectedSizes[productId] === size;
              return (
                <Chip
                  key={size}
                  label={size}
                  clickable
                  variant={active ? "filled" : "outlined"}
                  color={active ? "secondary" : "default"}
                  onClick={() =>
                    setSelectedSizes((prev) => ({ ...prev, [productId]: size }))
                  }
                  sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.25, md: 2 }, gap: 0.8 }}>
          <AppButton
            variant="outlined"
            onClick={closeSizeModal}
            sx={{
              fontSize: { xs: "0.78rem", md: "0.875rem" },
              py: { xs: 0.55, md: 0.8 },
            }}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={confirmSizeSelection}
            sx={{
              fontSize: { xs: "0.78rem", md: "0.875rem" },
              py: { xs: 0.55, md: 0.8 },
            }}
          >
            Add to Bag
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
