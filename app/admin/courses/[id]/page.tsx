import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Pill } from "@/components/ui";
import { createLessonAction, updateLessonVideoAction } from "@/lib/actions";
import { getCourses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const courses = await getCourses(true);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    notFound();
  }

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Course editor</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">{course.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">{course.description}</p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {course.modules.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-xl font-black">{item.title}</CardTitle>
                <Button type="button" variant="ghost">{dict.admin.edit}</Button>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {item.lessons.map((lesson) => (
                    <div className="grid gap-3 py-4 xl:grid-cols-[1fr_420px]" key={lesson.id}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground">{lesson.title}</p>
                          {lesson.assessment && <Pill>{lesson.assessment.type}</Pill>}
                          {lesson.videoUrl && <Pill>YouTube</Pill>}
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">{lesson.slug}</p>
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-black text-primary">
                            {dict.admin.previewMarkdown}
                          </summary>
                          <div className="mt-3 rounded-lg border bg-background p-4">
                            <MarkdownViewer content={lesson.content || dict.admin.emptyMarkdown} />
                          </div>
                        </details>
                      </div>
                      <form action={updateLessonVideoAction} className="flex gap-2">
                        <input name="courseId" type="hidden" value={course.id} />
                        <input name="courseSlug" type="hidden" value={course.slug} />
                        <input name="lessonId" type="hidden" value={lesson.id} />
                        <Input
                          aria-label={`Link YouTube cho ${lesson.title}`}
                          className="min-w-0"
                          defaultValue={lesson.videoUrl ?? ""}
                          name="videoUrl"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <Button type="submit" variant="secondary">
                          {dict.admin.save}
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardContent>
            <h2 className="text-xl font-black text-foreground">{dict.admin.publishingInfo}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>{dict.admin.slug}:</strong> {course.slug}
              </p>
              <p>
                <strong>{dict.admin.level}:</strong> {course.level}
              </p>
              <p>
                <strong>{dict.admin.published}:</strong> {course.published ? "Yes" : "No"}
              </p>
            </div>
            <p className="bg-secondary text-secondary-foreground mt-5 rounded-md p-3 text-sm leading-6">
              {dict.admin.addLessonHelp}
            </p>
            <form action={createLessonAction} className="mt-5 space-y-3">
              <input name="courseId" type="hidden" value={course.id} />
              <Input
                name="moduleTitle"
                placeholder={dict.admin.newModule}
                required
              />
              <Input
                name="title"
                placeholder={dict.admin.lessonName}
                required
              />
              <Input
                name="slug"
                placeholder="lesson-slug"
                required
              />
              <Input
                name="videoUrl"
                placeholder={dict.admin.youtubeLesson}
              />
              <MarkdownEditor
                emptyPreview={dict.admin.emptyMarkdown}
                name="content"
                placeholder={dict.admin.markdownContent}
                required
              />
              <Button className="w-full" type="submit">
                {dict.admin.addLesson}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
