"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Fade,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useRouter } from "next/navigation";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductListTab from "@/components/admin/products/ProductListTab";

import { categoriesApi, productsApi } from "@/lib/api";

export default function AdminProductsPage() {
  const router = useRouter();

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
      setError(err.message || "Failed to load products")
    );
  }, [categoryFilter, collectionFilter]);

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) =>
        setCategories(data?.categories || data?.data || data || [])
      )
      .catch((err) =>
        setError(err.message || "Failed to load categories")
      );
  }, []);

  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);

      setSuccess("Product deleted successfully!");
      setError("");

      await loadProducts();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to delete product");
      setSuccess("");
    }
  };


  return (
    <AdminGuard>
      <AdminShell title="Products">
        <Box
          sx={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {(error || success) && (
            <Box sx={{ mb: 3 }}>
              {error && (
                <Fade in timeout={300}>
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                    action={
                      <IconButton
                        size="small"
                        onClick={() => setError("")}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid rgba(239,68,68,0.12)",
                      background: "#fff",
                      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {success && (
                <Fade in timeout={300}>
                  <Alert
                    severity="success"
                    onClose={() => setSuccess("")}
                    action={
                      <IconButton
                        size="small"
                        onClick={() => setSuccess("")}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid rgba(34,197,94,0.12)",
                      background: "#fff",
                      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}
            </Box>
          )}

   

          {/* ========================= */}
          {/* PRODUCTS TABLE CARD */}
          {/* ========================= */}

        
            <ProductListTab
              products={products}
              categories={categories}
              categoryFilter={categoryFilter}
              collectionFilter={collectionFilter}
              onCategoryFilterChange={setCategoryFilter}
              onCollectionFilterChange={setCollectionFilter}
              onAddProduct={() =>
                router.push("/admin/products/new")
              }
              onEditProduct={(product) =>
                router.push(
                  `/admin/products/${product._id || product.id}`
                )
              }
              onDeleteProduct={handleDelete}
            />
        </Box>
      </AdminShell>
    </AdminGuard>
  );
}