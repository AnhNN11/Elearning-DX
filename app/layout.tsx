import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppFooter } from "@/components/app-footer";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
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
    >
      <body className="min-h-full flex flex-col">
        <SmoothCursor />
        {children}
        <AppFooter />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
