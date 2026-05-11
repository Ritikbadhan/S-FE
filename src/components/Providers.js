"use client";

import { usePathname } from "next/navigation";
import ThemeContextProvider from "../context/ThemeContext";
import CartProvider from "../context/CartContext";
import WishlistProvider from "../context/WishlistContext";
import AuthProvider from "../context/AuthContext";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

export default function Providers({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <ThemeContextProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {!isAdminRoute && <Navbar />}
            {children}
            {!isAdminRoute && <Footer />}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}
