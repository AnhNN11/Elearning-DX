import { notFound } from "next/navigation";
import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { ButtonLink, Pill, SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enrollCourseAction } from "@/lib/actions";
import { getCourse, getCourseLessonCount } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }
  const resources = course.assets.filter((asset) => asset.kind !== "banner");

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Pill>{course.category}</Pill>
            <Pill>{course.level}</Pill>
            <Pill>{course.durationHours} {dict.courses.hourUnit}</Pill>
          </div>
          <SectionHeader description={course.description} title={course.title} />
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-black">{dict.courses.outcomesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((outcome) => (
                <div className="bg-muted rounded-md p-3 text-sm font-bold text-foreground" key={outcome}>
                  {outcome}
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
          <div className="mt-6 space-y-4">
            {course.modules.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-black">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="divide-y">
                  {item.lessons.map((lesson) => (
                    <div className="flex items-center justify-between gap-4 py-3" key={lesson.id}>
                      <div>
                        <p className="font-bold text-foreground">{lesson.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {lesson.estimatedMinutes} {dict.courses.minuteUnit}
                        </p>
                      </div>
                      {lesson.assessment && <Badge variant="secondary">{lesson.assessment.type === "quiz" ? "Quiz" : "Code"}</Badge>}
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {resources.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-black">Tài liệu khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.map((asset) => (
                    <a
                      className="rounded-base border-2 border-border bg-secondary-background p-4 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:shadow-shadow"
                      href={asset.publicUrl}
                      key={asset.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="block text-primary">{asset.kind}</span>
                      <span className="mt-1 block">{asset.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent>
          <div className="relative h-44 overflow-hidden rounded-base border-2 border-border bg-muted">
            {course.thumbnailUrl ? (
              <Image
                alt={`${course.title} banner`}
                className="h-full w-full object-cover"
                height={360}
                priority
                src={course.thumbnailUrl}
                width={640}
              />
            ) : (
              <div className="grid h-full place-items-center bg-secondary px-6 text-center text-xl font-black uppercase text-foreground">
                {course.title}
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="bg-muted rounded-md p-3">
              <p className="text-2xl font-black text-primary">{getCourseLessonCount(course)}</p>
              <p className="text-muted-foreground text-xs font-bold">{dict.courses.lessonsLabel}</p>
            </div>
            <div className="bg-muted rounded-md p-3">
              <p className="text-2xl font-black text-primary">100%</p>
              <p className="text-muted-foreground text-xs font-bold">{dict.courses.certificateLabel}</p>
            </div>
          </div>
          <form action={enrollCourseAction} className="mt-5">
            <input name="courseId" type="hidden" value={course.id} />
            <input name="courseSlug" type="hidden" value={course.slug} />
            <Button className="w-full" size="lg" type="submit">
              {dict.courses.enroll}
            </Button>
          </form>
          <div className="mt-3">
            <ButtonLink href={`/learn/${course.slug}`} variant="secondary">
              {dict.courses.continueButton}
            </ButtonLink>
          </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
