import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquareText,
  PlusCircle,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";
import { AdminCommandSearch, type AdminSearchItem } from "@/components/admin-command-search";
import { AdminDrawerShell } from "@/components/admin-drawer-shell";
import { AdminToast } from "@/components/admin-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { Button } from "./ui/button";

export async function AdminShell({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await requireAdmin();
  const adminNav = [
    { href: "/admin", label: dict.admin.nav.overview, icon: LayoutDashboard, iconKey: "overview" as const },
    { href: "/admin/landing", label: locale === "vi" ? "Trang chủ" : "Landing", icon: Home, iconKey: "home" as const },
    { href: "/admin/courses", label: dict.admin.nav.courses, icon: BookOpen, iconKey: "book" as const },
    { href: "/admin/payments", label: locale === "vi" ? "Thanh toán" : "Payments", icon: CreditCard, iconKey: "credit" as const },
    { href: "/admin/blog", label: dict.admin.nav.blog, icon: FileText, iconKey: "file" as const },
    { href: "/admin/interviews", label: dict.admin.nav.interviews, icon: MessageSquareText, iconKey: "message" as const },
    { href: "/admin/users", label: dict.admin.nav.users, icon: Users, iconKey: "users" as const },
    { href: "/admin/roles", label: locale === "vi" ? "Roles" : "Roles", icon: ShieldCheck, iconKey: "shield" as const },
    { href: "/admin/bookings", label: dict.admin.nav.bookings, icon: CalendarCheck, iconKey: "calendar" as const },
    { href: "/admin/certificates", label: dict.admin.nav.certificates, icon: Award, iconKey: "award" as const },
  ];
  const mobileNavItems = adminNav.map((item) => ({
    href: item.href,
    icon: item.iconKey,
    label: item.label,
  }));
  const searchItems: AdminSearchItem[] = [
    ...adminNav.map((item) => ({
      href: item.href,
      label: item.label,
      description: "Mở khu vực quản trị",
      group: "Điều hướng" as const,
      keywords: `${item.label} admin navigation`,
    })),
    {
      href: "/admin/courses",
      label: "Tạo khóa học mới",
      description: "CRUD course, upload banner, tạo lesson",
      group: "Thao tác",
      keywords: "create course upload banner crud",
    },
    {
      href: "/admin/courses",
      label: "Upload tài liệu khóa học",
      description: "PDF, slide, source code, resource",
      group: "Thao tác",
      keywords: "upload document pdf slide source resource",
    },
    {
      href: "/admin/courses",
      label: "Cấu hình video lesson",
      description: "Kiểm tra link YouTube public/unlisted trước khi publish",
      group: "Thao tác",
      keywords: "youtube video private unlisted public lesson",
    },
    {
      href: "/admin/blog",
      label: "Tạo blog Markdown",
      description: "Upload hoặc paste Markdown, chọn mentor và publish",
      group: "Thao tác",
      keywords: "markdown blog content upload",
    },
  ];

  return (
    <>
      <AdminToast />
      <AdminDrawerShell
        desktopToolbar={
          <>
            <AdminCommandSearch className="hidden w-full max-w-2xl lg:block" endpoint="/api/admin/search-index" items={searchItems} />
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Button asChild className="hidden h-11 px-3 text-xs xl:inline-flex" variant="outline">
                <Link href="/admin/courses">
                  <PlusCircle className="size-4" />
                  Course
                </Link>
              </Button>
              <Button asChild className="hidden h-11 px-3 text-xs xl:inline-flex" variant="secondary">
                <Link href="/admin/courses">
                  <UploadCloud className="size-4" />
                  Upload
                </Link>
              </Button>
              <LanguageSwitcher locale={locale} tone="light" />
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-heading">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </>
        }
        items={mobileNavItems}
        mobileSearch={<AdminCommandSearch endpoint="/api/admin/search-index" items={searchItems} />}
      >
        {children}
      </AdminDrawerShell>
    </>
  );
}
