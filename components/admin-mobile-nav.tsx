"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminMobileNavItem = {
  href: string;
  icon: keyof typeof icons;
  label: string;
};

const icons = {
  award: Award,
  book: BookOpen,
  calendar: CalendarCheck,
  file: FileText,
  home: Home,
  overview: LayoutDashboard,
  message: MessageSquareText,
  shield: ShieldCheck,
  users: Users,
};

export function AdminMobileNav({ items }: { items: AdminMobileNavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-expanded={open}
        aria-label="Mở menu admin"
        className="size-11 p-0 lg:hidden"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <Menu className="size-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Đóng menu admin"
            className="absolute inset-0 bg-overlay"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="relative z-10 flex h-full w-[min(21rem,calc(100vw-2rem))] flex-col border-r-2 border-border bg-card p-4 shadow-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-heading text-primary">DolphinX Admin</p>
                <p className="text-xs text-muted-foreground">Admin workspace</p>
              </div>
              <Button
                aria-label="Đóng menu admin"
                className="size-10 p-0"
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav className="mt-6 grid gap-1 overflow-y-auto">
              {items.map((item) => {
                const Icon = icons[item.icon];

                return (
                  <Link
                    className="flex items-center gap-3 rounded-base border-2 border-transparent px-3 py-3 text-sm font-heading hover:border-border hover:bg-secondary"
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
