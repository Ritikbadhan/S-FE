"use client";

import { useEffect, useState } from "react";
import { getProductsApi } from "@/lib/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductsApi();
        if (active) {
          setProducts(data.products || data.data || data || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}
