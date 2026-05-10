export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "FREE"];

export const COLLECTION_OPTIONS = [
  "Signature",
  "Classic",
  "Core",
  "Limited",
  "Seasonal",
  "Essentials",
];

export const createEmptyVariant = () => ({
  id: `variant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  size: "M",
  color: "Black",
  colorHex: "#111111",
  stock: 0,
});

export function createInitialForm() {
  return {
    name: "",
    description: "",
    category: "",
    categoryId: "",
    collection: "Signature",
    price: "",
    mrp: "",
    originalPrice: "",
    images: [],
    variants: [createEmptyVariant()],
    isNew: false,
    isBestSeller: false,
    isLimited: false,
    material: "",
    fit: "",
    pattern: "",
    neckline: "",
    sleeveType: "",
    careInstructions: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  };
}

export function toSlug(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatCurrency(value) {
  return `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function normalizeVariant(variant, index) {
  return {
    id: variant?.id || `variant_${index + 1}`,
    size: String(variant?.size || "M").toUpperCase(),
    color: variant?.color || "Black",
    colorHex: variant?.colorHex || "#111111",
    stock: Math.max(0, Number(variant?.stock || 0)),
  };
}

export function normalizeProductToForm(product) {
  const specs = product?.productSpecifications || {};
  const variants =
    Array.isArray(product?.variants) && product.variants.length
      ? product.variants.map(normalizeVariant)
      : [createEmptyVariant()];

  return {
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    categoryId: product?.categoryId || "",
    collection: product?.collection || "Signature",
    price: product?.price ?? "",
    mrp: product?.mrp ?? "",
    originalPrice: product?.originalPrice ?? "",
    images: Array.isArray(product?.images)
      ? product.images.filter(Boolean).map((src, index) => ({
          id: `image_${index}_${Date.now()}`,
          src,
          name: `Image ${index + 1}`,
        }))
      : [],
    variants,
    isNew: Boolean(product?.isNew),
    isBestSeller: Boolean(product?.isBestSeller),
    isLimited: Boolean(product?.isLimited),
    material: specs?.material || "",
    fit: specs?.fit || "",
    pattern: specs?.pattern || "",
    neckline: specs?.neckline || "",
    sleeveType: specs?.sleeveType || "",
    careInstructions: Array.isArray(specs?.careInstructions)
      ? specs.careInstructions.join("\n")
      : "",
    slug: product?.slug || "",
    metaTitle: product?.seo?.metaTitle || "",
    metaDescription: product?.seo?.metaDescription || "",
  };
}

export function validateForm(form) {
  const errors = {};

  const trimmedName = form.name.trim();
  const trimmedDescription = form.description.trim();
  const price = Number(form.price || 0);
  const mrp = Number(form.mrp || 0);
  const originalPrice = Number(form.originalPrice || 0);

  /* ---------------- Name ---------------- */

  if (!trimmedName) {
    errors.name = "Product name is required.";
  } else if (trimmedName.length < 3) {
    errors.name = "Product name must be at least 3 characters.";
  }

  /* ---------------- Description ---------------- */

  if (!trimmedDescription) {
    errors.description = "Description is required.";
  }

  /* ---------------- Category ---------------- */

  if (!form.categoryId) {
    errors.category = "Select a category.";
  }

  /* ---------------- Collection ---------------- */

  if (!COLLECTION_OPTIONS.includes(form.collection)) {
    errors.collection = "Invalid collection selected.";
  }

  /* ---------------- Pricing ---------------- */

  if (!(price > 0)) {
    errors.price = "Price must be greater than 0.";
  }

  if (originalPrice && originalPrice < price) {
    errors.originalPrice =
      "Original price must be greater than or equal to price.";
  }

  if (mrp && originalPrice && mrp < originalPrice) {
    errors.mrp = "MRP must be greater than original price.";
  }

  /* ---------------- Images ---------------- */

  if (!Array.isArray(form.images) || !form.images.length) {
    errors.images = "Upload at least one product image.";
  }

  /* ---------------- Variants ---------------- */

  const variantKeys = new Set();
  let totalStock = 0;

  if (!Array.isArray(form.variants) || !form.variants.length) {
    errors.variants = "Add at least one variant.";
  }

  form.variants.forEach((variant, index) => {
    const size = String(variant.size || "").toUpperCase();
    const color = String(variant.color || "").trim();
    const colorHex = String(variant.colorHex || "");
    const stock = Number(variant.stock || 0);

    /* Size validation */

    if (!SIZE_OPTIONS.includes(size)) {
      errors[`variant_size_${index}`] = "Invalid size selected.";
    }

    /* Color validation */

    if (!color) {
      errors[`variant_color_${index}`] = "Enter color name.";
    }

    /* Color hex validation */

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(colorHex)) {
      errors[`variant_colorHex_${index}`] = "Invalid hex color.";
    }

    /* Stock validation */

    if (stock < 0) {
      errors[`variant_stock_${index}`] = "Stock cannot be negative.";
    }

    totalStock += stock;

    /* Duplicate variant check */

    const key = `${size}_${color.toLowerCase()}`;

    if (variantKeys.has(key)) {
      errors[`variant_duplicate_${index}`] =
        "Duplicate size + color variant.";
    }

    variantKeys.add(key);
  });

  if (totalStock <= 0) {
    errors.variants = "Total stock must be greater than 0.";
  }

  /* ---------------- Slug ---------------- */

  const slug = form.slug.trim();

  if (slug && slug !== toSlug(slug)) {
    errors.slug =
      "Slug can contain lowercase letters, numbers and hyphens only.";
  }

  /* ---------------- SEO ---------------- */

  if (form.metaTitle && form.metaTitle.length > 70) {
    errors.metaTitle = "Meta title should be under 70 characters.";
  }

  if (form.metaDescription && form.metaDescription.length > 160) {
    errors.metaDescription =
      "Meta description should be under 160 characters.";
  }

  return errors;
}


export function cloneProductForm(form) {
  return {
    ...form,
    images: Array.isArray(form.images)
      ? form.images.map((image) => ({ ...image }))
      : [],
    variants: Array.isArray(form.variants)
      ? form.variants.map((variant) => ({ ...variant }))
      : [],
  };
}
