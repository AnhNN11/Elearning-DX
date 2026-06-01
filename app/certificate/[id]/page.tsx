import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCertificate } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const certificate = await getCertificate(id);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Card className="border-8 border-primary print:border-primary">
          <CardContent className="p-8 text-center sm:p-14">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">{dict.certificate.label}</p>
            <h1 className="mt-6 text-4xl font-black text-foreground sm:text-6xl">{dict.certificate.title}</h1>
            <p className="text-muted-foreground mt-8 text-sm font-bold uppercase">{dict.certificate.awardedTo}</p>
            <p className="mt-3 text-3xl font-black text-primary">{certificate.userName}</p>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-foreground">
              {dict.certificate.bodyPrefix} <strong>{certificate.courseTitle}</strong> {dict.certificate.bodySuffix}
            </p>
            <div className="text-muted-foreground mt-10 grid gap-4 border-t pt-6 text-sm font-bold sm:grid-cols-2">
              <span>{dict.certificate.certificateNo}: {certificate.certificateNo}</span>
              <span>{dict.certificate.issuedAt}: {new Date(certificate.issuedAt).toLocaleDateString(dateLocale)}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
