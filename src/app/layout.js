import "./globals.css";
import ThemeContextProvider from "../context/ThemeContext";
import CartProvider from "../context/CartContext";
import WishlistProvider from "@/context/WishlistContext";
import AuthProvider from "@/context/AuthContext";
import { PageLoaderProvider, ToastProvider } from "@/components/common";
import AppChrome from "@/components/layout/AppChrome";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "https://sharqlabel.in";

const siteDescription =
  "Shop SHARQ LABEL luxury menswear, including premium shirts, T-shirts, new arrivals, and refined everyday essentials crafted for modern style.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "SHARQ LABEL",
  title: {
    default: "SHARQ LABEL | Luxury Menswear Redefined",
    template: "%s | SHARQ LABEL",
  },
  description: siteDescription,
  keywords: [
    "SHARQ LABEL",
    "Sharq Label",
    "luxury menswear",
    "premium shirts",
    "premium t-shirts",
    "men's fashion India",
    "modern menswear",
    "designer clothing",
  ],
  authors: [{ name: "SHARQ LABEL", url: siteUrl }],
  creator: "SHARQ LABEL",
  publisher: "SHARQ LABEL",
  category: "Fashion",
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "SHARQ LABEL",
    title: "SHARQ LABEL | Luxury Menswear Redefined",
    description: siteDescription,
    images: [
      {
        url: "/sharq_logo_transparent.png",
        width: 1200,
        height: 630,
        alt: "SHARQ LABEL luxury menswear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHARQ LABEL | Luxury Menswear Redefined",
    description: siteDescription,
    images: ["/sharq_logo_transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/sharq_icon_16.png", sizes: "16x16", type: "image/png" },
      { url: "/sharq_icon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/sharq_icon_48.png", sizes: "48x48", type: "image/png" },
      { url: "/sharq_icon_64.png", sizes: "64x64", type: "image/png" },
      { url: "/sharq_icon_128.png", sizes: "128x128", type: "image/png" },
      { url: "/sharq_icon_192.png", sizes: "192x192", type: "image/png" },
      { url: "/sharq_icon_256.png", sizes: "256x256", type: "image/png" },
      { url: "/sharq_icon_512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/sharq_icon_180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "SHARQ LABEL",
    statusBarStyle: "black-translucent",
  },
  other: {
    "theme-color": "#050505",
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
                    <AppChrome>{children}</AppChrome>
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
