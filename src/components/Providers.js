"use client";

import ThemeContextProvider from "../context/ThemeContext";
import CartProvider from "../context/CartContext";
import WishlistProvider from "../context/WishlistContext";
import AuthProvider from "../context/AuthContext";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

export default function Providers({ children }) {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            {children}
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}
