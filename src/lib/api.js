"use client";

import axios from "axios";
import { startGlobalLoading, stopGlobalLoading } from "@/lib/loadingBus";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  startGlobalLoading();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  stopGlobalLoading();
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  stopGlobalLoading();
  return response;
}, (error) => {
  stopGlobalLoading();
  return Promise.reject(error);
});

function throwApiError(error, fallbackMessage) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage;
  throw new Error(message);
}

async function request(method, url, data, params, fallbackMessage) {
  try {
    const response = await api({ method, url, data, params });
    return response.data;
  } catch (error) {
    throwApiError(error, fallbackMessage);
  }
}

export const authApi = {
  register: (payload) =>
    request("post", "/api/auth/register", payload, null, "Register failed"),
  verifyEmail: (payload) =>
    request(
      "post",
      "/api/auth/verify-email",
      payload,
      null,
      "Email verification failed"
    ),
  login: (payload) =>
    request("post", "/api/auth/login", payload, null, "Login failed"),
  logout: () => request("post", "/api/auth/logout", null, null, "Logout failed"),
  me: () => request("get", "/api/auth/me", null, null, "Failed to load user"),
  forgotPassword: (payload) =>
    request(
      "post",
      "/api/auth/forgot-password",
      payload,
      null,
      "Failed to send reset instructions"
    ),
  resetPassword: (payload) =>
    request(
      "post",
      "/api/auth/reset-password",
      payload,
      null,
      "Failed to reset password"
    ),
};

export const productsApi = {
  list: (params) =>
    request("get", "/api/products", null, params, "Failed to load products"),
  create: (payload) =>
    request("post", "/api/products", payload, null, "Failed to create product"),
  getById: (id) =>
    request("get", `/api/products/${id}`, null, null, "Failed to load product"),
  update: (id, payload) =>
    request("put", `/api/products/${id}`, payload, null, "Failed to update product"),
  remove: (id) =>
    request("delete", `/api/products/${id}`, null, null, "Failed to delete product"),
};

export const cartApi = {
  get: () => request("get", "/api/cart", null, null, "Failed to load cart"),
  add: (payload) =>
    request("post", "/api/cart/add", payload, null, "Failed to add cart item"),
  update: (payload) =>
    request("put", "/api/cart/update", payload, null, "Failed to update cart"),
  remove: (productId) =>
    request(
      "delete",
      `/api/cart/remove/${productId}`,
      null,
      null,
      "Failed to remove cart item"
    ),
  clear: () => request("delete", "/api/cart/clear", null, null, "Failed to clear cart"),
};

export const wishlistApi = {
  list: () => request("get", "/api/wishlist", null, null, "Failed to load wishlist"),
  add: (payload) =>
    request("post", "/api/wishlist", payload, null, "Failed to add wishlist item"),
  remove: (productId) =>
    request(
      "delete",
      `/api/wishlist/${productId}`,
      null,
      null,
      "Failed to remove wishlist item"
    ),
};

export const accountApi = {
  get: () => request("get", "/api/account", null, null, "Failed to load account"),
};

export const usersApi = {
  getProfile: () =>
    request("get", "/api/users/profile", null, null, "Failed to load profile"),
  updateProfile: (payload) =>
    request("put", "/api/users/profile", payload, null, "Failed to update profile"),
  deleteProfile: () =>
    request("delete", "/api/users/profile", null, null, "Failed to delete profile"),
};

export const addressesApi = {
  create: (payload) =>
    request("post", "/api/addresses", payload, null, "Failed to create address"),
  list: () => request("get", "/api/addresses", null, null, "Failed to load addresses"),
  update: (id, payload) =>
    request("put", `/api/addresses/${id}`, payload, null, "Failed to update address"),
  remove: (id) =>
    request("delete", `/api/addresses/${id}`, null, null, "Failed to delete address"),
};

export const categoriesApi = {
  list: () => request("get", "/api/categories", null, null, "Failed to load categories"),
  create: (payload) =>
    request("post", "/api/categories", payload, null, "Failed to create category"),
  update: (id, payload) =>
    request("put", `/api/categories/${id}`, payload, null, "Failed to update category"),
  remove: (id) =>
    request("delete", `/api/categories/${id}`, null, null, "Failed to delete category"),
};

