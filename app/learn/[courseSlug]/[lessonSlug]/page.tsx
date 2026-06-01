import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { CodeRunner } from "@/components/code-runner";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { QuizPanel } from "@/components/quiz-panel";
import { Pill } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeLessonAction } from "@/lib/actions";
import { getLesson, getNextLesson } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  await requireUser();
  const { courseSlug, lessonSlug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { course, lesson } = await getLesson(courseSlug, lessonSlug);

  if (!course || !lesson) {
    notFound();
  }

  const nextLesson = getNextLesson(course, lesson);
  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[290px_1fr]">
        <Card className="h-fit lg:sticky lg:top-24">
          <CardContent>
          <Link className="text-sm font-black text-primary" href={`/learn/${course.slug}`}>
            ← {course.title}
          </Link>
          <div className="mt-5 space-y-4">
            {course.modules.map((item) => (
              <div key={item.id}>
                <p className="text-muted-foreground text-xs font-black uppercase">{item.title}</p>
                <div className="mt-2 space-y-1">
                  {item.lessons.map((moduleLesson) => (
                    <Link
                      className={`block rounded-md px-3 py-2 text-sm font-bold ${
                        moduleLesson.id === lesson.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                      href={`/learn/${course.slug}/${moduleLesson.slug}`}
                      key={moduleLesson.id}
                    >
                      {moduleLesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Pill>{lesson.estimatedMinutes} {dict.courses.minuteUnit}</Pill>
                {lesson.assessment && <Pill>{lesson.assessment.type === "quiz" ? "Quiz" : "Code"}</Pill>}
                {embedUrl && <Pill>YouTube</Pill>}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">{lesson.title}</h1>
              {embedUrl && (
                <div className="mt-6 overflow-hidden rounded-lg border-2 border-foreground bg-foreground shadow-sm">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full"
                    src={embedUrl}
                    title={lesson.title}
                  />
                </div>
              )}
              <MarkdownViewer className="mt-5" content={lesson.content} />
              <form action={completeLessonAction} className="mt-6 flex flex-wrap gap-3">
                <input name="courseSlug" type="hidden" value={course.slug} />
                <input name="lessonSlug" type="hidden" value={lesson.slug} />
                <Button type="submit">
                  {dict.courses.markComplete}
                </Button>
                {nextLesson && (
                  <Button asChild variant="outline">
                    <Link href={`/learn/${course.slug}/${nextLesson.slug}`}>{dict.courses.nextLessonButton}</Link>
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          {lesson.assessment?.type === "quiz" && <QuizPanel assessment={lesson.assessment} copy={dict.assessment} />}
          {lesson.assessment?.type === "code" && <CodeRunner assessment={lesson.assessment} copy={dict.assessment} />}
        </div>
      </section>
    </main>
  );
}
