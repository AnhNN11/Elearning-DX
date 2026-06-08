import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Mail, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { AccountSurfaceNav } from "@/components/account-surface-nav";
import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
import { ProfileSettings } from "@/components/profile-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAccountIdentities, requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

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

function StatusTile({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: LucideIcon;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="rounded-base border-2 border-border bg-secondary-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-heading text-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-base border-2 border-border bg-card">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-heading text-foreground">{value}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-muted-foreground">{note}</p>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t-2 border-dashed border-border py-3 text-sm font-bold">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right text-foreground">{value}</span>
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ account?: string; saved?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const params = await searchParams;
  const profile = await requireUser();
  const identities = await getAccountIdentities();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const isVietnamese = locale === "vi";
  const roleLabel = profile.roles.join(", ") || profile.role;
  const initials = getInitials(profile.fullName);
  const copy = isVietnamese
    ? {
        accountError: "Không thể bắt đầu liên kết Google. Hãy kiểm tra cấu hình provider trong Supabase.",
        accountHealth: "Tình trạng tài khoản",
        accountNavProfile: "Hồ sơ",
        accountNavSettings: "Cài đặt",
        accountPreview: "Tài khoản đang đăng nhập",
        connected: "Đã kết nối",
        description:
          "Quản lý thông tin hiển thị, avatar và provider đăng nhập trong cùng một không gian với hồ sơ học tập.",
        learningData: "Dữ liệu học tập",
        learningNote: "Tiến độ, chứng chỉ và khóa học đang gắn với tài khoản này.",
        profileData: "Hồ sơ",
        profileNote: "Tên và avatar dùng cho chứng chỉ, dashboard học và menu tài khoản.",
        providerStatus: "Google provider",
        ready: "Sẵn sàng",
        security: "Bảo mật",
        securityNote: "Đăng nhập và liên kết tài khoản xử lý qua Supabase Auth.",
        title: "Cài đặt tài khoản",
        viewProfile: "Xem hồ sơ",
      }
    : {
        accountError: "Could not start Google linking. Check the provider configuration in Supabase.",
        accountHealth: "Account health",
        accountNavProfile: "Profile",
        accountNavSettings: "Settings",
        accountPreview: "Signed-in account",
        connected: "Connected",
        description:
          "Manage display details, avatar, and sign-in providers in the same account workspace as your learning profile.",
        learningData: "Learning data",
        learningNote: "Progress, certificates, and unlocked courses are attached to this account.",
        profileData: "Profile",
        profileNote: "Name and avatar are used across certificates, the dashboard, and account menus.",
        providerStatus: "Google provider",
        ready: "Ready",
        security: "Security",
        securityNote: "Sign-in and account linking are handled through Supabase Auth.",
        title: "Account settings",
        viewProfile: "View profile",
      };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate overflow-hidden border-b-2 border-border bg-foreground py-10 text-background">
        <DotPattern className="text-main/25 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_72%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <Badge className="border-background bg-background text-foreground" variant="outline">
              {copy.accountNavSettings}
            </Badge>
            <h1 className="mt-5 text-4xl font-heading leading-none tracking-tight md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-bold leading-8 text-background/75">
              {copy.description}
            </p>
          </div>

          <div className="rounded-base border-2 border-background bg-background p-5 text-foreground shadow-shadow">
            <p className="text-sm font-heading uppercase text-primary">{copy.accountPreview}</p>
            <div className="mt-4 flex items-center gap-4">
              <span
                aria-hidden
                className="grid size-16 shrink-0 place-items-center rounded-base border-2 border-border bg-main bg-cover bg-center text-xl font-heading text-main-foreground shadow-shadow"
                style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
              >
                {!profile.avatarUrl && initials}
              </span>
              <div className="min-w-0">
                <p className="break-words text-xl font-heading leading-tight text-foreground">{profile.fullName}</p>
                <p className="mt-1 break-all text-xs font-bold text-muted-foreground">{profile.email ?? "-"}</p>
              </div>
            </div>
            <Button asChild className="mt-5 w-full">
              <Link href="/profile">
                {copy.viewProfile}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex max-w-7xl justify-center px-4 py-4 sm:justify-start sm:px-6">
          <AccountSurfaceNav
            active="settings"
            profileLabel={copy.accountNavProfile}
            settingsLabel={copy.accountNavSettings}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Card className="shadow-none">
            <CardContent>
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <UserRound className="size-4" />
                {copy.accountHealth}
              </p>
              <div className="mt-4">
                <DetailLine label={dict.profile.role} value={roleLabel} />
                <DetailLine label={dict.profile.email} value={profile.email ?? "-"} />
                <DetailLine label={dict.profile.linkedAccounts} value={String(identities.length)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <StatusTile icon={ShieldCheck} label={copy.security} note={copy.securityNote} value={copy.ready} />
            <StatusTile
              icon={Mail}
              label={copy.providerStatus}
              note={dict.profile.accountDescription}
              value={identities.length ? copy.connected : dict.profile.demo}
            />
            <StatusTile icon={BookOpen} label={copy.learningData} note={copy.learningNote} value={copy.ready} />
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {params?.account === "error" && (
            <div className="rounded-base border-2 border-border bg-accent p-4 text-sm font-heading text-accent-foreground">
              {copy.accountError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-base border-2 border-border bg-card p-5 shadow-none">
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <Settings className="size-4" />
                {copy.profileData}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-muted-foreground">{copy.profileNote}</p>
            </div>
            <div className="rounded-base border-2 border-border bg-card p-5 shadow-none">
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <Sparkles className="size-4" />
                {dict.profile.accountTitle}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-muted-foreground">
                {dict.profile.demoAccountNote}
              </p>
            </div>
          </div>

          <ProfileSettings
            copy={dict.profile}
            dateLocale={dateLocale}
            identities={identities}
            profile={profile}
            returnTo="/settings"
            saved={params?.saved === "1"}
          />
        </div>
      </section>
    </main>
  );
}
