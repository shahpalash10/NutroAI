import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nutro AI — Swiggy Macro Copilot & MCP Orchestration Engine",
  description: "AI-powered wearable macro tracking and real-time Swiggy Food & Instamart MCP meal ordering copilot.",
  keywords: ["Nutro AI", "Swiggy", "Macros", "Fitness", "Meal Planning", "MCP", "AI Copilot", "Instamart"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-orange-500/30 selection:text-orange-300`}>
        {children}
      </body>
    </html>
  );
}

