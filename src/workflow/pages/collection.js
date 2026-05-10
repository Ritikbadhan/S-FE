export const collectionPageContent = {
  craftImages: [
    {
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      title: "Fabric Close-Up",
      description: "Dense texture chosen for structure and durability.",
    },
    {
      url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      title: "Tailoring Line",
      description: "Engineered seams built for sharp silhouette.",
    },
    {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      title: "Stitch Precision",
      description: "Clean finishing for a refined final expression.",
    },
  ],
  features: [
    {
      iconKey: "inspiration",
      title: "Inspiration",
      description:
        "Evening skylines, sculpted architecture, and the discipline of clean lines.",
    },
    {
      iconKey: "fabric",
      title: "Fabric",
      description:
        "Structured cottons, compact twills, and brushed blends chosen for weight and fall.",
    },
    {
      iconKey: "mood",
      title: "Mood",
      description: "Composed, deliberate, and quietly assertive in every setting.",
    },
    {
      iconKey: "vision",
      title: "Vision",
      description:
        "Build a lasting wardrobe through pieces that mature into personal signatures.",
    },
  ],
  hero: {
    imageSrc: "/CollectionImage.jpeg",
    title: "THE COLLECTION",
    eyebrow: "STRUCTURED. MODERN. DELIBERATE.",
    subtitle:
      "A collection built on clean architecture, sharp restraint, and quiet confidence.",
    quote: '"Precision in silhouette. Confidence in every line."',
    storyTitle: "The \"SHARQ\" Collection Story",
    storyDescription:
      "A study in quiet confidence and precise structure. This collection refines everyday dressing with controlled silhouettes, textured fabrics, and a palette drawn from dusk cityscapes and architectural shadows.",
    productsTitle: "Discover The Collection",
  },
  filters: {
    title: "Filters & Sorting",
    activeLabel: "Active",
    toggleLabels: {
      hide: "Hide",
      show: "Show",
    },
    searchLabel: "Search collection",
    searchPlaceholder: "Search pieces, category, collection...",
    sizeLabel: "Size",
    priceLabel: "Price Range",
    allSizesLabel: "All Sizes",
    priceOptions: [
      { value: "all", label: "All Prices" },
      { value: "under-3000", label: "Under Rs 3,000" },
      { value: "3000-5000", label: "Rs 3,000 - Rs 5,000" },
      { value: "above-5000", label: "Above Rs 5,000" },
    ],
    resetLabel: "Reset Filters",
    filteredViewLabel: "Filtered View",
    allPiecesLabel: "All Pieces",
    curatedPiecesLabel: "curated pieces",
  },
  states: {
    loading: "Loading collection...",
    errorTitle: "Error loading collection",
    emptyTitle: "No products match your filters",
    emptyDescription: "Try adjusting your filters or search query",
    clearFiltersLabel: "Clear All Filters",
    soldOutLabel: "Out of Stock",
  },
  badges: [
    { label: "Statement Piece", iconKey: "statement", color: "secondary" },
    { label: "Best Seller", iconKey: "bestSeller", color: "warning" },
    { label: "Limited Piece", iconKey: "limited", color: "error" },
  ],
  // craftSection: {
  //   title: "Behind The Craft",
  //   description:
  //     "Material precision, technical stitching, and finishing discipline that defines our commitment to excellence.",
  // },
  cta: {
    title: "Discover Your Identity",
    description:
      "Move beyond trends. Build a wardrobe that speaks before you do. Each piece is a statement of intent, crafted for those who understand that true luxury lies in timeless design.",
    buttonLabel: "Explore Full Collection",
    buttonHref: "/shop",
  },
};
