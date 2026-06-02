"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type HeaderNavItem = {
  href: string;
  label: string;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ items }: { items: HeaderNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 shrink-0 items-center gap-4 text-xs font-heading uppercase tracking-wide text-foreground xl:flex">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "header-nav-highlight group relative whitespace-nowrap px-1 py-2 transition duration-200",
              active ? "text-primary" : "hover:-translate-y-0.5 hover:text-primary",
            )}
            data-active={active ? "true" : "false"}
            href={item.href}
            key={item.href}
          >
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
