"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DX"
  );
}

export function AccountMenu({
  className,
  locale,
  profile,
}: {
  className?: string;
  locale: Locale;
  profile: Pick<Profile, "avatarUrl" | "email" | "fullName">;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const initials = getInitials(profile.fullName);
  const isVietnamese = locale === "vi";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) {
      setError(isVietnamese ? "Supabase chưa được cấu hình." : "Supabase is not configured.");
      return;
    }

    setLoggingOut(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) {
      setLoggingOut(false);
      setError(signOutError.message);
      return;
    }

    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 max-w-[15rem] items-center gap-2 rounded-base border-2 border-border bg-main px-2 text-main-foreground shadow-shadow transition hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none xl:h-12 xl:max-w-[18rem] xl:px-3"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-base border-2 border-border bg-background bg-cover bg-center text-xs font-heading text-foreground xl:size-9"
          style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
        >
          {!profile.avatarUrl && initials}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-xs font-heading leading-tight xl:text-sm">{profile.fullName}</span>
          {profile.email && (
            <span className="block truncate text-[10px] font-bold leading-tight text-main-foreground/75 xl:text-xs">
              {profile.email}
            </span>
          )}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[min(calc(100vw-1rem),20rem)] rounded-base border-2 border-border bg-background p-3 text-foreground shadow-shadow xl:top-14"
          role="menu"
        >
          <div className="flex min-w-0 items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-base border-2 border-border bg-main bg-cover bg-center font-heading text-main-foreground"
              style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
            >
              {!profile.avatarUrl && initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-foreground">{profile.fullName}</p>
              {profile.email && <p className="truncate text-xs font-bold text-muted-foreground">{profile.email}</p>}
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <MenuLink href="/profile" icon={<UserRound className="size-4" />} onClick={() => setOpen(false)}>
              {isVietnamese ? "Xem hồ sơ" : "View profile"}
            </MenuLink>
            <MenuLink href="/profile#settings" icon={<Settings className="size-4" />} onClick={() => setOpen(false)}>
              {isVietnamese ? "Cài đặt" : "Settings"}
            </MenuLink>
          </div>

          <div className="my-3 border-t-2 border-dashed border-border" />
          <div>
            <p className="mb-2 text-xs font-heading uppercase text-muted-foreground">
              {isVietnamese ? "Ngôn ngữ" : "Language"}
            </p>
            <LanguageSwitcher className="h-11 w-full" locale={locale} tone="light" />
          </div>

          <Button
            className="mt-3 h-11 w-full justify-start"
            disabled={loggingOut}
            onClick={signOut}
            type="button"
            variant="outline"
          >
            <LogOut className="size-4" />
            {loggingOut ? (isVietnamese ? "Đang đăng xuất..." : "Signing out...") : isVietnamese ? "Đăng xuất" : "Sign out"}
          </Button>
          {error && <p className="mt-2 rounded-base border-2 border-border bg-destructive p-2 text-xs font-bold text-white">{error}</p>}
        </div>
      )}
    </div>
  );
}

function MenuLink({
  children,
  href,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      className="flex items-center gap-2 rounded-base border-2 border-transparent px-3 py-2 text-sm font-heading transition hover:border-border hover:bg-secondary-background"
      href={href}
      onClick={onClick}
      role="menuitem"
    >
      {icon}
      {children}
    </Link>
  );
}
