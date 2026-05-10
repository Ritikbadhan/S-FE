"use client";

import { useEffect, useState } from "react";
import { 
  Alert, 
  Box,
  Fade,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductListTab from "@/components/admin/products/ProductListTab";
import { categoriesApi, productsApi } from "@/lib/api";

export default function AdminProductsPage() {
  const router = useRouter();
  const theme = useTheme();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = async () => {
    const data = await productsApi.list({
      category: categoryFilter || undefined,
      collection: collectionFilter || undefined,
    });
    setProducts(data?.products || data?.data || data || []);
  };

  useEffect(() => {
    loadProducts().catch((err) =>
      setError(err.message || "Failed to load products"),
    );
  }, [categoryFilter, collectionFilter]);

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) =>
        setCategories(data?.categories || data?.data || data || []),
      )
      .catch((err) => setError(err.message || "Failed to load categories"));
  }, []);

  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);
      setSuccess("Product deleted successfully!");
      setError("");
      await loadProducts();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete product");
      setSuccess("");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Products">
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          {error ? (
            <Fade in timeout={400}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: { xs: 2, sm: 2.5 },
                  border: `1px solid ${theme.palette.error.light}`,
                  boxShadow: `0 4px 12px ${theme.palette.error.light}30`,
                  fontSize: { xs: "0.875rem", sm: "0.938rem" },
                  fontWeight: 500,
                  background: `linear-gradient(135deg, ${theme.palette.error.light}10, ${theme.palette.error.light}05)`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: `0 6px 16px ${theme.palette.error.light}40`,
                    transform: "translateY(-2px)",
                  },
                  "& .MuiAlert-icon": {
                    fontSize: { xs: 22, sm: 24 },
                  },
                }}
                onClose={() => setError("")}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setError("")}
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "rotate(90deg)",
                        backgroundColor: theme.palette.error.light + "20",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Fade>
          ) : null}
          
          {success ? (
            <Fade in timeout={400}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  borderRadius: { xs: 2, sm: 2.5 },
                  border: `1px solid ${theme.palette.success.light}`,
                  boxShadow: `0 4px 12px ${theme.palette.success.light}30`,
                  fontSize: { xs: "0.875rem", sm: "0.938rem" },
                  fontWeight: 500,
                  background: `linear-gradient(135deg, ${theme.palette.success.light}10, ${theme.palette.success.light}05)`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: `0 6px 16px ${theme.palette.success.light}40`,
                    transform: "translateY(-2px)",
                  },
                  "& .MuiAlert-icon": {
                    fontSize: { xs: 22, sm: 24 },
                  },
                }}
                onClose={() => setSuccess("")}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setSuccess("")}
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "rotate(90deg)",
                        backgroundColor: theme.palette.success.light + "20",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {success}
              </Alert>
            </Fade>
          ) : null}
        </Box>

        <ProductListTab
          products={products}
          categories={categories}
          categoryFilter={categoryFilter}
          collectionFilter={collectionFilter}
          onCategoryFilterChange={setCategoryFilter}
          onCollectionFilterChange={setCollectionFilter}
          onAddProduct={() => router.push("/admin/products/new")}
          onEditProduct={(product) =>
            router.push(`/admin/products/${product._id || product.id}`)
          }
          onDeleteProduct={handleDelete}
        />
      </AdminShell>
    </AdminGuard>
  );
}
