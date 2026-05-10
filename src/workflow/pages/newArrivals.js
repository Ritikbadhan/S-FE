export const newArrivalsPageContent = {
  sortOptions: [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "trending", label: "Trending" },
    { value: "most-viewed", label: "Most Viewed" },
  ],
  hero: {
    imageSrc: "/NewArrivals.jpeg",
    // dropDateLabel: "Drop Date: 28 February 2026",
    title: "NEW ARRIVALS",
    subtitle: "The Latest Expressions of SHARQ",
    description:
      "Precision-led essentials crafted for the season shift. Built in limited runs with a deliberate editorial lens.",
    ctaLabel: "Shop the Drop",
    ctaHref: "/shop",
    // nextDropPrefix: "Next Drop In:",
  },
  dropCard: {
    title: "Drop 02 - February Edit",
    description: "Limited Pieces. No Restocks. Updated weekly.",
    chips: [
      { label: "Limited Stock", color: "error", variant: "filled" },
      { label: "Updated Weekly", variant: "outlined" },
    ],
  },
  sections: {
    justDroppedTitle: "Just Dropped",
    trendingTitle: "Trending Now",
    trendingDescription: "Most added to cart and most viewed.",
    mostAddedTitle: "Most Added To Cart",
    mostViewedTitle: "Most Viewed",
    releasePrefix: "Release:",
  },
  states: {
    noCartTrendData: "No cart trend data yet.",
    noViewData: "No view data yet.",
  },
  labels: {
    new: "NEW",
    limited: "Limited",
  },
  cta: {
    title: "Designed To Lead",
    description:
      "Each drop is curated with intent. No excess. Just precision, presence, and identity.",
  },
};
