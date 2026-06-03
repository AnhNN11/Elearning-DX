import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppFooter } from "@/components/app-footer";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { FooterGate } from "@/components/footer-gate";
import { NavigationLoadingOverlay } from "@/components/navigation-loading-overlay";
import { SmoothCursor } from "@/components/smooth-cursor";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DolphinX Learn | eLearning Công Nghệ",
  description: "Học công nghệ, luyện code, kiểm tra kết quả và nhận chứng chỉ.",
  icons: {
    apple: [{ type: "image/svg+xml", url: "/icon.svg" }],
    icon: [{ type: "image/svg+xml", url: "/icon.svg" }],
    shortcut: [{ type: "image/svg+xml", url: "/icon.svg" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <SmoothCursor />
        {children}
        <NavigationLoadingOverlay />
        <FooterGate>
          <AppFooter />
        </FooterGate>
        <FirebaseAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
