import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MuiProvider from "@/lib/mui-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { BrandingProvider } from "@/lib/branding-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Study Abroad CRM",
  description: "Student Career Guidance & Study Abroad CRM Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-theme="dark">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <MuiProvider>
            <BrandingProvider>{children}</BrandingProvider>
          </MuiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
