"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ProductCard from "@/components/product/ProductCard";
import { AppButton } from "@/components/common";
import { useProducts } from "@/hooks/useProducts";

const getProductId = (product) => product?._id || product?.id || product?.productId;
const toText = (value) => String(value || "").toLowerCase();

export default function CategoryListingPage({ title, subtitle, keywords = [] }) {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const { products, loading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    const normalizedKeywords = keywords.map((item) => toText(item)).filter(Boolean);
    return products.filter((product) => {
      const category = toText(product?.category);
      const collection = toText(product?.collection);
      const name = toText(product?.name);
      return normalizedKeywords.some(
        (keyword) =>
          category.includes(keyword) ||
          collection.includes(keyword) ||
          name.includes(keyword),
      );
    });
  }, [products, keywords]);

  return (
    <Box sx={{ bgcolor: brand.bg }}>
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          background: `linear-gradient(135deg, ${brand.primary}14, ${brand.hover}10)`,
          borderBottom: `1px solid ${brand.borderSoft}`,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              color: brand.text,
              fontWeight: 700,
              letterSpacing: { xs: 1.5, md: 3 },
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Divider
            sx={{
              width: 80,
              mx: "auto",
              mb: 3,
              height: 3,
              borderColor: "transparent",
              background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
            }}
          />
          <Typography
            sx={{
              textAlign: "center",
              color: brand.textMuted,
              lineHeight: 1.8,
              maxWidth: 720,
              mx: "auto",
            }}
          >
            {subtitle}
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 }, minHeight: "60vh" }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              px: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GridViewOutlinedIcon sx={{ color: brand.primary, fontSize: 20 }} />
              <Typography sx={{ color: brand.textMuted, fontWeight: 500 }}>
                Showing <Box component="span" sx={{ color: brand.primary, fontWeight: 700 }}>{filteredProducts.length}</Box> products
              </Typography>
            </Stack>
            <Chip
              label={title}
              variant="outlined"
              sx={{ borderColor: brand.primary, color: brand.primary, fontWeight: 600 }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
              <CircularProgress size={50} sx={{ color: brand.primary }} />
              <Typography sx={{ color: brand.textMuted }}>Loading products...</Typography>
            </Box>
          ) : error ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: brand.surface, border: `1px solid ${brand.borderSoft}` }}>
              <Typography variant="h6" sx={{ color: brand.error, mb: 1 }}>Error loading products</Typography>
              <Typography sx={{ color: brand.textMuted }}>{error}</Typography>
            </Paper>
          ) : filteredProducts.length === 0 ? (
            <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, textAlign: "center", borderRadius: 3, bgcolor: brand.surface, border: `1px solid ${brand.borderSoft}`, boxShadow: brand.shadowCard }}>
              <SearchOutlinedIcon sx={{ fontSize: 64, color: brand.primary, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: brand.text, fontWeight: 600 }}>
                No matching products found
              </Typography>
              <Typography sx={{ mb: 3, color: brand.textMuted }}>
                Browse the full catalog to discover all available pieces.
              </Typography>
              <AppButton component={Link} href="/shop">
                View All Products
              </AppButton>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={getProductId(product)}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
