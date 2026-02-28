"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, User, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

const TABS = [
  { href: "/matches", icon: Heart, label: "Discover" },
  { href: "/chat", icon: MessageCircle, label: "Messages", badge: 3 },
  { href: "/premium", icon: Sparkles, label: "Premium" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth/onboarding flows and splash
  const HIDE_ON = ["/", "/login", "/verify", "/onboarding", "/demo"];
  const hidden = HIDE_ON.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p),
  );
  if (hidden) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 safe-bottom md:hidden",
        "bg-[#212121]",
        "border-t-[3px] border-white",
        "shadow-[0_-4px_0px_#000000]",
      )}
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex items-stretch">
        {TABS.map(({ href, icon: Icon, label, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                // Base: flex-1, min 48px touch target, no underline
                "flex-1 flex flex-col items-center justify-center",
                "min-h-[56px] py-2 relative no-underline",
                "border-x border-[#424242]",
                active ? "bg-white" : "hover:bg-[#000000]",
              )}
            >
              {/* Icon container: 32px centered area */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    active ? "text-black" : "text-[#9E9E9E]",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {/* Badge: 16px square */}
                {badge != null && badge > 0 && !active && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-white text-black border-2 border-black text-[8px] font-pixel font-bold flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </div>
              {/* Label: 10px uppercase */}
              <span
                className={cn(
                  "text-[10px] font-heading font-bold uppercase tracking-wider leading-none mt-0.5",
                  active ? "text-black" : "text-[#9E9E9E]",
                )}
              >
                {label}
              </span>
              {/* Active indicator: thick top bar + triangle arrow */}
              {active && (
                <>
                  <div className="absolute top-0 left-2 right-2 h-[3px] bg-black" />
                  <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-black" />
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
