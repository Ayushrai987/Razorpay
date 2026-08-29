import type { Metadata } from "next";
import { Playfair_Display, Satoshi } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headings",
});

const satoshi = Satoshi({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "RazorGuard — AI Duplicate Transaction Detection for Razorpay",
  description: "Stop losing revenue to duplicate payments. RazorGuard detects duplicate Razorpay charges in under 100ms and issues automatic refunds — zero manual effort.",
  keywords: "Razorpay duplicate detection, duplicate payment refund, AI fintech, payment integrity, chargeback prevention",
  authors: [{ name: "RazorGuard" }],
  openGraph: {
    title: "RazorGuard — AI Duplicate Transaction Detection",
    description: "Stop duplicate Razorpay charges before they cost you. 100% accuracy, <100ms detection.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${playfair.variable} ${satoshi.variable} font-body bg-night-DEFAULT text-razordark antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
