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
  Grid,
  IconButton,
  Stack,
  Typography,
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

const getProductId = (product) => product?._id || product?.id || product?.productId;
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
  const { products } = useProducts();
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [hoveredId, setHoveredId] = useState(null);
  const [sizeModal, setSizeModal] = useState({ open: false, product: null });
  const [selectedSizes, setSelectedSizes] = useState({});
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  const savedCount = wishlist.length;

  const recentlyViewed = useMemo(() => {
    const wishlistIds = new Set(wishlist.map((item) => String(getProductId(item))));
    const productMap = new Map(products.map((product) => [String(getProductId(product)), product]));
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
    const selectedSize = selectedSizes[getProductId(product)] || product?.selectedSize || "";
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
      <Container sx={{ py: 12, textAlign: "center", minHeight: "70vh" }}>
        <Box
          sx={{
            mx: "auto",
            width: 120,
            height: 120,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: (theme) => theme.palette.brand.borderSoft,
            mb: 3,
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 56, color: "primary.main" }} />
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your wishlist is empty
        </Typography>
        <Typography sx={{ opacity: 0.75, mb: 3 }}>
          Save pieces you love and revisit them anytime.
        </Typography>
        <AppButton component={Link} href="/collection">
          Explore Collection
        </AppButton>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "background.default", color: "text.primary" }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "start", md: "center" }}
          spacing={1.5}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ letterSpacing: 2, fontWeight: 700 }}>
              YOUR WISHLIST
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>
              {savedCount} Saved {savedCount > 1 ? "Pieces" : "Piece"}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <AppButton component={Link} href="/shop" variant="outlined">
              Continue Shopping
            </AppButton>
            <AppButton variant="outlined" color="error" onClick={handleClearAll}>
              Clear All
            </AppButton>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {wishlist.map((product) => {
            const id = getProductId(product);
            const sizes = getSizes(product);
            const selectedSize = selectedSizes[id] || product?.selectedSize || product?.size || "";
            const price = getPrice(product);
            const originalPrice = getOriginalPrice(product);
            const dropped = originalPrice > price;
            const stock = stockLabel(product);

            return (
              <Grid item xs={12} sm={6} md={3} key={id}>
                <Card
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  sx={{
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.brand.border}`,
                    transition: "all 0.28s ease",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: (theme) => theme.palette.brand.shadowCardStrong,
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="320"
                      image={getImage(product, hoveredId === id)}
                      alt={getName(product)}
                      sx={{ objectFit: "cover" }}
                    />

                    <IconButton
                      onClick={() => handleRemove(product)}
                      sx={(theme) => ({
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: theme.palette.brand.navGlass,
                        "&:hover": { bgcolor: theme.palette.background.paper },
                      })}
                    >
                      <FavoriteIcon sx={{ color: "primary.main" }} />
                    </IconButton>

                    <Stack
                      direction="row"
                      spacing={0.8}
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {dropped ? <Chip size="small" color="error" label="Price Dropped" /> : null}
                      {stock.label === "Back in stock" ? (
                        <Chip size="small" color="success" label="Back in Stock" />
                      ) : null}
                    </Stack>
                  </Box>

                  <CardContent>
                    <Typography sx={{ fontWeight: 600, minHeight: 44 }}>{getName(product)}</Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8, mb: 0.8 }}>
                      <Typography sx={{ fontWeight: 700 }}>{currency(price)}</Typography>
                      {originalPrice > price ? (
                        <Typography sx={{ textDecoration: "line-through", opacity: 0.6 }}>
                          {currency(originalPrice)}
                        </Typography>
                      ) : null}
                    </Stack>

                    <Chip size="small" color={stock.color} label={stock.label} sx={{ mb: 1.2 }} />

                    {sizes.length > 0 ? (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: 13, opacity: 0.75, mb: 0.6 }}>
                          Available sizes
                        </Typography>
                        <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                          {sizes.slice(0, 6).map((size) => (
                            <Chip
                              key={size}
                              label={size}
                              size="small"
                              variant={selectedSize === size ? "filled" : "outlined"}
                              color={selectedSize === size ? "secondary" : "default"}
                              onClick={() =>
                                setSelectedSizes((prev) => ({ ...prev, [id]: size }))
                              }
                            />
                          ))}
                        </Stack>
                        {selectedSize ? (
                          <Typography sx={{ fontSize: 12, opacity: 0.75, mt: 0.6 }}>
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
                      >
                        Add to Bag
                      </AppButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

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

      <Dialog open={sizeModal.open} onClose={closeSizeModal} fullWidth maxWidth="xs">
        <DialogTitle>Select Size</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
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
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AppButton variant="outlined" onClick={closeSizeModal}>
            Cancel
          </AppButton>
          <AppButton onClick={confirmSizeSelection}>Add to Bag</AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
