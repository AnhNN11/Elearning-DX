import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { CourseCard } from "@/components/course-card";
import { DotPattern } from "@/components/dot-pattern";
import { HomeContactForm } from "@/components/home-contact-form";
import { HomeMentorBooking } from "@/components/home-mentor-booking";
import { MagicCodingShowcase } from "@/components/magic-coding-showcase";
import { TypingAnimation } from "@/components/typing-animation";
import { ButtonLink, SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLandingBlocks } from "@/lib/content";
import { getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const landingBlocks = await getLandingBlocks(locale);
  const courses = await getCourses();
  const t = dict.home;
  const heroBlock = landingBlocks.find((block) => block.key === "hero");
  const dynamicBlocks = landingBlocks.filter((block) => block.key !== "hero");
  const heroStats = heroBlock?.items.length
    ? heroBlock.items.map((item) => [item.title, item.description ?? ""] as const)
    : t.stats;

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <div className="overflow-hidden border-y-2 border-foreground bg-cyan-300 py-2">
        <div className="dx-ticker flex w-max gap-10 whitespace-nowrap text-sm font-black uppercase tracking-[0.24em] text-foreground">
          {[...t.ticker, ...t.ticker].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <DotPattern className="text-background/12 [mask-image:radial-gradient(circle_at_32%_30%,black,transparent_76%)]" />
        <div className="hero-board-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(19,188,231,0.55),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(255,79,94,0.32),transparent_30%),linear-gradient(135deg,#075bbb_0%,#063c8b_55%,#071a2f_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
          <div className="relative z-10 dx-animate-in">
            <Badge className="border-background bg-background text-foreground" variant="outline">
              {heroBlock?.eyebrow ?? t.heroBadge}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
              {heroBlock?.title ? (
                heroBlock.title
              ) : (
                <>
                  {t.heroTitleA}
                  <br />
                  <span className="inline-block bg-background px-3 text-foreground">
                    <TypingAnimation words={[...t.heroTypingWords]} />
                  </span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-primary-foreground/90">
              {heroBlock?.description ?? t.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={heroBlock?.ctaHref ?? "/mentor-booking"}>
                {heroBlock?.ctaLabel ?? t.bookMentor}
              </ButtonLink>
              <ButtonLink href={heroBlock?.secondaryCtaHref ?? "/interview-practice"} variant="secondary">
                {heroBlock?.secondaryCtaLabel ?? t.interviewPractice}
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-3 border-t-2 border-dashed border-background/80 pt-6 sm:grid-cols-4">
              {heroStats.map(([value, label]) => (
                <div key={label}>
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-sm font-bold uppercase text-primary-foreground/75">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dx-card dx-animate-in-delay dx-float bg-background p-5 text-foreground">
            <div
              className="dx-scan-line mb-5 overflow-hidden rounded-lg border-2 border-foreground bg-white p-4"
              style={heroBlock?.imageUrl ? { backgroundImage: `url(${heroBlock.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
            >
              {!heroBlock?.imageUrl && (
                <Image
                  alt="DolphinX Studio logo"
                  className="h-auto w-full"
                  height={500}
                  priority
                  src="/brand/dolphinx-logo.png"
                  width={700}
                />
              )}
              {heroBlock?.imageUrl && <div className="h-72" />}
            </div>
            <p className="inline-flex bg-foreground px-3 py-1 text-xs font-black uppercase tracking-wide text-background">
              {t.ticketLabel}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-none">{t.ticketTitle}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t-2 border-dashed border-foreground pt-5 text-sm">
              {t.ticketFields.map(([label, value]) => (
                <div key={label}>
                  <p className="text-muted-foreground font-bold uppercase">{label}</p>
                  <p className="mt-1 font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {dynamicBlocks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {dynamicBlocks.map((block) => (
              <Card className="dx-card overflow-hidden bg-card" key={block.id}>
                {block.imageUrl && (
                  <div
                    className="h-56 border-b-2 border-border bg-secondary-background"
                    style={{ backgroundImage: `url(${block.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
                  />
                )}
                <CardHeader>
                  {block.eyebrow && <Badge className="w-fit">{block.eyebrow}</Badge>}
                  <CardTitle className="text-3xl font-black uppercase leading-tight">{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {block.description && (
                    <p className="text-sm leading-7 text-muted-foreground">{block.description}</p>
                  )}
                  {block.items.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {block.items.map((item) => (
                        <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={item.title}>
                          <p className="font-black text-foreground">{item.title}</p>
                          {item.description && (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {(block.ctaLabel || block.secondaryCtaLabel) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {block.ctaLabel && block.ctaHref && (
                        <Button asChild>
                          <Link href={block.ctaHref}>{block.ctaLabel}</Link>
                        </Button>
                      )}
                      {block.secondaryCtaLabel && block.secondaryCtaHref && (
                        <Button asChild variant="outline">
                          <Link href={block.secondaryCtaHref}>{block.secondaryCtaLabel}</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            description={t.flowDescription}
            eyebrow={t.flowEyebrow}
            title={t.flowTitle}
          />
          <Button asChild variant="outline">
            <Link href="/courses">{t.viewCatalog}</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {t.agenda.map(([step, title, description]) => (
            <Card className="dx-card bg-card transition hover:-translate-y-1 hover:shadow-md" key={step}>
              <CardHeader>
                <Badge className="w-fit">{step}</Badge>
                <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-6">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <MagicCodingShowcase copy={t} />

      <section className="bg-foreground py-16 text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">{t.coursesEyebrow}</p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-tight">{t.featuredCourses}</h2>
            </div>
            <Link className="font-black uppercase text-cyan-300" href="/courses">
              {t.viewAll}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard copy={dict.courses} course={course} key={course.id} />
            ))}
          </div>
        </div>
      </section>

      <section id="consultation">
        <HomeMentorBooking copy={t} locale={locale} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <SectionHeader
            description={t.careerDescription}
            eyebrow={t.careerEyebrow}
            title={t.careerTitle}
          />
        </div>
        <HomeContactForm copy={t} />
      </section>
    </main>
  );
}
