"use client";

import Link from "next/link";
import {
  Box,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  AutoAwesomeOutlined,
  CheckCircleOutline,
  FilterListOutlined,
  FlashOnOutlined,
  GridViewOutlined,
  SearchOutlined,
  TrendingUpOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import ProductCard from "@/components/product/ProductCard";
import { AppButton, AppInput } from "@/components/common";
import { useProducts } from "@/hooks/useProducts";
import { collectionPageContent } from "@/workflow/pages/collection";

const getProductId = (product) =>
  product?._id || product?.id || product?.productId;
const getName = (product) => product?.name || "Collection Piece";
const getPrice = (product) => Number(product?.price || 0);
const getCategory = (product) =>
  String(product?.category || "uncategorized").toLowerCase();
const getCollection = (product) =>
  String(product?.collection || "general").toLowerCase();

const extractSizes = (product) => {
  if (Array.isArray(product?.sizes)) {
    return product.sizes.map((size) => String(size).toUpperCase());
  }
  if (product?.size) {
    return [String(product.size).toUpperCase()];
  }
  if (Array.isArray(product?.variants)) {
    return product.variants
      .map((variant) => variant?.size)
      .filter(Boolean)
      .map((size) => String(size).toUpperCase());
  }
  return [];
};

const priceMatch = (product, filter) => {
  const price = getPrice(product);
  if (filter === "under-3000") return price < 3000;
  if (filter === "3000-5000") return price >= 3000 && price <= 5000;
  if (filter === "above-5000") return price > 5000;
  return true;
};

export default function CollectionPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { products, loading, error } = useProducts();
  const featureIconMap = {
    inspiration: (
      <AutoAwesomeOutlined sx={{ fontSize: 34, color: "inherit" }} />
    ),
    fabric: <CheckCircleOutline sx={{ fontSize: 34, color: "inherit" }} />,
    mood: <FlashOnOutlined sx={{ fontSize: 34, color: "inherit" }} />,
    vision: <TrendingUpOutlined sx={{ fontSize: 34, color: "inherit" }} />,
  };
  const badgeIconMap = {
    statement: <AutoAwesomeOutlined sx={{ fontSize: 14 }} />,
    bestSeller: <TrendingUpOutlined sx={{ fontSize: 14 }} />,
    limited: <FlashOnOutlined sx={{ fontSize: 14 }} />,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  const sizeOptions = useMemo(() => {
    const allSizes = products.flatMap(extractSizes);
    return Array.from(new Set(allSizes)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredCollection = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const sizes = extractSizes(product);
      const matchesSearch =
        !query ||
        getName(product).toLowerCase().includes(query) ||
        getCategory(product).includes(query) ||
        getCollection(product).includes(query);
      const matchesSize =
        sizeFilter === "all" ||
        sizes.length === 0 ||
        sizes.includes(sizeFilter);

      return matchesSearch && matchesSize && priceMatch(product, priceFilter);
    });
  }, [products, searchQuery, sizeFilter, priceFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setSizeFilter("all");
    setPriceFilter("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || sizeFilter !== "all" || priceFilter !== "all";

  const getBadgeForIndex = (index) => {
    const badge = collectionPageContent.badges[index];
    return badge
      ? {
          ...badge,
          icon: badgeIconMap[badge.iconKey],
        }
      : null;
  };

  return (
    <Box sx={{ bgcolor: brand.bg }}>
      <Box
        sx={{
          width: "100%",
          height: { xs: "40vh", sm: "50vh", md: "60vh" },
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${collectionPageContent.hero.imageSrc}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, ${brand.overlayStrong}, ${brand.overlaySoft})`,
            },
          }}
        />

        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1000}>
            <Box
              sx={{
                maxWidth: "900px",
                mx: "auto",
                textAlign: "center",
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  letterSpacing: { xs: 2, sm: 3, md: 4 },
                  fontWeight: 700,
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
                  color: "#FFFFFF",
                  textShadow: brand.heroTextShadow,
                }}
              >
                {collectionPageContent.hero.title}
              </Typography>

              <Typography
                sx={{
                  letterSpacing: { xs: 3, sm: 4, md: 6 },
                  color: brand.accent,
                  fontWeight: 300,
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                  mb: { xs: 2, sm: 3 },
                }}
              >
                {collectionPageContent.hero.eyebrow}
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                }}
              >
                {collectionPageContent.hero.subtitle}
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 4, sm: 5, md: 6 },
          background: `linear-gradient(135deg, ${brand.primary}08, ${brand.hover}08)`,
          borderBottom: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              maxWidth: "850px",
              mx: "auto",
              fontStyle: "italic",
              color: brand.text,
              lineHeight: 1.8,
              fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
              fontWeight: 300,
            }}
          >
            {collectionPageContent.hero.quote}
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: `linear-gradient(to bottom, ${brand.bg}, ${brand.surface})`,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                letterSpacing: { xs: 2, md: 3 },
                fontWeight: 600,
                color: brand.text,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              {collectionPageContent.hero.storyTitle}
            </Typography>
            <Divider
              sx={{
                width: { xs: "60px", sm: "80px" },
                height: "3px",
                mx: "auto",
                mb: 3,
                background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                borderRadius: "3px",
              }}
            />
            <Typography
              sx={{
                color: brand.textMuted,
                maxWidth: 780,
                mx: "auto",
                fontSize: { xs: "1rem", sm: "1.0625rem", md: "1.125rem" },
                lineHeight: 1.8,
              }}
            >
              {collectionPageContent.hero.storyDescription}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {collectionPageContent.features.map((feature, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: brand.surface,
                    border: `1px solid ${brand.borderSoft}`,
                    boxShadow: brand.shadowCard,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: brand.primary,
                      boxShadow: brand.shadowCardStrong,
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: brand.primary,
                      background: `${brand.primary}12`,
                    }}
                  >
                    {featureIconMap[feature.iconKey]}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: brand.text,
                        fontSize: "1rem",
                        mb: 0.5,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: brand.textMuted,
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          bgcolor: brand.bg,
          py: { xs: 4, md: 6 },
          minHeight: "60vh",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                letterSpacing: { xs: 2, md: 3 },
                fontWeight: 600,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                color: brand.text,
              }}
            >
              {collectionPageContent.hero.productsTitle}
            </Typography>
            <Divider
              sx={{
                width: { xs: "60px", sm: "80px" },
                height: "3px",
                mx: "auto",
                background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                borderRadius: "3px",
              }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              border: `1px solid ${brand.borderSoft}`,
              bgcolor: brand.surface,
              borderRadius: 3,
              boxShadow: brand.shadowCard,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <TuneOutlined sx={{ color: brand.primary, fontSize: 24 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: brand.text,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  {collectionPageContent.filters.title}
                </Typography>
                {hasActiveFilters && (
                  <Chip
                    label={collectionPageContent.filters.activeLabel}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Stack>

              {isMobile && (
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterListOutlined />}
                  sx={{ fontSize: "0.875rem" }}
                >
                  {showFilters
                    ? collectionPageContent.filters.toggleLabels.hide
                    : collectionPageContent.filters.toggleLabels.show}
                </AppButton>
              )}
            </Box>

            {(!isMobile || showFilters) && (
              <Box
                sx={{
                  display: "grid",
                  gap: { xs: 2, sm: 2.5 },
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                }}
              >
                <Box sx={{ gridColumn: { xs: "1 / -1", lg: "span 2" } }}>
                  <AppInput
                    label={collectionPageContent.filters.searchLabel}
                    placeholder={
                      collectionPageContent.filters.searchPlaceholder
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined sx={{ color: brand.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? brand.bg
                            : "transparent",
                      },
                    }}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>
                    {collectionPageContent.filters.sizeLabel}
                  </InputLabel>
                  <Select
                    label={collectionPageContent.filters.sizeLabel}
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: brand.border,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: brand.primary,
                      },
                    }}
                  >
                    <MenuItem value="all">
                      {collectionPageContent.filters.allSizesLabel}
                    </MenuItem>
                    {sizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>
                    {collectionPageContent.filters.priceLabel}
                  </InputLabel>
                  <Select
                    label={collectionPageContent.filters.priceLabel}
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: brand.border,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: brand.primary,
                      },
                    }}
                  >
                    {collectionPageContent.filters.priceOptions.map(
                      (option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>

                <AppButton
                  variant="outlined"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    borderColor: brand.primary,
                    color: brand.primary,
                    "&:hover": {
                      borderColor: brand.hover,
                      backgroundColor: brand.borderSoft,
                    },
                    "&.Mui-disabled": {
                      borderColor: brand.borderSoft,
                      color: brand.textMuted,
                    },
                  }}
                >
                  {collectionPageContent.filters.resetLabel}
                </AppButton>
              </Box>
            )}

            {hasActiveFilters && (
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {searchQuery.trim() && (
                  <Chip
                    label={`Search: ${searchQuery.trim()}`}
                    onDelete={() => setSearchQuery("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {sizeFilter !== "all" && (
                  <Chip
                    label={`Size: ${sizeFilter}`}
                    onDelete={() => setSizeFilter("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {priceFilter !== "all" && (
                  <Chip
                    label={
                      priceFilter === "under-3000"
                        ? "Price: Under Rs 3,000"
                        : priceFilter === "3000-5000"
                          ? "Price: Rs 3,000 - Rs 5,000"
                          : "Price: Above Rs 5,000"
                    }
                    onDelete={() => setPriceFilter("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Paper>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              px: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GridViewOutlined sx={{ color: brand.primary, fontSize: 20 }} />
              <Typography
                sx={{
                  color: brand.textMuted,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 500,
                }}
              >
                Showing{" "}
                <Box
                  component="span"
                  sx={{ color: brand.primary, fontWeight: 600 }}
                >
                  {filteredCollection.length}
                </Box>{" "}
                {collectionPageContent.filters.curatedPiecesLabel}
              </Typography>
            </Stack>

            <Chip
              label={
                hasActiveFilters
                  ? collectionPageContent.filters.filteredViewLabel
                  : collectionPageContent.filters.allPiecesLabel
              }
              variant="outlined"
              sx={{
                borderColor: brand.primary,
                color: brand.primary,
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            />
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 10,
                gap: 2,
              }}
            >
              <CircularProgress size={50} sx={{ color: brand.primary }} />
              <Typography sx={{ color: brand.textMuted, fontSize: "1rem" }}>
                {collectionPageContent.states.loading}
              </Typography>
            </Box>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: brand.error, mb: 1 }}>
                {collectionPageContent.states.errorTitle}
              </Typography>
              <Typography sx={{ color: brand.textMuted }}>{error}</Typography>
            </Paper>
          ) : filteredCollection.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: 3,
                boxShadow: brand.shadowCard,
              }}
            >
              <SearchOutlined
                sx={{
                  fontSize: 64,
                  color: brand.primary,
                  opacity: 0.3,
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  color: brand.text,
                  fontWeight: 600,
                }}
              >
                {collectionPageContent.states.emptyTitle}
              </Typography>
              <Typography
                sx={{
                  mb: 3,
                  color: brand.textMuted,
                  fontSize: "1rem",
                }}
              >
                {collectionPageContent.states.emptyDescription}
              </Typography>
              <AppButton
                variant="contained"
                onClick={resetFilters}
                sx={{
                  background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                  borderRadius: "24px",
                  px: 4,
                }}
              >
                {collectionPageContent.states.clearFiltersLabel}
              </AppButton>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {filteredCollection.map((product, index) => {
                const badge = getBadgeForIndex(index);
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={getProductId(product)}
                  >
                    <Box>
                      {badge && (
                        <Chip
                          icon={badge.icon}
                          label={badge.label}
                          color={badge.color}
                          size="small"
                          sx={{
                            mb: 1,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      )}
                      <ProductCard
                        product={product}
                        hideWishlist={false}
                        hideQuickAdd={false}
                        soldOutLabel={collectionPageContent.states.soldOutLabel}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* <Box
        sx={{
          bgcolor: brand.surface,
          py: { xs: 6, md: 9 },
          borderTop: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container>
          <Box sx={{ mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: brand.text,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              {collectionPageContent.craftSection.title}
            </Typography>
            <Typography
              sx={{
                color: brand.textMuted,
                fontSize: { xs: "1rem", sm: "1.0625rem" },
                maxWidth: 700,
              }}
            >
              {collectionPageContent.craftSection.description}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {collectionPageContent.craftImages.map((craft, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 3,
                    border: `1px solid ${brand.borderSoft}`,
                    bgcolor: brand.bg,
                    transition: "all 0.3s ease",
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
                      height: { xs: 220, sm: 260 },
                    }}
                  >
                    <Box
                      component="img"
                      src={craft.url}
                      alt={craft.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={1}
                    >
                      <CheckCircleOutline
                        sx={{ color: brand.primary, fontSize: 20 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: brand.text,
                          fontSize: { xs: "1.0625rem", sm: "1.125rem" },
                        }}
                      >
                        {craft.title}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        color: brand.textMuted,
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                        lineHeight: 1.7,
                      }}
                    >
                      {craft.description}
                    </Typography>
                  </CardContent>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box> */}

      <Box
        sx={{
          background: `linear-gradient(135deg, ${brand.primary}12, ${brand.hover}12)`,
          py: { xs: 5, md: 7 },
          textAlign: "center",
          px: 3,
          borderTop: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              letterSpacing: { xs: 2, md: 3 },
              fontWeight: 600,
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
            }}
          >
            {collectionPageContent.cta.title}
          </Typography>
          <Divider
            sx={{
              width: { xs: "60px", sm: "80px" },
              height: "3px",
              mx: "auto",
              mb: 3,
              background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              borderRadius: "3px",
            }}
          />
          <Typography
            sx={{
              maxWidth: 760,
              mx: "auto",
              color: brand.textMuted,
              fontSize: { xs: "1rem", sm: "1.0625rem", md: "1.125rem" },
              lineHeight: 1.9,
              mb: 4,
            }}
          >
            {collectionPageContent.cta.description}
          </Typography>
          <AppButton
            component={Link}
            href={collectionPageContent.cta.buttonHref}
            size="large"
            sx={{
              px: 5,
              py: 1.75,
              borderRadius: "30px",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              fontWeight: 600,
              background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
              color: "#FFFFFF",
              boxShadow: brand.shadowButton,
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: brand.shadowCardStrong,
                background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
              },
            }}
          >
            {collectionPageContent.cta.buttonLabel}
          </AppButton>
        </Container>
      </Box>
    </Box>
  );
}
