"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  InputAdornment,
} from "@mui/material";
import {
  SearchOutlined,
  FilterListOutlined,
  GridViewOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import ProductCard from "../../components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { AppButton, AppInput } from "@/components/common";
import { shopPageContent } from "@/workflow/pages/shop";

const ITEMS_PER_PAGE = 8;

const getProductId = (product) =>
  product?._id || product?.id || product?.productId;
const getProductName = (product) => product?.name || "";
const getProductPrice = (product) => Number(product?.price || 0);
const getProductCategory = (product) =>
  String(product?.category || "uncategorized").toLowerCase();
const getProductCollection = (product) =>
  String(product?.collection || "general").toLowerCase();
const getProductStock = (product) => Number(product?.stock ?? 999);
const getProductCreatedAt = (product) =>
  new Date(product?.createdAt || product?.updatedAt || 0).getTime() || 0;
const isNewProduct = (product) => Boolean(product?.isNew);

export default function ShopPage() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { products, loading, error } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedSort, setSelectedSort] = useState("featured");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(getProductCategory)));
    return unique.filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const collections = useMemo(() => {
    const unique = Array.from(new Set(products.map(getProductCollection)));
    return unique.filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        getProductName(product).toLowerCase().includes(query) ||
        getProductCategory(product).includes(query) ||
        getProductCollection(product).includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        getProductCategory(product) === selectedCategory;

      const matchesCollection =
        selectedCollection === "all" ||
        getProductCollection(product) === selectedCollection;

      const stock = getProductStock(product);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 0) ||
        (stockFilter === "low-stock" && stock > 0 && stock < 10) ||
        (stockFilter === "out-of-stock" && stock <= 0);

      return (
        matchesSearch && matchesCategory && matchesCollection && matchesStock
      );
    });

    const sorted = [...filtered];
    switch (selectedSort) {
      case "price-asc":
        sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "name-asc":
        sorted.sort((a, b) =>
          getProductName(a).localeCompare(getProductName(b), undefined, {
            sensitivity: "base",
          }),
        );
        break;
      case "name-desc":
        sorted.sort((a, b) =>
          getProductName(b).localeCompare(getProductName(a), undefined, {
            sensitivity: "base",
          }),
        );
        break;
      case "newest":
        sorted.sort((a, b) => getProductCreatedAt(b) - getProductCreatedAt(a));
        break;
      case "featured":
      default:
        sorted.sort(
          (a, b) => Number(isNewProduct(b)) - Number(isNewProduct(a)),
        );
        break;
    }

    return sorted;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedCollection,
    selectedSort,
    stockFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedCollection,
    selectedSort,
    stockFilter,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCollection("all");
    setSelectedSort("featured");
    setStockFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedCollection !== "all" ||
    stockFilter !== "all" ||
    selectedSort !== "featured";

  return (
    <>
      {/* Hero Section */}
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
          component="video"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={shopPageContent.hero.videoSrc} type="video/mp4" />
        </Box>

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${brand.overlayStrong}, ${brand.overlaySoft})`,
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: "900px",
          }}
        >
          <Fade in timeout={1000}>
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
              {shopPageContent.hero.title}
            </Typography>
          </Fade>

          <Fade in timeout={1200}>
            <Typography
              sx={{
                letterSpacing: { xs: 3, sm: 4, md: 6 },
                color: brand.accent,
                fontWeight: 300,
                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                mb: { xs: 2, sm: 3 },
              }}
            >
              {shopPageContent.hero.eyebrow}
            </Typography>
          </Fade>

          <Fade in timeout={1400}>
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                color: "rgba(255, 255, 255, 0.9)",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              {shopPageContent.hero.subtitle}
            </Typography>
          </Fade>
        </Box>
      </Box>

      {/* Quote Section */}
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
            {shopPageContent.hero.quote}
          </Typography>
        </Container>
      </Box>

      {/* Products Section */}
      <Box
        sx={{
          bgcolor: brand.bg,
          py: { xs: 4, md: 6 },
          minHeight: "60vh",
        }}
      >
        <Container maxWidth="xl">
          {/* Page Title */}
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
              {shopPageContent.hero.sectionTitle}
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

          {/* Filters Section */}
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
            {/* Filter Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
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
                  {shopPageContent.filters.title}
                </Typography>
                {hasActiveFilters && (
                  <Chip
                    label={shopPageContent.filters.activeLabel}
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
                  {showFilters ? shopPageContent.filters.toggleLabels.hide : shopPageContent.filters.toggleLabels.show}
                </AppButton>
              )}
            </Box>

            {/* Filter Controls */}
            {(!isMobile || showFilters) && (
              <Box
                sx={{
                  display: "grid",
                  gap: { xs: 2, sm: 2.5 },
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(6, 1fr)",
                  },
                }}
              >
                <Box sx={{ gridColumn: { xs: "1 / -1", lg: "span 2" } }}>
                  <AppInput
                    label={shopPageContent.filters.searchLabel}
                    placeholder={shopPageContent.filters.searchPlaceholder}
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
                          theme.palette.mode === "dark" ? brand.bg : "transparent",
                        "&:hover": {
                          borderColor: brand.primary,
                        },
                      },
                    }}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>{shopPageContent.filters.categoryLabel}</InputLabel>
                  <Select
                    label={shopPageContent.filters.categoryLabel}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    <MenuItem value="all">{shopPageContent.filters.categoryAllLabel}</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{shopPageContent.filters.collectionLabel}</InputLabel>
                  <Select
                    label={shopPageContent.filters.collectionLabel}
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
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
                    <MenuItem value="all">{shopPageContent.filters.collectionAllLabel}</MenuItem>
                    {collections.map((collection) => (
                      <MenuItem key={collection} value={collection}>
                        {collection.charAt(0).toUpperCase() + collection.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{shopPageContent.filters.availabilityLabel}</InputLabel>
                  <Select
                    label={shopPageContent.filters.availabilityLabel}
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
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
                    {shopPageContent.filters.availabilityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{shopPageContent.filters.sortLabel}</InputLabel>
                  <Select
                    label={shopPageContent.filters.sortLabel}
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
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
                    {shopPageContent.sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
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
                  {shopPageContent.filters.resetLabel}
                </AppButton>
              </Box>
            )}
          </Paper>

          {/* Results Info */}
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
                {shopPageContent.results.showingLabel}{" "}
                <Box
                  component="span"
                  sx={{ color: brand.primary, fontWeight: 600 }}
                >
                  {paginatedProducts.length}
                </Box>{" "}
                {shopPageContent.results.ofLabel}{" "}
                <Box
                  component="span"
                  sx={{ color: brand.primary, fontWeight: 600 }}
                >
                  {filteredProducts.length}
                </Box>{" "}
                {shopPageContent.results.productsLabel}
              </Typography>
            </Stack>

            <Chip
              label={`${shopPageContent.results.pageLabel} ${currentPage} ${shopPageContent.results.ofLabel} ${totalPages}`}
              variant="outlined"
              sx={{
                borderColor: brand.primary,
                color: brand.primary,
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            />
          </Box>

          {/* Products Grid or Loading/Error States */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                py: 10,
                gap: 2,
              }}
            >
              <CircularProgress
                size={50}
                sx={{ color: brand.primary }}
              />
              <Typography sx={{ color: brand.textMuted, fontSize: "1rem" }}>
                {shopPageContent.states.loading}
              </Typography>
            </Box>
          ) : error ? (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: brand.surface,
                border: `1px solid ${brand.borderSoft}`,
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: brand.error, mb: 1 }}
              >
                {shopPageContent.states.errorTitle}
              </Typography>
              <Typography sx={{ color: brand.textMuted }}>
                {error}
              </Typography>
            </Paper>
          ) : filteredProducts.length === 0 ? (
            <Paper
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
                {shopPageContent.states.emptyTitle}
              </Typography>
              <Typography
                sx={{
                  mb: 3,
                  color: brand.textMuted,
                  fontSize: "1rem",
                }}
              >
                {shopPageContent.states.emptyDescription}
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
                {shopPageContent.states.clearFiltersLabel}
              </AppButton>
            </Paper>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {paginatedProducts.map((product) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={getProductId(product)}
                  >
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: { xs: 4, md: 6 },
                  }}
                >
                  <Pagination
                    color="primary"
                    page={currentPage}
                    count={totalPages}
                    onChange={(_, page) => setCurrentPage(page)}
                    shape="rounded"
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: 2,
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: brand.shadowButton,
                        },
                      },
                      "& .Mui-selected": {
                        background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd}) !important`,
                        color: "#FFFFFF",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Bottom CTA Section */}
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
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 600,
              letterSpacing: { xs: 2, md: 3 },
              color: brand.text,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
            }}
          >
            {shopPageContent.cta.title}
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
              maxWidth: "850px",
              margin: "0 auto",
              lineHeight: 1.9,
              color: brand.textMuted,
              fontSize: { xs: "1rem", sm: "1.0625rem", md: "1.125rem" },
            }}
          >
            {shopPageContent.cta.description}
        </Typography>
      </Container>
      </Box>
    </>
  );
}
