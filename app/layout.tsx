import type { Metadata, Viewport } from "next";
import { EB_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B4D6B",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://compleros.com"),
  title: {
    default: "Compleros — Compliance Management for Florida Education Providers",
    template: "%s | Compleros",
  },
  description:
    "Track licenses, manage staff credentials, and stay inspection-ready. Compleros is the compliance management platform built specifically for Florida childcare centers, microschools, and private schools.",
  keywords: [
    "childcare compliance Florida",
    "DCF compliance management",
    "childcare license tracking",
    "microschool compliance",
    "private school compliance Florida",
    "education compliance software",
    "childcare center management",
    "DCF inspection preparation",
    "staff credential tracking",
    "Florida childcare regulations",
    "Chapter 402 compliance",
    "early childhood education compliance",
  ],
  authors: [{ name: "Compleros" }],
  creator: "Compleros",
  publisher: "Compleros",
  category: "Education Technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://compleros.com",
    siteName: "Compleros",
    title: "Compleros — Compliance Management for Florida Education Providers",
    description:
      "Track licenses, manage staff credentials, and stay inspection-ready. Built specifically for Florida childcare centers, microschools, and private schools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Compleros — Compliance Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compleros — Compliance Management for Florida Education Providers",
    description:
      "Track licenses, manage credentials, and stay inspection-ready — all in one platform built for Florida education providers.",
    images: ["/og-image.png"],
    creator: "@compleros",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://compleros.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${dmSans.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
