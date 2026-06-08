import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getBlogPosts, getInterviewQuestions } from "@/lib/content";
import { getCourses } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";

type AdminSearchItem = {
  href: string;
  label: string;
  description?: string;
  group: "Điều hướng" | "Khóa học" | "Lesson" | "Nội dung" | "Thao tác";
  keywords: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireApiAdmin();

    const locale = await getLocale();
    const [courses, blogPosts, interviewQuestions] = await Promise.all([
      getCourses(true),
      getBlogPosts(locale, true),
      getInterviewQuestions(locale, true),
    ]);

    const items: AdminSearchItem[] = [
      ...courses.map((course) => ({
        href: `/admin/courses/${course.id}`,
        label: course.title,
        description: `${course.category} - ${course.published ? "Published" : "Draft"}`,
        group: "Khóa học" as const,
        keywords: `${course.slug} ${course.description} ${course.category} ${course.level}`,
      })),
      ...courses.flatMap((course) =>
        course.modules.flatMap((module) =>
          module.lessons.map((lesson) => ({
            href: `/admin/courses/${course.id}`,
            label: lesson.title,
            description: `${course.title} - ${module.title}`,
            group: "Lesson" as const,
            keywords: `${lesson.slug} ${lesson.content.slice(0, 280)} ${lesson.videoUrl ?? ""}`,
          })),
        ),
      ),
      ...blogPosts.map((post) => ({
        href: "/admin/blog",
        label: post.title,
        description: `${post.category} - ${post.readTime}`,
        group: "Nội dung" as const,
        keywords: `${post.slug} ${post.excerpt} ${post.tags.join(" ")} ${post.content.slice(0, 2).join(" ")}`,
      })),
      ...interviewQuestions.slice(0, 30).map((question) => ({
        href: "/admin/interviews",
        label: question.question,
        description: `${question.category} - ${question.level}`,
        group: "Nội dung" as const,
        keywords: `${question.prompt.slice(0, 180)} ${question.answer.slice(0, 180)} ${question.checklist.join(" ")}`,
      })),
    ];

    return apiOk({ items });
  } catch (error) {
    return apiError(error);
  }
}
