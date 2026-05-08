import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ImpersonationBar from "@/components/ImpersonationBar";
import AuthListener from "@/components/AuthListener";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Finance Talents | Elite Finance Jobs. One Platform.",
    template: "%s | Finance Talents",
  },
  description:
    "Find top finance jobs and internships in Private Equity, Venture Capital, Investment Banking and FinTech. The career platform for ambitious finance professionals.",
  keywords: [
    "finance jobs",
    "private equity jobs",
    "venture capital jobs",
    "investment banking jobs",
    "fintech jobs",
    "Finance Talents",
    "finance internships",
    "PE VC IB careers",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon FT.png", sizes: "48x48", type: "image/png" },
      { url: "/icon FT.png", sizes: "96x96", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Finance Talents",
    url: SITE_URL,
    title: "Finance Talents — Elite Finance Jobs",
    description: "The curated job platform for Private Equity, VC, IB and FinTech.",
    images: [
      {
        url: "/logo FT.png",
        width: 1200,
        height: 630,
        alt: "Finance Talents Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Talents — Elite Finance Jobs",
    description: "The curated job platform for Private Equity, VC, IB and FinTech.",
    images: ["/logo FT.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthListener />
        <ImpersonationBar />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
