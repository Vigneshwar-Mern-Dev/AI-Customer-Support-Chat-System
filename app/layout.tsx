import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SupportAI — AI-Powered Customer Support",
  description:
    "Get instant AI-powered support for your questions. Our intelligent system helps you quickly, 24/7.",
  keywords: ["customer support", "AI", "help desk", "chat", "tickets"],
  openGraph: {
    title: "SupportAI — AI-Powered Customer Support",
    description: "Get instant AI-powered support, 24/7.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
