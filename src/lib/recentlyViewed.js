const RECENTLY_VIEWED_KEY = "recently_viewed_products";
const MAX_RECENTLY_VIEWED = 16;

export function getRecentlyViewedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    return [];
  }
}

export function addRecentlyViewedId(productId) {
  if (typeof window === "undefined") return [];
  const id = String(productId || "").trim();
  if (!id) return getRecentlyViewedIds();

  const current = getRecentlyViewedIds();
  const next = [id, ...current.filter((item) => item !== id)].slice(
    0,
    MAX_RECENTLY_VIEWED
  );
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  return next;
}
