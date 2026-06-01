"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui";
import { cn } from "@/lib/utils";

type AdminDrawerItem = {
  href: string;
  icon: keyof typeof icons;
  label: string;
};

type AdminDrawerShellProps = {
  children: ReactNode;
  desktopToolbar: ReactNode;
  draftCount: number;
  items: AdminDrawerItem[];
  lessonCount: number;
  mobileSearch: ReactNode;
  queueCount: number;
  totalCourses: number;
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

const storageKey = "dolphinx-admin-drawer-open";

export function AdminDrawerShell({
  children,
  desktopToolbar,
  draftCount,
  items,
  lessonCount,
  mobileSearch,
  queueCount,
  totalCourses,
}: AdminDrawerShellProps) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      window.requestAnimationFrame(() => setDesktopOpen(saved === "true"));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(desktopOpen));
  }, [desktopOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="mt-6 grid gap-1 overflow-y-auto">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-base border-2 px-3 py-3 text-sm font-heading transition hover:border-border hover:bg-secondary",
              active ? "border-border bg-main text-main-foreground shadow-shadow" : "border-transparent text-foreground",
              !desktopOpen && "lg:justify-center lg:px-2",
            )}
            href={item.href}
            key={item.href}
            onClick={() => setMobileOpen(false)}
            title={!desktopOpen ? item.label : undefined}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn("min-w-0 truncate", !desktopOpen && "lg:sr-only")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r-2 border-border bg-card shadow-shadow transition-[width] duration-200 lg:flex lg:flex-col",
          desktopOpen ? "w-72 p-5" : "w-20 p-3",
        )}
      >
        <div className={cn("flex items-center gap-2", desktopOpen ? "justify-between" : "flex-col justify-center")}>
          {desktopOpen ? <Logo className="min-w-0" /> : <span className="rounded-base border-2 border-border bg-main px-2 py-1 text-xs font-heading text-main-foreground shadow-shadow">DX</span>}
          <Button
            aria-expanded={desktopOpen}
            aria-label={desktopOpen ? "Thu gọn drawer admin" : "Mở rộng drawer admin"}
            className="size-10 shrink-0 p-0"
            onClick={() => setDesktopOpen((value) => !value)}
            type="button"
            variant="outline"
          >
            {desktopOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          </Button>
        </div>
        {desktopOpen && <p className="mt-3 text-xs font-heading uppercase text-muted-foreground">Admin workspace</p>}
        <Separator className="my-5" />
        {nav}
        {desktopOpen ? (
          <div className="mt-6 rounded-base border-2 border-border bg-secondary p-4">
            <p className="text-xs font-heading uppercase text-muted-foreground">Content health</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <HealthMetric label="Courses" value={totalCourses} />
              <HealthMetric label="Lessons" value={lessonCount} />
              <HealthMetric danger={queueCount > 0} label="Missing" value={queueCount} />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {draftCount} draft courses. Kiểm tra video, banner và tài liệu trước khi publish.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-2 text-center">
            <CompactHealthMetric danger={queueCount > 0} label="Missing" value={queueCount} />
            <CompactHealthMetric label="Courses" value={totalCourses} />
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Đóng menu admin"
            className="absolute inset-0 bg-overlay"
            onClick={() => setMobileOpen(false)}
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
                onClick={() => setMobileOpen(false)}
                type="button"
                variant="outline"
              >
                <X className="size-4" />
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className={cn("transition-[padding] duration-200", desktopOpen ? "lg:pl-72" : "lg:pl-20")}>
        <header className="sticky top-0 z-30 border-b-2 border-border bg-card/95 px-4 py-3 shadow-shadow backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              aria-expanded={mobileOpen}
              aria-label="Mở menu admin"
              className="size-11 p-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
              variant="outline"
            >
              <Menu className="size-4" />
            </Button>
            <Link className="font-heading text-primary lg:hidden" href="/admin">
              DolphinX Admin
            </Link>
            {desktopToolbar}
          </div>
        </header>
        <div className="border-b-2 border-border bg-secondary-background px-4 py-3 lg:hidden">
          {mobileSearch}
        </div>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}

function HealthMetric({ danger, label, value }: { danger?: boolean; label: string; value: number }) {
  return (
    <div className="rounded-base border-2 border-border bg-background p-2">
      <p className={cn("text-lg font-heading", danger ? "text-destructive" : "text-primary")}>{value}</p>
      <p className="text-[10px] font-heading uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function CompactHealthMetric({ danger, label, value }: { danger?: boolean; label: string; value: number }) {
  return (
    <div className="rounded-base border-2 border-border bg-secondary p-2" title={label}>
      <p className={cn("text-sm font-heading", danger ? "text-destructive" : "text-primary")}>{value}</p>
      <p className="text-[9px] font-heading uppercase text-muted-foreground">{label.slice(0, 4)}</p>
    </div>
  );
}
