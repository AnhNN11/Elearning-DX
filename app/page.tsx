import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { CourseCard } from "@/components/course-card";
import { DotPattern } from "@/components/dot-pattern";
import { MagicCodingShowcase } from "@/components/magic-coding-showcase";
import { TypingAnimation } from "@/components/typing-animation";
import { ButtonLink, SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPosts, getInterviewQuestions, mentors } from "@/lib/content";
import { getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const blogPosts = await getBlogPosts(locale);
  const interviewQuestions = await getInterviewQuestions(locale);
  const courses = await getCourses();
  const t = dict.home;

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
        <DotPattern className="text-background/18 [mask-image:radial-gradient(circle_at_32%_30%,black,transparent_72%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(19,188,231,0.55),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(255,79,94,0.32),transparent_30%),linear-gradient(135deg,#075bbb_0%,#063c8b_55%,#071a2f_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
          <div className="relative z-10 dx-animate-in">
            <Badge className="border-background bg-background text-foreground" variant="outline">
              {t.heroBadge}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
              {t.heroTitleA}
              <br />
              <span className="inline-block bg-background px-3 text-foreground">
                <TypingAnimation words={[...t.heroTypingWords]} />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-primary-foreground/90">
              {t.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/mentor-booking">{t.bookMentor}</ButtonLink>
              <ButtonLink href="/interview-practice" variant="secondary">
                {t.interviewPractice}
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-3 border-t-2 border-dashed border-background/80 pt-6 sm:grid-cols-4">
              {t.stats.map(([value, label]) => (
                <div key={label}>
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-sm font-bold uppercase text-primary-foreground/75">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dx-card dx-animate-in-delay dx-float bg-background p-5 text-foreground">
            <div className="dx-scan-line mb-5 overflow-hidden rounded-lg border-2 border-foreground bg-white p-4">
              <Image
                alt="DolphinX Studio logo"
                className="h-auto w-full"
                height={500}
                priority
                src="/brand/dolphinx-logo.jpg"
                width={700}
              />
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]" id="consultation">
        <div>
          <SectionHeader
            description={t.mentorDescription}
            eyebrow={t.mentorEyebrow}
            title={t.mentorTitle}
          />
          <div className="mt-8 grid gap-4">
            {mentors.map((mentor) => (
              <Card className="dx-card transition hover:-translate-y-1 hover:shadow-md" key={mentor.name}>
                <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-xl font-black text-foreground">{mentor.name}</p>
                    <p className="text-muted-foreground mt-1 text-sm font-bold">{mentor.role}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mentor.expertise.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-black uppercase text-primary">{mentor.schedule}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="dx-card bg-card">
          <CardHeader>
            <Badge className="w-fit">{t.bookingBadge}</Badge>
            <CardTitle className="text-3xl font-black uppercase">{t.bookingTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", t.fullName],
                ["02", t.preferredTime],
                ["03", t.topic],
                ["04", t.note],
              ].map(([step, label]) => (
                <div className="rounded-base border-2 border-border bg-secondary p-4" key={step}>
                  <p className="font-mono text-xs font-black text-primary">{step}</p>
                  <p className="mt-2 text-sm font-black uppercase text-foreground">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {dict.booking.description}
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/mentor-booking">{t.submitBooking}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            description={t.careerDescription}
            eyebrow={t.careerEyebrow}
            title={t.careerTitle}
          />
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/blog">{dict.nav.blog}</Link>
            </Button>
            <Button asChild>
              <Link href="/interview-practice">{dict.nav.interview}</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Card className="dx-card" key={post.slug}>
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">{post.category}</Badge>
                  <CardTitle className="text-xl font-black">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">{post.excerpt}</p>
                  <Link className="mt-5 inline-flex text-sm font-black text-primary" href={`/blog/${post.slug}`}>
                    {t.readPost}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="dx-card bg-primary text-primary-foreground">
            <CardHeader>
              <Badge className="w-fit bg-background text-foreground">{t.interviewBank}</Badge>
              <CardTitle className="text-3xl font-black uppercase">{interviewQuestions.length} {t.keyQuestions}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-primary-foreground/85">
                {t.interviewBankDescription}
              </p>
              <Button
                asChild
                className="mt-6 bg-background hover:bg-secondary"
                style={{ color: "var(--primary)" }}
              >
                <Link href="/interview-practice">{t.startPractice}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
