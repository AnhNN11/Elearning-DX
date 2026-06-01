import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Pill, SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCourse, getCourseLessonCount } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  await requireUser();
  const { courseSlug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const course = await getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <Pill>{course.category}</Pill>
          <Pill>{getCourseLessonCount(course)} {dict.courses.lessonUnit}</Pill>
        </div>
        <SectionHeader description={course.description} title={course.title} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {course.modules.map((item, moduleIndex) => (
              <Card key={item.id}>
                <CardHeader>
                  <p className="text-sm font-black uppercase text-primary">
                    {dict.courses.module} {moduleIndex + 1}
                  </p>
                  <CardTitle className="text-xl font-black">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="divide-y">
                  {item.lessons.map((lesson, index) => (
                    <Link
                      className="flex items-center justify-between gap-4 py-3 transition hover:text-primary"
                      href={`/learn/${course.slug}/${lesson.slug}`}
                      key={lesson.id}
                    >
                      <div>
                        <p className="font-bold">{index + 1}. {lesson.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {lesson.estimatedMinutes} {dict.courses.minuteUnit}
                        </p>
                      </div>
                      {lesson.assessment && <Badge variant="secondary">{lesson.assessment.type === "quiz" ? "Quiz" : "Code"}</Badge>}
                    </Link>
                  ))}
                </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent>
            <p className="text-sm font-black uppercase text-primary">{dict.courses.progress}</p>
            <p className="mt-2 text-4xl font-black text-foreground">67%</p>
            <Progress className="mt-4 h-3" value={67} />
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {dict.courses.progressNote}
            </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
