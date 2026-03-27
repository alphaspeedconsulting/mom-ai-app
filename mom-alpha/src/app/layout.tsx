import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alpha.Mom — AI Family Assistant",
    template: "%s | Alpha.Mom",
  },
  description:
    "8 AI agents that manage your household — calendar, groceries, budget, school events, and more. Take a breath. We'll handle the rest.",
  keywords: [
    "AI family assistant",
    "AI household manager",
    "family calendar",
    "meal planning AI",
    "budget tracker",
    "school events",
    "mom productivity",
    "family organizer",
  ],
  authors: [{ name: "AlphaSpeed AI" }],
  creator: "AlphaSpeed AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Alpha.Mom",
    title: "Alpha.Mom — AI Family Assistant",
    description:
      "8 AI agents that manage your household. Take a breath. We'll handle the rest.",
    url: "https://mom.alphaspeedai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha.Mom — AI Family Assistant",
    description:
      "8 AI agents that manage your household. Take a breath. We'll handle the rest.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#32695a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable} lullaby-logic`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Alpha.Mom" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
