import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ConditionalRootDocument } from "./ConditionalRootDocument";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoralSync - Track Your Anime, Movies & Series",
  description: "Your personal tracker for anime, movies, and series. Discover new content, track your progress, and organize your watchlist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClassName = `${geistSans.variable} ${geistMono.variable} antialiased`;
  return (
    <ConditionalRootDocument fontClassName={fontClassName}>
      {children}
    </ConditionalRootDocument>
  );
}
