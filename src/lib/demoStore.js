import { products } from "@/data/products";

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function createInitialOrders(userId = "seed_admin", userEmail = "admin@sharqlabel.com") {
  const now = Date.now();
  return [
    {
      id: `ORD-${now}`,
      date: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      status: "Processing",
      total: 5298,
      totalAmount: 5298,
      paymentMethod: "Online",
      shippingAddress: "Noida, Uttar Pradesh",
      trackingId: "",
      isRefunded: false,
      isCancelled: false,
      userId,
      userEmail,
      items: [
        { productId: "prod_1", name: "Midnight Black Signature Tee", quantity: 1, price: 2499, size: "M", color: "Black" },
        { productId: "prod_2", name: "Ivory Luxe Shirt", quantity: 1, price: 2799, size: "L", color: "Ivory" },
      ],
    },
  ];
}

function normalizeProducts(list) {
  return list.map((item, index) => {
    const id = `prod_${item.id || index + 1}`;
    const baseStock = Number(item.stock ?? 24);
    const variants =
      Array.isArray(item.variants) && item.variants.length
        ? item.variants
        : [
            { id: `${id}_v1`, size: "S", color: "Black", stock: Math.max(0, Math.floor(baseStock * 0.3)) },
            { id: `${id}_v2`, size: "M", color: "Black", stock: Math.max(0, Math.floor(baseStock * 0.35)) },
            { id: `${id}_v3`, size: "L", color: "Black", stock: Math.max(0, Math.ceil(baseStock * 0.35)) },
          ];

    const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);

    return {
      ...item,
      id,
      _id: id,
      price: Number(item.price || 0),
      stock: totalStock,
      rating: Number(item.rating || 4.4),
      reviewCount: Number(item.reviewCount || 0),
      images: Array.isArray(item.images) && item.images.length ? item.images : [item.image || "/homepic.jpeg"],
      isBestSeller: Boolean(item.isBestSeller || index % 2 === 0),
      collection: item.collection || "Signature",
      variants,
      createdAt: item.createdAt || new Date(Date.now() - index * 1000 * 60 * 60 * 24 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
      soldCount: Number(item.soldCount || 20 + index * 3),
      viewCount: Number(item.viewCount || 120 + index * 15),
      addedToCartCount: Number(item.addedToCartCount || 40 + index * 8),
      isActive: item.isActive ?? true,
    };
  });
}

function createInitialCategories() {
  return [
    {
      id: "cat_tshirt",
      _id: "cat_tshirt",
      name: "T-Shirts",
      slug: "tshirt",
      description: "Premium tees and oversized drops",
      image: "/homepic.jpeg",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "cat_shirt",
      _id: "cat_shirt",
      name: "Shirts",
      slug: "shirt",
      description: "Classic and tailored shirts",
      image: "/homepic.jpeg",
      displayOrder: 2,
      isActive: true,
    },
  ];
}

function createInitialReviews() {
  return [
    {
      id: createId("rev"),
      productId: "prod_1",
      userId: "seed_admin",
      userName: "Admin",
      rating: 5,
      text: "Excellent fabric and fit.",
      status: "approved",
      isFeatured: true,
      isAbusive: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
    {
      id: createId("rev"),
      productId: "prod_2",
      userId: "seed_admin",
      userName: "Admin",
      rating: 4,
      text: "Solid shirt, quick delivery.",
      status: "pending",
      isFeatured: false,
      isAbusive: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ];
}

function buildStore() {
  const now = Date.now();
  const seededUsers = {
    seed_admin: {
      id: "seed_admin",
      name: "Admin",
      email: "admin@sharqlabel.com",
      password: "admin123",
      role: "admin",
      isBlocked: false,
    },
  };

  return {
    usersById: seededUsers,
    usersByEmail: { "admin@sharqlabel.com": "seed_admin" },
    sessions: {},
    verificationCodesByEmail: {},
    passwordResetTokens: {},
    cartByUser: {},
    wishlistByUser: {},
    ordersByUser: {
      seed_admin: createInitialOrders("seed_admin", "admin@sharqlabel.com"),
    },
    products: normalizeProducts(products),
    categories: createInitialCategories(),
    reviews: createInitialReviews(),
    visitorsByMonth: [
      { month: "Jan", visitors: 1240, sales: 31200 },
      { month: "Feb", visitors: 1480, sales: 35800 },
      { month: "Mar", visitors: 1320, sales: 33900 },
      { month: "Apr", visitors: 1670, sales: 41100 },
      { month: "May", visitors: 1810, sales: 46050 },
      { month: "Jun", visitors: 1740, sales: 43900 },
      { month: "Jul", visitors: 1890, sales: 48200 },
      { month: "Aug", visitors: 2050, sales: 52010 },
      { month: "Sep", visitors: 1940, sales: 49640 },
      { month: "Oct", visitors: 2160, sales: 55830 },
      { month: "Nov", visitors: 2310, sales: 60220 },
      { month: "Dec", visitors: 2460, sales: 64890 },
    ],
    metrics: {
      lastUpdatedAt: new Date(now).toISOString(),
    },
  };
}

export function getStore() {
  if (!globalThis.__sharqDemoStore) {
    globalThis.__sharqDemoStore = buildStore();
  }
  return globalThis.__sharqDemoStore;
}

export function ensureUserCollections(userId) {
  const store = getStore();
  if (!store.cartByUser[userId]) store.cartByUser[userId] = [];
  if (!store.wishlistByUser[userId]) store.wishlistByUser[userId] = [];
  if (!store.ordersByUser[userId]) {
    const user = store.usersById[userId];
    store.ordersByUser[userId] = createInitialOrders(userId, user?.email || "customer@example.com");
  }
}

export function getAllOrders() {
  const store = getStore();
  const userOrders = Object.entries(store.ordersByUser).flatMap(([userId, orders]) =>
    (orders || []).map((order) => ({
      ...order,
      userId: order.userId || userId,
    }))
  );
  return userOrders.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
}
