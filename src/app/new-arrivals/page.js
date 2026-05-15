"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ProductCard from "@/components/product/ProductCard";
import { AppButton } from "@/components/common";
import { useProducts } from "@/hooks/useProducts";
import { newArrivalsPageContent } from "@/workflow/pages/newArrivals";
import { useIsMobile } from "@/hooks/useIsMobile";

const getProductId = (product) => product?._id || product?.id || product?.productId;
const getName = (product) => product?.name || "New Arrival";
const getPrice = (product) => Number(product?.price || 0);
const getCreatedAt = (product) =>
  new Date(product?.createdAt || product?.updatedAt || Date.now()).getTime();
const getImage = (product) => product?.images?.[0] || product?.image || "/homepic.jpeg";
const getStock = (product) => Number(product?.stock ?? 999);

const isLimited = (product) => Boolean(product?.isLimited) || getStock(product) > 0 && getStock(product) < 8;

const isRecentlyDropped = (product) => {
  if (product?.isNew) return true;
  const created = getCreatedAt(product);
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= thirtyDays;
};

const getMostViewedScore = (product) =>
  Number(product?.viewCount || product?.views || 0);

const getCartTrendScore = (product) =>
  Number(product?.addedToCartCount || product?.addedToCart || 0);

const hasRealCartTrendData = (product) => getCartTrendScore(product) > 0;
const hasRealViewData = (product) => getMostViewedScore(product) > 0;

