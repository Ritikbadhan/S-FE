import { getAllOrders, getStore } from "@/lib/demoStore";

export function getRevenue(orders) {
  return orders
    .filter((order) => !order.isCancelled && !order.isRefunded)
    .reduce((sum, order) => sum + Number(order.totalAmount || order.total || 0), 0);
}

export function getLowStockProducts(products, threshold = 10) {
  return products
    .filter((product) => Number(product.stock || 0) <= threshold)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
}

export function getTopSellingProducts(products, limit = 5) {
  return [...products]
    .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
    .slice(0, limit);
}

export function getTrendingProducts(products, limit = 5) {
  return [...products]
    .map((product) => ({
      ...product,
      trendScore: Number(product.viewCount || 0) * 0.35 + Number(product.addedToCartCount || 0) * 0.65,
    }))
    .sort((a, b) => Number(b.trendScore || 0) - Number(a.trendScore || 0))
    .slice(0, limit);
}

export function getSalesChartFromOrders(orders) {
  const byMonth = new Map();
  orders.forEach((order) => {
    const date = new Date(order.date || order.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("en-US", { month: "short" });
    const prev = byMonth.get(key) || { month: label, sales: 0, orders: 0 };
    prev.sales += Number(order.totalAmount || order.total || 0);
    prev.orders += 1;
    byMonth.set(key, prev);
  });
  return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
}

function mergeMonthlySeries(baseSeries = [], orderSeries = []) {
  const byMonth = new Map();

  baseSeries.forEach((item) => {
    const month = String(item?.month || "").trim();
    if (!month) return;
    byMonth.set(month, {
      month,
      sales: Number(item?.sales || 0),
      visitors: Number(item?.visitors || 0),
      orders: Number(item?.orders || 0),
    });
  });

  orderSeries.forEach((item) => {
    const month = String(item?.month || "").trim();
    if (!month) return;
    const current = byMonth.get(month) || {
      month,
      sales: 0,
      visitors: 0,
      orders: 0,
    };
    current.sales += Number(item?.sales || 0);
    current.orders += Number(item?.orders || 0);
    byMonth.set(month, current);
  });

  return [...byMonth.values()];
}

export function computeDashboardStats() {
  const store = getStore();
  const orders = getAllOrders();
  const products = store.products || [];
  const baseVisitors = Array.isArray(store.visitorsByMonth) ? store.visitorsByMonth : [];
  const orderSalesChart = getSalesChartFromOrders(orders);
  const monthlySeries = mergeMonthlySeries(baseVisitors, orderSalesChart);

  return {
    totalRevenue: getRevenue(orders),
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount: getLowStockProducts(products).length,
    usersCount: Object.keys(store.usersById || {}).length,
    ordersCount: orders.length,
    revenue: getRevenue(orders),
    topSellingProducts: getTopSellingProducts(products),
    recentOrders: orders.slice(0, 8),
    trendingProducts: getTrendingProducts(products),
    lowStockProducts: getLowStockProducts(products, 10).slice(0, 8),
    salesChart: monthlySeries.map(({ month, sales, orders: monthlyOrders }) => ({
      month,
      sales,
      orders: monthlyOrders,
    })),
    visitors: monthlySeries.map(({ month, visitors }) => ({
      month,
      visitors,
    })),
    lastUpdatedAt: store.metrics?.lastUpdatedAt || new Date().toISOString(),
  };
}
