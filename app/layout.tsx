import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/supabase/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ReviewLabs — AI Code Review Practice Platform",
  description: "Bite-sized interactive challenges to sharpen your AI code review skills. Learn to spot the bugs, hallucinated APIs, and security loopholes that LLMs leave behind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
        <AuthProvider>
          <Nav />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}


