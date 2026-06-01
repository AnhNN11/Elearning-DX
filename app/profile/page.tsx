import { AppHeader } from "@/components/app-header";
import { Highlighter } from "@/components/highlighter";
import { ProfileSettings } from "@/components/profile-settings";
import { SectionHeader, StatCard } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { getAccountIdentities, requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const resolvedSearchParams = await searchParams;
  const profile = await requireUser();
  const identities = await getAccountIdentities();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const roleLabel = profile.roles.join(", ") || profile.role;

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <SectionHeader
          description={dict.profile.description}
          eyebrow={dict.profile.eyebrow}
          title={profile.fullName}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label={dict.profile.role} value={roleLabel} />
          <StatCard label={dict.profile.email} value={profile.email ?? dict.profile.demo} />
          <StatCard label={dict.profile.status} value={dict.profile.active} />
        </div>
        <Card className="mt-6 bg-secondary">
          <CardContent>
            <p className="text-sm font-heading uppercase tracking-wide text-primary">
              {dict.profile.highlightsTitle}
            </p>
            <div className="mt-4 space-y-3 text-base leading-7 text-foreground">
              <p>
                <Highlighter>{roleLabel}</Highlighter>{" "}
                {dict.profile.highlightRole}
              </p>
              <p>
                <Highlighter color="var(--accent)">{dict.profile.active}</Highlighter>{" "}
                {dict.profile.highlightAccount}
              </p>
              <p>
                <Highlighter color="var(--main)">{dict.courses.certificates}</Highlighter>{" "}
                {dict.profile.highlightCertificates}
              </p>
            </div>
          </CardContent>
        </Card>
        <ProfileSettings
          copy={dict.profile}
          dateLocale={dateLocale}
          identities={identities}
          profile={profile}
          saved={resolvedSearchParams?.saved === "1"}
        />
      </section>
    </main>
  );
}
