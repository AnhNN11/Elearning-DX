import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Logo } from "./ui";

export async function AdminShell({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await requireAdmin();
  const adminNav = [
    { href: "/admin", label: dict.admin.nav.overview },
    { href: "/admin/courses", label: dict.admin.nav.courses },
    { href: "/admin/blog", label: dict.admin.nav.blog },
    { href: "/admin/interviews", label: dict.admin.nav.interviews },
    { href: "/admin/users", label: dict.admin.nav.users },
    { href: "/admin/bookings", label: dict.admin.nav.bookings },
    { href: "/admin/certificates", label: dict.admin.nav.certificates },
  ];

  return (
    <div className="min-h-screen bg-background">
      <aside className="bg-card fixed inset-y-0 left-0 hidden w-64 border-r p-5 lg:block">
        <Logo />
        <Separator className="my-6" />
        <nav className="space-y-2">
          {adminNav.map((item) => (
            <Button asChild className="w-full justify-start" key={item.href} variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="bg-card flex h-16 items-center justify-between border-b px-4 sm:px-8">
          <Link className="font-black text-primary lg:hidden" href="/">
            DolphinX
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher locale={locale} tone="light" />
            <p className="text-muted-foreground text-sm font-bold">{profile.fullName}</p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
