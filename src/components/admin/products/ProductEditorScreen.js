"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Alert, 
  Snackbar, 
  Box,
  CircularProgress,
  Fade,
  IconButton,
  useTheme,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/navigation";

import ProductEditorTab from "./ProductEditorTab";

import {
  cloneProductForm,
  createEmptyVariant,
  createInitialForm,
  normalizeProductToForm,
  readFileAsDataUrl,
  toSlug,
  validateForm,
} from "./productFormUtils";

import { categoriesApi, productsApi } from "@/lib/api";

export default function ProductEditorScreen({ productId = "" }) {
  const router = useRouter();
  const theme = useTheme();
  const isEditing = Boolean(productId);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => createInitialForm());
  const [initialForm, setInitialForm] = useState(() => createInitialForm());

  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [uploading, setUploading] = useState(false);
  const [dragImageId, setDragImageId] = useState("");

  const [loading, setLoading] = useState(isEditing);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const totalStock = useMemo(
    () =>
      form.variants.reduce(
        (sum, variant) => sum + Math.max(0, Number(variant.stock || 0)),
        0
      ),
    [form.variants]
  );

  const selectedCategoryValue = useMemo(() => {
    if (form.categoryId) return form.categoryId;

    const match = categories.find(
      (category) => category.slug === form.category
    );

    return match ? match._id || match.id : "";
  }, [categories, form.category, form.categoryId]);

  /* ---------------- Load Categories ---------------- */

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) =>
        setCategories(data?.categories || data?.data || data || [])
      )
      .catch((err) => setError(err.message || "Failed to load categories"));
  }, []);

  /* ---------------- Load Product ---------------- */

  useEffect(() => {
    if (!isEditing) {
      const nextForm = createInitialForm();
      setForm(nextForm);
      setInitialForm(cloneProductForm(nextForm));
      setLoading(false);
      return;
    }

    setLoading(true);

    productsApi
      .getById(productId)
      .then((data) => {
        const product = data?.product || data?.data || data;
        const normalized = normalizeProductToForm(product);

        setForm(normalized);
        setInitialForm(cloneProductForm(normalized));
      })
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [isEditing, productId]);

  /* ---------------- Field Updates ---------------- */

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateVariant = (index, key, value) => {
    setForm((prev) => {
      const nextVariants = prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [key]: value } : variant
      );
      return { ...prev, variants: nextVariants };
    });
  };

  /* ---------------- Category ---------------- */

  const handleCategoryChange = (value) => {
    const selected = categories.find(
      (category) => String(category._id || category.id) === String(value)
    );

    setForm((prev) => ({
      ...prev,
      categoryId: value,
      category: selected?.slug || "",
    }));

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.category;
      return next;
    });
  };

  /* ---------------- Images ---------------- */

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded = await Promise.all(
        files.map(async (file, index) => ({
          id: `upload_${Date.now()}_${index}`,
          src: await readFileAsDataUrl(file),
          name: file.name,
        }))
      );

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));

      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const moveImage = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;

    setForm((prev) => {
      const fromIndex = prev.images.findIndex((img) => img.id === fromId);
      const toIndex = prev.images.findIndex((img) => img.id === toId);

      if (fromIndex < 0 || toIndex < 0) return prev;

      const nextImages = [...prev.images];

      const [moved] = nextImages.splice(fromIndex, 1);

      nextImages.splice(toIndex, 0, moved);

      return { ...prev, images: nextImages };
    });
  };

  const removeImage = (imageId) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  /* ---------------- Variants ---------------- */

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants:
        prev.variants.length > 1
          ? prev.variants.filter((_, i) => i !== index)
          : prev.variants,
    }));
  };

  /* ---------------- Reset ---------------- */

  const handleReset = () => {
    setForm(cloneProductForm(initialForm));
    setFormErrors({});
    setDragImageId("");
    setError("");
  };

  /* ---------------- Payload ---------------- */

  const buildPayload = () => {
    const cleanedCare = form.careInstructions
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const variants = form.variants.map((variant, index) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color.trim(),
      colorHex: variant.colorHex || "#111111",
      stock: Math.max(0, Number(variant.stock || 0)),
      sku: `${toSlug(form.name) || "product"}-${variant.size}-${index + 1}`,
    }));

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      categoryId: form.categoryId || undefined,
      collection: form.collection.trim(),
      price: Number(form.price || 0),
      mrp: Number(form.mrp || 0),
      originalPrice: Number(form.originalPrice || form.mrp || 0),
      stock: totalStock,
      images: form.images.map((image) => image.src).filter(Boolean),
      variants,
      colors: Array.from(new Set(variants.map((v) => v.color))),
      isNew: Boolean(form.isNew),
      isBestSeller: Boolean(form.isBestSeller),
      isLimited: Boolean(form.isLimited),
      slug: toSlug(form.slug || form.name),
      productSpecifications: {
        material: form.material.trim(),
        fit: form.fit.trim(),
        pattern: form.pattern.trim(),
        neckline: form.neckline.trim(),
        sleeveType: form.sleeveType.trim(),
        careInstructions: cleanedCare,
      },
      seo: {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
      },
    };
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationErrors = validateForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      const firstError = Object.values(validationErrors)[0];

      setToast({
        open: true,
        message: firstError || "Fix the highlighted fields",
        severity: "error",
      });

      setTimeout(() => {
        document.querySelector(".Mui-error")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return;
    }

    try {
      const payload = buildPayload();

      if (isEditing) {
        await productsApi.update(productId, payload);
      } else {
        await productsApi.create(payload);
      }

      setToast({
        open: true,
        message: isEditing
          ? "Product updated successfully"
          : "Product created successfully",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (err) {
      setToast({
        open: true,
        message: err.message || "Failed to save product",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      {error ? (
        <Fade in timeout={400}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ 
              mb: { xs: 2, sm: 2.5, md: 3 },
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

      {loading ? (
        <Fade in timeout={400}>
          <Alert 
            severity="info"
            icon={<CircularProgress size={20} thickness={4} />}
            sx={{
              mb: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5 },
              border: `1px solid ${theme.palette.info.light}`,
              boxShadow: `0 4px 12px ${theme.palette.info.light}30`,
              fontSize: { xs: "0.875rem", sm: "0.938rem" },
              fontWeight: 500,
              background: `linear-gradient(135deg, ${theme.palette.info.light}10, ${theme.palette.info.light}05)`,
              "& .MuiAlert-icon": {
                fontSize: { xs: 22, sm: 24 },
              },
            }}
          >
            Loading product editor...
          </Alert>
        </Fade>
      ) : (
        <Fade in timeout={400}>
          <Box>
            <ProductEditorTab
              form={form}
              formErrors={formErrors}
              categories={categories}
              selectedCategoryValue={selectedCategoryValue}
              totalStock={totalStock}
              uploading={uploading}
              dragImageId={dragImageId}
              isEditing={isEditing}
              onSubmit={handleSubmit}
              onBackToList={() => router.push("/admin/products")}
              onReset={handleReset}
              onFieldChange={updateField}
              onCategoryChange={handleCategoryChange}
              onImageUpload={handleImageUpload}
              onImageDragStart={setDragImageId}
              onImageDrop={(fromId, toId) => {
                moveImage(fromId, toId);
                setDragImageId("");
              }}
              onImageRemove={removeImage}
              onVariantChange={updateVariant}
              onVariantAdd={addVariant}
              onVariantRemove={removeVariant}
            />
          </Box>
        </Fade>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
        sx={{
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
        }}
      >
        <MuiAlert
          severity={toast.severity}
          variant="filled"
          icon={
            toast.severity === "success" ? (
              <CheckCircleIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            ) : toast.severity === "error" ? (
              <ErrorIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            ) : (
              <InfoIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            )
          }
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{
            minWidth: { xs: 280, sm: 320, md: 360 },
            borderRadius: { xs: 2, sm: 2.5 },
            fontSize: { xs: "0.875rem", sm: "0.938rem" },
            fontWeight: 600,
            boxShadow: theme.palette.brand?.shadowCardStrong || "0 12px 28px rgba(0,0,0,0.25)",
            backdropFilter: "blur(10px)",
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1.5, sm: 2 },
            alignItems: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.palette.brand?.shadowCardStrong || "0 14px 32px rgba(0,0,0,0.3)",
            },
            "& .MuiAlert-icon": {
              fontSize: { xs: 22, sm: 24 },
              mr: { xs: 1, sm: 1.5 },
            },
            "& .MuiAlert-message": {
              fontSize: { xs: "0.875rem", sm: "0.938rem" },
              fontWeight: 600,
              py: 0.5,
            },
            "& .MuiAlert-action": {
              ml: { xs: 1, sm: 2 },
              mr: -0.5,
              "& .MuiIconButton-root": {
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "rotate(90deg)",
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              },
            },
            ...(toast.severity === "success" && {
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              border: `1px solid ${theme.palette.success.light}`,
            }),
            ...(toast.severity === "error" && {
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              border: `1px solid ${theme.palette.error.light}`,
            }),
            ...(toast.severity === "info" && {
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              border: `1px solid ${theme.palette.info.light}`,
            }),
          }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
