import { Cairo } from "next/font/google";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata = {
  title: "Hadidi Win — Distributors",
  description: "Hadidi Win distributor portal",
  icons: {
    icon: [{ url: BRAND_ASSETS.logoMark, type: "image/svg+xml" }],
    apple: [{ url: BRAND_ASSETS.logoMark }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} h-full`}>
      <body className="min-h-screen bg-hadidi-muted font-sans text-hadidi-primary antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
