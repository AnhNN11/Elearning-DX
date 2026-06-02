"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GlobalSearch, type GlobalSearchItem } from "@/components/global-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import type { HeaderNavItem } from "@/components/header-nav";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileHeaderMenu({
  className,
  locale,
  navItems,
  searchCopy,
  searchItems,
  startLabel,
}: {
  className?: string;
  locale: Locale;
  navItems: HeaderNavItem[];
  searchCopy: Dictionary["search"];
  searchItems: GlobalSearchItem[];
  startLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative xl:hidden", className)}>
      <Button
        aria-expanded={open}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        className="h-10 w-10 p-0 shadow-none"
        onClick={() => setOpen((value) => !value)}
        type="button"
        variant="outline"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(calc(100vw-1rem),24rem)] rounded-base border-2 border-border bg-background p-3 shadow-shadow">
          <GlobalSearch copy={searchCopy} items={searchItems} />

          <nav className="mt-3 grid gap-1 border-y-2 border-border py-3 text-sm font-heading uppercase">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3 py-2 transition",
                    active ? "bg-main text-main-foreground" : "text-foreground hover:bg-secondary-background",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 grid gap-3 sm:hidden">
            <LanguageSwitcher className="h-10 w-full" locale={locale} tone="light" />
            <Button asChild className="h-10 w-full text-sm">
              <Link href="/login" onClick={() => setOpen(false)}>
                {startLabel}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
