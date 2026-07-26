import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NUTRO AI — Swiggy Macro Copilot & MCP Engine",
  description: "High-contrast editorial macro tracking and real-time Swiggy Food & Instamart MCP meal ordering copilot.",
  keywords: ["Nutro AI", "Toyota Coniq Pro", "Swiggy", "Macros", "Fitness", "MCP", "AI Copilot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${hanken.variable} font-sans antialiased bg-[#0a0a0a] text-white min-h-screen selection:bg-red-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