const formatReleaseDate = (product) => {
  const date = new Date(getCreatedAt(product));
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function NewArrivalsPage() {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { products, loading, error } = useProducts();
  const [sortBy, setSortBy] = useState("newest");

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 0,
  });

  useEffect(() => {
    const nextDropDate = new Date();
    nextDropDate.setDate(nextDropDate.getDate() + 2);
    nextDropDate.setHours(nextDropDate.getHours() + 14);

    const timer = setInterval(() => {
      const diff = nextDropDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, minutes });
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const newProducts = useMemo(() => {
    const recent = products.filter(isRecentlyDropped);
    const fallback = [...products]
      .sort((a, b) => getCreatedAt(b) - getCreatedAt(a))
      .slice(0, 16);
    const source = recent.length > 0 ? recent : fallback;
    const sorted = [...source];

    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "trending":
        sorted.sort((a, b) => getCartTrendScore(b) - getCartTrendScore(a));
        break;
      case "most-viewed":
        sorted.sort((a, b) => getMostViewedScore(b) - getMostViewedScore(a));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
        break;
    }

    return sorted;
  }, [products, sortBy]);

  const primaryGrid = newProducts.slice(0, 8);
  const secondaryGrid = newProducts.slice(8);

  const trendingByCart = useMemo(() => {
    return [...products]
      .filter(hasRealCartTrendData)
      .sort((a, b) => getCartTrendScore(b) - getCartTrendScore(a))
      .slice(0, 8);
  }, [products]);

  const trendingByViews = useMemo(() => {
    return [...products]
      .filter(hasRealViewData)
      .sort((a, b) => getMostViewedScore(b) - getMostViewedScore(a))
      .slice(0, 8);
  }, [products]);

  return (
    <>
      <Box
        sx={{
          minHeight: { xs: "60vh", md: "70vh" },
          backgroundImage: (theme) =>
            `linear-gradient(${theme.palette.brand.overlaySoft}, ${theme.palette.brand.overlayStrong}), url('${isMobile ? newArrivalsPageContent.hero.imageSrcMobile : newArrivalsPageContent.hero.imageSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          color: "background.paper",
        }}
      >
        <Container>
          <Box sx={{ maxWidth: 760 }}>
            <Typography
              sx={{
                color: "primary.main",
                letterSpacing: { xs: 2, md: 3 },
                fontSize: { xs: "0.72rem", md: "0.875rem" },
                mb: { xs: 0.5, md: 1 },
              }}
            >
              {newArrivalsPageContent.hero.dropDateLabel}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: { xs: 0.75, md: 1.5 },
                fontSize: { xs: "1.5rem", sm: "2.3rem", md: "3.2rem" },
                lineHeight: { xs: 1.15, md: 1.25 },
              }}
            >
              {newArrivalsPageContent.hero.title}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.9rem", md: 22 }, mb: { xs: 0.75, md: 1.5 } }}>
              {newArrivalsPageContent.hero.subtitle}
            </Typography>
            <Typography
              sx={{
                opacity: 0.86,
                mb: { xs: 1.75, md: 3.5 },
                fontSize: { xs: "0.82rem", md: "1rem" },
                lineHeight: { xs: 1.5, md: 1.7 },
              }}
            >
              {newArrivalsPageContent.hero.description}
            </Typography>
            <Stack
              direction="row"
              spacing={{ xs: 1, md: 2 }}
              alignItems="center"
              flexWrap="wrap"
            >
              <AppButton
                component={Link}
                href={newArrivalsPageContent.hero.ctaHref}
                sx={{
                  px: { xs: 2.25, md: 4 },
                  py: { xs: 0.625, md: 0.875 },
                  fontSize: { xs: "0.8rem", md: "0.875rem" },
                }}
              >
                {newArrivalsPageContent.hero.ctaLabel}
              </AppButton>
              {/* <Chip
                label={`${newArrivalsPageContent.hero.nextDropPrefix} ${String(timeLeft.days).padStart(2, "0")} Days ${String(
                  timeLeft.hours
                ).padStart(2, "0")} Hours`}
                sx={(theme) => ({ bgcolor: theme.palette.brand.navGlass, color: "background.paper" })}
              /> */}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Card
          sx={{
            border: (theme) => `1px solid ${theme.palette.brand.border}`,
            bgcolor: "background.paper",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              flexWrap: "wrap",
              p: { xs: 1.25, md: 2 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                }}
              >
                {newArrivalsPageContent.dropCard.title}
              </Typography>
              <Typography
                sx={{
                  opacity: 0.8,
                  fontSize: { xs: "0.82rem", md: "0.95rem" },
                }}
              >
                {newArrivalsPageContent.dropCard.description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {newArrivalsPageContent.dropCard.chips.map((chip) => (
                <Chip
                  key={chip.label}
                  color={chip.color}
                  label={chip.label}
                  variant={chip.variant}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <Divider sx={{ width: "60%", mx: "auto", mb: { xs: 2.5, md: 4 } }} />

      <Box sx={{ bgcolor: "background.default", py: { xs: 3.5, md: 5 } }}>
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={{ xs: 1.25, md: 2 }}
            sx={{ mb: { xs: 2.5, md: 4 } }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  mb: 0.5,
                  letterSpacing: { xs: 1, md: 2 },
                  fontSize: { xs: "1.3rem", sm: "1.75rem", md: "2.125rem" },
                }}
              >
                {newArrivalsPageContent.sections.justDroppedTitle}
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: { xs: "0.82rem", md: "1rem" } }}>
                {newProducts.length} pieces from the latest release.
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: { xs: 170, md: 220 } }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {newArrivalsPageContent.sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, md: 8 } }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography sx={{ textAlign: "center", opacity: 0.8 }}>{error}</Typography>
          ) : (
            <>
              <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
                {primaryGrid.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={getProductId(product)}>
                    <Box sx={{ position: "relative" }}>
                      <ProductCard product={product} />
                    </Box>
                    <Typography sx={{ mt: 0.75, opacity: 0.75, fontSize: { xs: 11, md: 13 } }}>
                      {newArrivalsPageContent.sections.releasePrefix} {formatReleaseDate(product)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {secondaryGrid.length > 0 ? (
                <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
                  {secondaryGrid.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={getProductId(product)}>
                      <Box sx={{ position: "relative" }}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: { xs: 8, md: 10 },
                            left: { xs: 8, md: 10 },
                            zIndex: 3,
                            display: "flex",
                            gap: 0.5,
                            pointerEvents: "none",
                          }}
                        >
                          <Chip size="small" label={newArrivalsPageContent.labels.new} color="secondary" />
                          {isLimited(product) ? (
                            <Chip size="small" label={newArrivalsPageContent.labels.limited} color="error" />
                          ) : null}
                        </Box>
                        <ProductCard product={product} />
                      </Box>
                      <Typography sx={{ mt: 0.75, opacity: 0.75, fontSize: { xs: 11, md: 13 } }}>
                        {newArrivalsPageContent.sections.releasePrefix} {formatReleaseDate(product)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </>
          )}
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: (theme) => theme.palette.brand.borderSoft }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 0.75, fontSize: { xs: "1.3rem", md: "2.125rem" } }}>
            {newArrivalsPageContent.sections.trendingTitle}
          </Typography>
          <Typography sx={{ opacity: 0.78, mb: { xs: 2, md: 3 }, fontSize: { xs: "0.85rem", md: "1rem" } }}>
            {newArrivalsPageContent.sections.trendingDescription}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: "1rem", md: "1.25rem" } }}>
            {newArrivalsPageContent.sections.mostAddedTitle}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.25, md: 2 },
              overflowX: "auto",
              pb: 1,
              mb: { xs: 2.5, md: 4 },
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "primary.main" },
            }}
          >
            {trendingByCart.length ? (
              trendingByCart.map((product) => (
                <Card
                  key={`cart-${getProductId(product)}`}
                  sx={{ minWidth: { xs: 220, md: 260 }, flex: "0 0 auto" }}
                >
                  <CardActionArea component={Link} href={`/shop/${encodeURIComponent(getProductId(product))}`}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "180" : "220"}
                      image={getImage(product)}
                      alt={getName(product)}
                    />
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                        {getName(product)}
                      </Typography>
                      <Typography sx={{ opacity: 0.72, fontSize: { xs: 11, md: 13 } }}>
                        Added to cart: {getCartTrendScore(product)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))
            ) : (
              <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.82rem", md: "1rem" } }}>
                {newArrivalsPageContent.states.noCartTrendData}
              </Typography>
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: "1rem", md: "1.25rem" } }}>
            {newArrivalsPageContent.sections.mostViewedTitle}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.25, md: 2 },
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "primary.main" },
            }}
          >
            {trendingByViews.length ? (
              trendingByViews.map((product) => (
                <Card
                  key={`view-${getProductId(product)}`}
                  sx={{ minWidth: { xs: 220, md: 260 }, flex: "0 0 auto" }}
                >
                  <CardActionArea component={Link} href={`/shop/${encodeURIComponent(getProductId(product))}`}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "180" : "220"}
                      image={getImage(product)}
                      alt={getName(product)}
                    />
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                        {getName(product)}
                      </Typography>
                      <Typography sx={{ opacity: 0.72, fontSize: { xs: 11, md: 13 } }}>
                        Views: {getMostViewedScore(product)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))
            ) : (
              <Typography sx={{ opacity: 0.7, fontSize: { xs: "0.82rem", md: "1rem" } }}>
                {newArrivalsPageContent.states.noViewData}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 4, md: 6 },
          textAlign: "center",
          px: { xs: 2, md: 3 },
          bgcolor: "background.default",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 0.75,
            letterSpacing: { xs: 1, md: 2 },
            color: "primary.main",
            fontSize: { xs: "1.2rem", md: "2.125rem" },
          }}
        >
          {newArrivalsPageContent.cta.title}
        </Typography>
        <Typography
          sx={{
            maxWidth: 820,
            mx: "auto",
            opacity: 0.82,
            fontSize: { xs: "0.9rem", md: "1rem" },
            lineHeight: { xs: 1.6, md: 1.8 },
          }}
        >
          {newArrivalsPageContent.cta.description}
        </Typography>
      </Box>
    </>
  );
}
