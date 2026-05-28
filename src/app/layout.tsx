import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "Smart Summarizer AI",
    template: "%s | Smart Summarizer AI",
  },
  description:
    "Yapay zeka ile her türlü içeriği analiz et, özetle ve öğren. PDF, ses, video, URL destekli gelişmiş AI özet platformu.",
  keywords: ["AI özet", "yapay zeka", "PDF özet", "akıllı özetleme", "Smart Summarizer"],
  authors: [{ name: "Smart Summarizer AI" }],
  openGraph: {
    type: "website",
    title: "Smart Summarizer AI",
    description: "Yapay zeka ile her türlü içeriği analiz et ve özetle",
    siteName: "Smart Summarizer AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Summarizer AI",
    description: "Yapay zeka ile her türlü içeriği analiz et ve özetle",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full antialiased" style={{ fontFamily: "var(--font-body)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
