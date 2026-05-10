import "./globals.css";
import ThemeContextProvider from "../context/ThemeContext";
import CartProvider from "../context/CartContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import WishlistProvider from "@/context/WishlistContext";
import AuthProvider from "@/context/AuthContext";
import { PageLoaderProvider, ToastProvider } from "@/components/common";

export const metadata = {
  title: "Sharq Label",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/sharq_icon_16.png", sizes: "16x16", type: "image/png" },
      { url: "/sharq_icon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/sharq_icon_48.png", sizes: "48x48", type: "image/png" },
      { url: "/sharq_icon_192.png", sizes: "192x192", type: "image/png" },
      { url: "/sharq_icon_512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/sharq_icon_180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeContextProvider>
          <AuthProvider>
            <PageLoaderProvider>
              <ToastProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Navbar />
                    {children}
                    <Footer />
                  </WishlistProvider>
                </CartProvider>
              </ToastProvider>
            </PageLoaderProvider>
          </AuthProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
