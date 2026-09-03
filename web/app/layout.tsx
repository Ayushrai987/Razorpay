import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headings",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://razorguard.vercel.app";

export const metadata: Metadata = {
  title: "RazorGuard — Real-Time Duplicate Payment Detection for Razorpay",
  description: "Protect merchant revenue from duplicate charges, timeout resubmissions, and double deductions. RazorGuard evaluates Razorpay webhook payloads in under 100ms with automated recovery workflows.",
  keywords: [
    "Razorpay duplicate payment detection",
    "duplicate charge prevention",
    "merchant payment security",
    "fintech payment integrity",
    "automated refund recovery",
    "Razorpay webhook deduplication"
  ],
  authors: [{ name: "RazorGuard Engineering Team" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "RazorGuard — Real-Time Duplicate Payment Detection",
    description: "Protect merchant revenue from duplicate charges & double deductions with sub-100ms Razorpay webhook validation.",
    url: siteUrl,
    siteName: "RazorGuard",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "RazorGuard Duplicate Payment Detection Platform Console",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RazorGuard — Real-Time Duplicate Payment Detection",
    description: "Sub-100ms detection and automated recovery workflows for Razorpay merchants.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RazorGuard",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "Financial infrastructure software for merchant duplicate payment detection and automated refund execution on Razorpay workflows.",
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RazorGuard",
    "url": siteUrl,
    "description": "Real-time duplicate payment detection and automated refund recovery platform for Razorpay merchants.",
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RazorGuard Duplicate Detector",
    "operatingSystem": "Web / Cloud Service",
    "applicationCategory": "BusinessApplication",
    "description": "Machine-learning payment deduplication engine for Razorpay checkout streams.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Developer Prototype & Evaluation Tier"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
      </head>
      <body className={`${outfit.variable} ${inter.variable} font-body bg-[#080711] text-[#f8fafc] antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
