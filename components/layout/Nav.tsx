// components/layout/Nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Menu, X } from "lucide-react";
import AuthButton from "@/components/layout/AuthButton";

export default function Nav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Challenges", href: "/challenges" },
    { name: "Mock Interview", href: "/mock-interview" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="w-full border-b border-border-subt bg-surface/90 backdrop-blur-md sticky top-0 z-40 select-none h-16 flex items-center">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Terminal className="w-4.5 h-4.5 text-accent-text" />
            <span className="font-mono font-bold tracking-tight text-sm text-txt-primary">
              ReviewLabs
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-sans font-medium tracking-wide transition-colors ${
                    isActive
                      ? "text-txt-primary"
                      : "text-txt-tertiary hover:text-txt-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Actions (White CTA) */}
          <div className="hidden md:flex items-center gap-3">
            <AuthButton />
            <Link
              href="/challenges"
              className="text-xs font-sans font-medium bg-accent hover:bg-accent-hover text-txt-inverse px-4 h-9 flex items-center justify-center rounded-full transition-colors active:scale-95"
            >
              Start Practice
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md border border-border-subt text-txt-tertiary hover:text-txt-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b border-border-subt bg-surface px-4 py-4 space-y-3 md:hidden [box-shadow:var(--shadow-soft)]">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-border-subt text-txt-primary"
                    : "text-txt-tertiary hover:bg-elevated hover:text-txt-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border-subt space-y-3">
            <div className="flex justify-center">
              <AuthButton />
            </div>
            <Link
              href="/challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center text-xs font-medium bg-accent hover:bg-accent-hover text-txt-inverse py-2.5 rounded-full transition-colors"
            >
              Start Practice
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
