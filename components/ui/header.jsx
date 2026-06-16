"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X, Car, Heart, Calendar, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/AppContext";
import Image from "next/image";

const Header = () => {
  const { dbUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine dynamic navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { name: "Browse", href: "/cars", icon: <Car className="w-4 h-4" /> }
    ];

    if (!dbUser) {
      return baseLinks;
    }

    if (dbUser.role === "admin") {
      return [
        ...baseLinks,
        { name: "Admin Console", href: "/admin", icon: <ShieldCheck className="w-4 h-4" /> }
      ];
    }

    if (dbUser.role === "seller") {
      return [
        ...baseLinks,
        { name: "Showroom", href: "/seller", icon: <ShieldCheck className="w-4 h-4" /> }
      ];
    }

    // Default for buyer
    return [
      ...baseLinks,
      { name: "Saved", href: "/saved-cars", icon: <Heart className="w-4 h-4" /> },
      { name: "Reservations", href: "/reservations", icon: <Calendar className="w-4 h-4" /> }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg group-hover:scale-105 transition-transform">
            V
          </span>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            VEHIQL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Light/Dark Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
              )}
            </Button>
          )}

          {/* Clerk Auth Buttons */}
          <SignedIn>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-800">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 shadow-sm hover:shadow transition-all">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Navigation Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9 mr-1"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 h-4" /> : <Moon className="h-4 h-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-background py-4 px-4 space-y-3 shadow-inner">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Account</span>
            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
