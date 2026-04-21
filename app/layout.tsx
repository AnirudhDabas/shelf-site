import type { Metadata, Viewport } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "shelf — autoresearch for storefronts",
  description:
    "An autonomous agent that tunes your Shopify catalog until ChatGPT and Perplexity actually recommend you.",
  openGraph: {
    title: "shelf",
    description: "autoresearch for storefronts",
    url: "https://shelf-site.vercel.app",
    siteName: "shelf",
    type: "website",
  },
  icons: {
    icon: {
      url:
        "data:image/svg+xml," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
            "<rect width='32' height='32' fill='#070809'/>" +
            "<circle cx='16' cy='16' r='8' fill='#22c55e'/>" +
            "</svg>"
        ),
      type: "image/svg+xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#070809",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmMono.variable}>
      <body>{children}</body>
    </html>
  );
}
