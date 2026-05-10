export const shopPageContent = {
  sortOptions: [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "newest", label: "Newest First" },
  ],
  hero: {
    videoSrc: "/shopvideo.mp4",
    title: "SHARQ LABEL",
    eyebrow: "REFINED. FEARLESS. DISTINCT.",
    subtitle: "Luxury is not what you wear. It is how you carry it.",
    quote: '"True luxury whispers. It does not shout."',
    sectionTitle: "Shop The Best of \"SHARQ\"",
  },
  filters: {
    title: "Filters & Sorting",
    activeLabel: "Active",
    toggleLabels: {
      hide: "Hide",
      show: "Show",
    },
    searchLabel: "Search products",
    searchPlaceholder: "Search...",
    categoryLabel: "Category",
    collectionLabel: "Collection",
    availabilityLabel: "Availability",
    sortLabel: "Sort By",
    categoryAllLabel: "All Categories",
    collectionAllLabel: "All Collections",
    availabilityOptions: [
      { value: "all", label: "All" },
      { value: "in-stock", label: "In Stock" },
      { value: "low-stock", label: "Low Stock (<10)" },
      { value: "out-of-stock", label: "Out Of Stock" },
    ],
    resetLabel: "Reset Filters",
  },
  states: {
    loading: "Loading products...",
    errorTitle: "Error loading products",
    emptyTitle: "No products found",
    emptyDescription: "Try adjusting your filters or search query",
    clearFiltersLabel: "Clear All Filters",
  },
  results: {
    showingLabel: "Showing",
    ofLabel: "of",
    productsLabel: "products",
    pageLabel: "Page",
  },
  cta: {
    title: "More Than Fashion",
    description:
      "SHARQ LABEL represents individuality, confidence, and modern elegance. Every stitch reflects intention. Every silhouette commands presence. This is not clothing. This is identity.",
  },
};
