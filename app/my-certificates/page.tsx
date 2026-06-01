import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { SectionHeader } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getUserCertificates } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function MyCertificatesPage() {
  const profile = await requireUser();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const certificates = await getUserCertificates(profile.id);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeader
          description={dict.courses.certificatesNote}
          eyebrow={dict.nav.certificates}
          title={dict.nav.certificates}
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {certificates.length ? certificates.map((certificate) => (
            <Card className="transition hover:-translate-y-1 hover:shadow-md" key={certificate.id}>
              <CardContent>
                <Link className="block" href={`/certificate/${certificate.id}`}>
                  <p className="text-sm font-black uppercase text-primary">{certificate.certificateNo}</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">{certificate.courseTitle}</h2>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {dict.certificate.issuedAt}: {new Date(certificate.issuedAt).toLocaleDateString(dateLocale)}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )) : (
            <Card className="border-dashed">
              <CardContent>
                <p className="font-bold text-muted-foreground">Bạn chưa có chứng chỉ thật trong Supabase.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
