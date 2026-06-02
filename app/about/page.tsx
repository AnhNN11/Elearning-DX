import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Code2, Rocket, Target } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
import { Highlighter } from "@/components/highlighter";
import { SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mentors } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.about;
  const introIcons = [Target, Code2, ClipboardCheck, Rocket];

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate overflow-hidden border-b-2 border-foreground bg-primary py-16 text-primary-foreground">
        <DotPattern className="text-background/20 [mask-image:radial-gradient(circle_at_35%_30%,black,transparent_72%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(19,188,231,0.5),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(255,79,94,0.28),transparent_28%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge className="border-background bg-background text-foreground" variant="outline">
              {t.eyebrow}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              {t.title}{" "}
              <Highlighter
                animationDuration={900}
                className="text-foreground"
                color="var(--main)"
                iterations={4}
                jitter={7}
                padding={[5, 18, 5, 16]}
              >
                {t.highlight}
              </Highlighter>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-primary-foreground/90">
              {t.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-background hover:bg-secondary" style={{ color: "var(--primary)" }}>
                <Link href="/courses">{t.ctaPrimary}</Link>
              </Button>
              <Button
                asChild
                className="border-background bg-background hover:bg-secondary"
                style={{ color: "var(--primary)" }}
                variant="outline"
              >
                <Link href="/mentor-booking">{t.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.stats.map(([value, label]) => (
              <Card className="border-background/80 bg-background/95 text-foreground" key={label}>
                <CardContent>
                  <p className="text-4xl font-black text-primary">{value}</p>
                  <p className="mt-2 text-sm font-black uppercase text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]">
        <SectionHeader
          description={t.introDescription}
          eyebrow={t.introEyebrow}
          title={t.introTitle}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {t.introCards.map(([title, description], index) => {
            const Icon = introIcons[index] ?? CheckCircle2;

            return (
              <Card className="dx-card bg-card" key={title}>
                <CardContent>
                  <div className="mb-5 grid size-12 place-items-center rounded-base border-2 border-border bg-secondary text-primary shadow-shadow">
                    <Icon className="size-6" />
                  </div>
                  <h2 className="text-xl font-black text-foreground">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          description={t.sectionDescription}
          eyebrow={t.sectionEyebrow}
          title={t.sectionTitle}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {mentors.map((mentor, index) => {
            const profile = t.mentorProfiles[index] ?? t.mentorProfiles[0];

            return (
              <Card className="dx-card overflow-hidden bg-card" key={mentor.name}>
                <div className="relative isolate bg-primary p-6 text-primary-foreground">
                  <DotPattern className="text-background/18 [mask-image:radial-gradient(circle_at_38%_20%,black,transparent_70%)]" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="grid size-20 place-items-center rounded-base border-2 border-background bg-background text-2xl font-black text-primary shadow-shadow">
                      {getInitials(mentor.name)}
                    </div>
                    <Badge className="border-background bg-background text-foreground" variant="outline">
                      {profile.experience}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-3xl font-black uppercase leading-tight">
                    {mentor.name}
                  </CardTitle>
                  <p className="text-sm font-black text-primary">{mentor.role}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-7 text-muted-foreground">{profile.bio}</p>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      {t.expertiseLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mentor.expertise.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      {t.focusLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.focus.map((item) => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-base border-2 border-border bg-secondary p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      {t.scheduleLabel}
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">{mentor.schedule}</p>
                  </div>
                  <p className="text-sm leading-7 text-foreground">{profile.outcome}</p>
                  <Button asChild className="w-full">
                    <Link href="/mentor-booking">{t.bookMentor}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-heading uppercase tracking-wide text-primary">{t.journeyEyebrow}</p>
          <h2 className="mt-2 max-w-2xl text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {t.journeyTitle}
          </h2>
          <div className="mt-8 space-y-4">
            {t.journeySteps.map(([step, title, description]) => (
              <div className="grid gap-4 rounded-base border-2 border-border bg-card p-5 shadow-shadow sm:grid-cols-[72px_1fr]" key={step}>
                <div className="grid size-14 place-items-center rounded-base border-2 border-border bg-main font-mono text-xl font-black text-main-foreground">
                  {step}
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-heading uppercase tracking-wide text-primary">{t.promiseEyebrow}</p>
          <h2 className="mt-2 max-w-2xl text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {t.promiseTitle}
          </h2>
          <div className="mt-8 grid gap-4">
            {t.promiseItems.map(([title, description]) => (
              <div className="rounded-base border-2 border-border bg-secondary p-5 shadow-shadow" key={title}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-xl font-black text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-main">{t.methodEyebrow}</p>
          <h2 className="mt-2 max-w-3xl text-4xl font-black uppercase tracking-tight md:text-5xl">
            {t.methodTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.methodItems.map(([step, title, description]) => (
              <div className="rounded-base border-2 border-background/80 bg-background/5 p-5" key={step}>
                <p className="font-mono text-sm font-black text-main">{step}</p>
                <h3 className="mt-3 text-xl font-black text-background">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-background/75">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-border bg-secondary py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-3xl text-4xl font-black uppercase leading-tight text-foreground md:text-5xl">
              {t.finalTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{t.finalDescription}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/courses">
                {t.ctaPrimary}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/mentor-booking">{t.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
