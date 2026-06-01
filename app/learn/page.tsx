import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CourseCard } from "@/components/course-card";
import { SectionHeader, StatCard } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function LearnPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await requireUser();
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeader
          description={dict.courses.dashboardDescription}
          eyebrow={dict.courses.greeting.replace("{name}", profile.fullName)}
          title={dict.courses.dashboardTitle}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label={dict.courses.demoProgress} note={dict.courses.demoProgressNote} value="67%" />
          <StatCard label={dict.courses.codeRuns} note={dict.courses.codeRunsNote} value="4" />
          <StatCard label={dict.courses.certificates} note={dict.courses.certificatesNote} value="2" />
        </div>
        <Card className="mt-10">
          <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-primary">{dict.courses.continueLearning}</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">{courses[0]?.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {dict.courses.nextLesson}: App Router và layout
              </p>
            </div>
            <Button asChild>
              <Link href={`/learn/${courses[0]?.slug}/${courses[0]?.modules[0]?.lessons[0]?.slug}`}>
                {dict.courses.continueButton}
              </Link>
            </Button>
          </div>
          <Progress className="mt-5 h-3" value={67} />
          </CardContent>
        </Card>
        <div className="mt-10">
          <h2 className="text-2xl font-black text-foreground">{dict.courses.yourCourses}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard copy={dict.courses} course={course} key={course.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
