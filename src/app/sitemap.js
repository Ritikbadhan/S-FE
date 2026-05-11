const siteUrl =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "https://sharqlabel.in";

const routes = [
  "",
  "/shop",
  "/collection",
  "/new-arrivals",
  "/shirts",
  "/tees",
  "/about",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/privacy-policy",
  "/terms",
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.7 : 1,
  }));
}
