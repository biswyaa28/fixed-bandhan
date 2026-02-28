"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Bell, User, Heart, MessageCircle, Crown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const navLinks = [
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount] = useState(3);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ─── Top Navigation Bar ─── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 safe-top",
          "bg-[#212121]",
          "border-b-[3px] border-white",
          "shadow-[0_4px_0px_#000000]",
        )}
      >
        <nav className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Height: 56px = 7 × 8px grid */}
          <div className="flex items-center justify-between h-14">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 no-underline group"
            >
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#000000]">
                <span className="text-black font-heading font-bold text-sm leading-none">
                  B
                </span>
              </div>
              <span className="text-base font-heading font-bold tracking-tight text-white uppercase leading-none">
                Bandhan <span className="text-[#E0E0E0]">AI</span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex items-center gap-0">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 no-underline",
                      "text-sm font-heading font-semibold uppercase tracking-wider",
                      active
                        ? "text-black bg-white"
                        : "text-[#9E9E9E] hover:text-white hover:bg-[#000000]",
                      "border-x border-[#424242]",
                    )}
                  >
                    <link.icon
                      className="w-4 h-4"
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {link.label}

                    {/* Active indicator */}
                    {active && (
                      <>
                        <div className="absolute -bottom-[3px] left-2 right-2 h-[3px] bg-black" />
                        <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-2">
              {/* Premium badge */}
              <Link
                href="/premium"
                className={cn(
                  "hidden sm:flex items-center gap-2 px-3 py-2 no-underline",
                  "bg-white text-black",
                  "border-2 border-black",
                  "text-xs font-heading font-bold uppercase",
                  "shadow-[2px_2px_0px_#000000]",
                  "transition-[transform,box-shadow] duration-150",
                  "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                )}
              >
                <Crown className="w-4 h-4" strokeWidth={2} />
                Premium
              </Link>

              {/* Notifications: 8-bit badge */}
              <button
                className={cn(
                  "relative p-2 min-w-[40px] min-h-[40px]",
                  "flex items-center justify-center",
                  "text-[#9E9E9E] hover:text-white",
                  "hover:bg-[#000000]",
                  "border-none bg-transparent cursor-pointer",
                )}
                aria-label={`${unreadCount} notifications`}
              >
                <Bell className="w-5 h-5" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-white text-black border-2 border-black text-[8px] font-pixel font-bold flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile avatar: 32px = 4 × 8px */}
              <button
                className={cn(
                  "relative w-8 h-8 overflow-hidden",
                  "bg-[#E0E0E0] border-2 border-white",
                  "items-center justify-center",
                  "hover:bg-white",
                  "hidden md:flex",
                  "cursor-pointer",
                )}
                aria-label="Profile"
              >
                <User className="w-4 h-4 text-black" strokeWidth={2.5} />
                {/* Online dot: 8px square */}
                <span className="absolute -bottom-px -right-px w-2 h-2 bg-white border-[1.5px] border-black" />
              </button>

              {/* Mobile menu toggle: 40px touch target */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "md:hidden p-2 min-w-[40px] min-h-[40px]",
                  "flex items-center justify-center",
                  "text-white hover:bg-[#000000]",
                  "border-none bg-transparent cursor-pointer",
                )}
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Mobile Slide-in Menu ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden",
                "bg-white",
                "border-l-4 border-black",
                "shadow-[-8px_0_0px_#000000]",
                "safe-top safe-bottom",
              )}
            >
              <div className="flex flex-col h-full">
                {/* Header: black bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-black text-white border-b-2 border-black">
                  <span className="text-sm font-heading font-bold uppercase tracking-wider">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 bg-white text-black border-2 border-white flex items-center justify-center hover:bg-[#E0E0E0] cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>

                {/* Links: 24px padding, 8px gap */}
                <div className="flex flex-col p-6 gap-2">
                  {navLinks.map((link, i) => {
                    const active = isActive(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: 16, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.15 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 no-underline",
                            "text-sm font-heading font-bold uppercase tracking-wider",
                            "border-2",
                            active
                              ? "bg-black text-white border-black shadow-[2px_2px_0px_#000000]"
                              : "bg-white text-[#424242] border-[#E0E0E0] hover:border-black hover:bg-[#F8F8F8]",
                          )}
                        >
                          <link.icon
                            className="w-5 h-5"
                            strokeWidth={active ? 2.5 : 2}
                          />
                          {link.label}
                          {active && (
                            <span className="ml-auto text-[8px] font-pixel leading-none">
                              ◄
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Premium card */}
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-auto p-6"
                >
                  <div className="p-6 bg-[#F8F8F8] border-[3px] border-black shadow-[4px_4px_0px_#000000]">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-black" strokeWidth={2} />
                      <span className="text-sm font-heading font-bold text-black uppercase">
                        Go Premium
                      </span>
                    </div>
                    <p className="text-xs text-[#424242] mb-4 leading-relaxed m-0">
                      Unlimited matches, priority visibility & exclusive
                      features.
                    </p>
                    <Link
                      href="/premium"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block w-full py-3 text-center no-underline",
                        "bg-black text-white",
                        "border-2 border-black",
                        "text-xs font-heading font-bold uppercase tracking-wider",
                        "hover:bg-[#424242]",
                      )}
                    >
                      Upgrade Now
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