export const reviewsApi = {
  create: (payload) =>
    request("post", "/api/reviews", payload, null, "Failed to create review"),
  listByProduct: (id) =>
    request("get", `/api/reviews/product/${id}`, null, null, "Failed to load reviews"),
  remove: (reviewId) =>
    request("delete", `/api/reviews/${reviewId}`, null, null, "Failed to delete review"),
};

export const returnsApi = {
  create: (payload) =>
    request("post", "/api/returns", payload, null, "Failed to create return request"),
  my: () => request("get", "/api/returns/my", null, null, "Failed to load returns"),
};

export const ordersApi = {
  create: (payload) =>
    request("post", "/api/orders", payload, null, "Failed to create order"),
  myOrders: () =>
    request("get", "/api/orders/my-orders", null, null, "Failed to load orders"),
  validateCoupon: (payload) =>
    request(
      "post",
      "/api/orders/coupons/validate",
      payload,
      null,
      "Failed to validate coupon"
    ),
  getById: (id) =>
    request("get", `/api/orders/${id}`, null, null, "Failed to load order"),
  trackById: (id) =>
    request("get", `/api/orders/${id}/track`, null, null, "Failed to load tracking"),
  updateStatus: (id, payload) =>
    request(
      "put",
      `/api/orders/${id}/status`,
      payload,
      null,
      "Failed to update order status"
    ),
};

export const checkoutApi = {
  validate: (payload) =>
    request(
      "post",
      "/api/checkout/validate",
      payload,
      null,
      "Checkout validation failed"
    ),
  shippingOptions: (subtotal) =>
    request(
      "get",
      "/api/checkout/shipping-options",
      null,
      { subtotal },
      "Failed to load shipping options"
    ),
};

export const paymentsApi = {
  create: (payload) =>
    request("post", "/api/payments/create", payload, null, "Failed to create payment"),
  verify: (payload) =>
    request("post", "/api/payments/verify", payload, null, "Failed to verify payment"),
  getByOrderId: (orderId) =>
    request(
      "get",
      `/api/payments/${orderId}`,
      null,
      null,
      "Failed to load payment status"
    ),
};

export const adminApi = {
  users: () => request("get", "/api/admin/users", null, null, "Failed to load users"),
  orders: () => request("get", "/api/admin/orders", null, null, "Failed to load orders"),
  orderById: (id) =>
    request("get", `/api/admin/orders/${id}`, null, null, "Failed to load order details"),
  updateOrder: (id, payload) =>
    request("put", `/api/admin/orders/${id}`, payload, null, "Failed to update order"),
  exportOrders: () =>
    request("post", "/api/admin/orders", { action: "export" }, null, "Failed to export orders"),
  dashboardStats: () =>
    request(
      "get",
      "/api/admin/dashboard-stats",
      null,
      null,
      "Failed to load dashboard stats"
    ),
  promote: (payload) =>
    request("post", "/api/admin/promote", payload, null, "Failed to promote user"),
  updateUser: (id, payload) =>
    request("put", `/api/admin/users/${id}`, payload, null, "Failed to update user"),
  reviews: () => request("get", "/api/admin/reviews", null, null, "Failed to load reviews"),
  updateReview: (id, payload) =>
    request("put", `/api/admin/reviews/${id}`, payload, null, "Failed to update review"),
  deleteReview: (id) =>
    request("delete", `/api/admin/reviews/${id}`, null, null, "Failed to delete review"),
  inventory: () =>
    request("get", "/api/admin/inventory", null, null, "Failed to load inventory"),
  updateInventory: (payload) =>
    request("put", "/api/admin/inventory", payload, null, "Failed to update inventory"),
};

export async function loginApi(payload) {
  return authApi.login(payload);
}

export async function signupApi(payload) {
  return authApi.register(payload);
}

export async function getProductsApi() {
  return productsApi.list();
}

export async function getProductByIdApi(id) {
  return productsApi.getById(id);
}

export async function getCartApi() {
  return cartApi.get();
}

export async function addToCartApi(payload) {
  return cartApi.add(payload);
}

export async function removeFromCartApi(productId) {
  return cartApi.remove(productId);
}

export async function getAccountApi() {
  return accountApi.get();
}

export async function getWishlistApi() {
  return wishlistApi.list();
}

export async function addToWishlistApi(payload) {
  return wishlistApi.add(payload);
}

export async function removeFromWishlistApi(productId) {
  return wishlistApi.remove(productId);
}

export async function getReturnsApi() {
  return returnsApi.my();
}

export async function createReturnApi(payload) {
  return returnsApi.create(payload);
}

export default api;
