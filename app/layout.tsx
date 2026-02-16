import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loop - Your Calm Chief-of-Staff",
  description:
    "A personal agent that quietly keeps track of your tasks, follow-ups, and notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          <Navigation />
          <main className="ml-64 min-h-screen">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
