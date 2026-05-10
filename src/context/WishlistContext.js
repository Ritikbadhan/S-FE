"use client";

import { createContext, useEffect, useState } from "react";
import {
  addToWishlistApi,
  getWishlistApi,
  removeFromWishlistApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const WishlistContext = createContext();

const getProductId = (item) => item?.id || item?._id || item?.productId;
const normalizeWishlist = (response) => {
  const root = response?.wishlist || response?.data || response;
  return Array.isArray(root) ? root : [];
};

export default function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (!isAuthenticated) {
        if (active) {
          setWishlist([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getWishlistApi();
        if (active) {
          setWishlist(normalizeWishlist(data));
        }
      } catch (e) {
        if (active) {
          setWishlist([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    loadWishlist();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  const addToWishlist = async (product) => {
    const productId = getProductId(product);
    const data = await addToWishlistApi({ productId });
    const resolved = normalizeWishlist(data);
    if (resolved.length || Array.isArray(data?.wishlist)) {
      setWishlist(resolved);
      return;
    }
    // Fallback: optimistic state update if API returns only success message.
    setWishlist((prev) => {
      const exists = prev.some((item) => getProductId(item) === productId);
      return exists ? prev : [...prev, product];
    });
  };

  const removeFromWishlist = async (id) => {
    const data = await removeFromWishlistApi(id);
    const resolved = normalizeWishlist(data);
    if (resolved.length || Array.isArray(data?.wishlist)) {
      setWishlist(resolved);
      return;
    }
    // Fallback: optimistic state update if API returns only success message.
    setWishlist((prev) => prev.filter((item) => getProductId(item) !== id));
  };

  const clearWishlist = async () => {
    const ids = wishlist.map((item) => getProductId(item)).filter(Boolean);
    await Promise.all(ids.map((id) => removeFromWishlistApi(id).catch(() => null)));
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
