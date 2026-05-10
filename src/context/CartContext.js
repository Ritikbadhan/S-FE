"use client";

import { createContext, useEffect, useState } from "react";
import {
  addToCartApi,
  cartApi,
  getCartApi,
  removeFromCartApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { isAuthenticated, user } = useAuth();

  const normalizeCart = (response) => {
    const root = response?.cart || response?.data || response;
    const items = Array.isArray(root)
      ? root
      : Array.isArray(root?.items)
      ? root.items
      : [];

    return items.map((item) => ({
      id: item.productId || item.id || item.product?._id || item.product?.id,
      name: item.name || item.product?.name || "Product",
      price: item.price || item.product?.price || 0,
      originalPrice:
        item.originalPrice ||
        item.product?.originalPrice ||
        item.product?.mrp ||
        item.price ||
        item.product?.price ||
        0,
      category: item.category || item.product?.category || "General",
      description:
        item.description ||
        item.product?.description ||
        item.product?.shortDescription ||
        "",
      collection: item.collection || item.product?.collection || "",
      size: item.size || item.variant?.size || item.product?.size || "",
      color: item.color || item.variant?.color || item.product?.color || "",
      image: item.image || item.product?.images?.[0] || "/homepic.jpeg",
      quantity: item.quantity || 1,
    }));
  };

  useEffect(() => {
    let active = true;

    async function loadCart() {
      if (!isAuthenticated) {
        setCart([]);
        return;
      }

      try {
        const data = await getCartApi();
        if (active) setCart(normalizeCart(data));
      } catch (err) {
        if (active) setCart([]);
      }
    }

    loadCart();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  const addToCart = async (product) => {
    const productId = product.productId || product.id || product._id;
    const quantity = product.quantity || 1;
    const data = await addToCartApi({ productId, quantity });
    setCart(normalizeCart(data));
  };

  const removeFromCart = async (id) => {
    const data = await removeFromCartApi(id);
    setCart(normalizeCart(data));
  };

  const updateCartQuantity = async (id, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    try {
      const data = await cartApi.update({ productId: id, quantity: nextQuantity });
      setCart(normalizeCart(data));
    } catch (err) {
      // Fallback for APIs that don't support update endpoint shape yet.
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: nextQuantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    const data = await cartApi.clear();
    setCart(normalizeCart(data));
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateCartQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
