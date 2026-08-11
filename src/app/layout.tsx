import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Koç Takip Sistemi",
    template: "%s | Koç Takip Sistemi",
  },
  description:
    "Öğrenci koçluğu ve takip platformu. Koçlar, öğrencilerini yönetir ve ilerlemelerini takip eder.",
  keywords: ["koç", "öğrenci", "takip", "eğitim", "mentör"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
