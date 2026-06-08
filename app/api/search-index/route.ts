import { getBlogPosts, getInterviewQuestions } from "@/lib/content";
import { getCourses } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { apiError, apiOk } from "@/lib/api/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locale = await getLocale();
    const [courses, blogPosts, interviewQuestions] = await Promise.all([
      getCourses(),
      getBlogPosts(locale),
      getInterviewQuestions(locale),
    ]);

    const items = [
      ...courses.map((course) => ({
        href: `/courses/${course.slug}`,
        label: course.title,
        text: `${course.title} ${course.description} ${course.category} ${course.level}`,
        type: "course" as const,
      })),
      ...blogPosts.map((post) => ({
        href: `/blog/${post.slug}`,
        label: post.title,
        text: `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")}`,
        type: "blog" as const,
      })),
      ...interviewQuestions.map((question) => ({
        href: "/interview-practice",
        label: question.question,
        text: `${question.question} ${question.category} ${question.level} ${question.prompt}`,
        type: "interview" as const,
      })),
    ];

    return apiOk({ items });
  } catch (error) {
    return apiError(error);
  }
}
