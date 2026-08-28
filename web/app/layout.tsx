import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
      <body className={`${inter.variable} ${poppins.variable} font-inter bg-white text-razordark antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
