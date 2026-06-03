import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Pill, SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCourse, getCourseLessonCount, getUserEnrollments } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const profile = await requireUser();
  const { courseSlug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const course = await getCourse(courseSlug);

  if (!course) {
    notFound();
  }
  const enrollments = await getUserEnrollments(profile.id);
  const enrollment = enrollments.find((item) => item.courseId === course.id);

  if (!enrollment) {
    redirect(`/courses/${course.slug}`);
  }

  const progress = enrollment?.progressPercent ?? 0;
  const resources = course.assets.filter((asset) => asset.kind !== "banner");

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
          <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardContent>
              <p className="text-sm font-black uppercase text-primary">{dict.courses.progress}</p>
              <p className="mt-2 text-4xl font-black text-foreground">{progress}%</p>
              <Progress className="mt-4 h-3" value={progress} />
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                {dict.courses.progressNote}
              </p>
              </CardContent>
            </Card>
            {resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-black">Tài liệu môn học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resources.map((asset) => (
                    <a
                      className="block rounded-base border-2 border-border bg-secondary-background p-3 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:shadow-shadow"
                      href={asset.publicUrl}
                      key={asset.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Badge variant="outline">{asset.kind}</Badge>
                      <span className="mt-2 block">{asset.title}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
