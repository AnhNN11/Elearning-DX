import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock3, ListChecks } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ButtonLink, Pill, SectionHeader } from "@/components/ui";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutCourseAction, enrollCourseAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/auth";
import { getCourse, getCourseLessonCount, getUserEnrollments } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { formatVnd } from "@/lib/money";

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
  const lessonCount = getCourseLessonCount(course);
  const isVietnamese = locale === "vi";
  const isPaidCourse = course.priceVnd > 0;
  const isFreeCourse = !isPaidCourse;
  const profile = await getCurrentProfile();
  const isEnrolled = profile
    ? (await getUserEnrollments(profile.id)).some((enrollment) => enrollment.courseId === course.id)
    : false;
  const loginHref = `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`;
  const loginButtonLabel = isPaidCourse
    ? isVietnamese
      ? "Đăng nhập để thanh toán"
      : "Sign in to pay"
    : isVietnamese
      ? "Đăng nhập để đăng ký học"
      : "Sign in to enroll";
  const checkoutButtonLabel = isPaidCourse
    ? isVietnamese
      ? "Thanh toán SePay"
      : "Pay with SePay"
    : dict.courses.enroll;

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Pill>{course.category}</Pill>
            <Pill>{course.level}</Pill>
            <Pill>{course.durationHours} {dict.courses.hourUnit}</Pill>
            <Pill>{formatVnd(course.priceVnd)}</Pill>
            {isFreeCourse && <Badge>Free</Badge>}
          </div>
          <div className="max-w-2xl">
            <SectionHeader title={course.title} />
            {course.description && (
              <MarkdownViewer className="mt-4 text-base" content={course.description} />
            )}
          </div>
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
            {course.modules.map((item, moduleIndex) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg font-black">
                    <span className="grid size-9 place-items-center rounded-base border-2 border-border bg-secondary text-sm text-primary">
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </CardTitle>
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
                        {lesson.assessment && (
                          <Badge variant="secondary">
                            {lesson.assessment.type === "quiz" ? "Quiz" : "Code"}
                          </Badge>
                        )}
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
              <p className="text-2xl font-black text-primary">{lessonCount}</p>
              <p className="text-muted-foreground text-xs font-bold">{dict.courses.lessonsLabel}</p>
            </div>
            <div className="bg-muted rounded-md p-3">
              <p className="text-2xl font-black text-primary">100%</p>
              <p className="text-muted-foreground text-xs font-bold">{dict.courses.certificateLabel}</p>
            </div>
          </div>
          <div className="mt-5 rounded-base border-2 border-border bg-secondary-background p-4">
            <p className="text-xs font-heading uppercase text-muted-foreground">
              {isVietnamese ? "Học phí" : "Tuition"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-3xl font-heading text-primary">{formatVnd(course.priceVnd)}</p>
              {isFreeCourse && <Badge>Free</Badge>}
            </div>
            {isPaidCourse && (
              <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">
                {isVietnamese
                  ? "Thanh toán bằng SePay, hệ thống tự mở quyền học sau khi IPN xác nhận."
                  : "Pay with SePay. Access is unlocked automatically after IPN confirmation."}
              </p>
            )}
          </div>
          <div className="mt-5">
            {isEnrolled ? (
              <ButtonLink className="w-full" href={`/learn/${course.slug}`}>
                {dict.courses.continueButton}
              </ButtonLink>
            ) : !profile ? (
              <Button asChild className="w-full" size="lg">
                <Link href={loginHref}>{loginButtonLabel}</Link>
              </Button>
            ) : (
              <form action={isPaidCourse ? checkoutCourseAction : enrollCourseAction}>
                <input name="courseId" type="hidden" value={course.id} />
                <input name="courseSlug" type="hidden" value={course.slug} />
                <Button className="w-full" size="lg" type="submit">
                  {checkoutButtonLabel}
                </Button>
              </form>
            )}
          </div>
          {!profile && (
            <p className="mt-3 text-sm font-bold leading-6 text-muted-foreground">
              {isVietnamese
                ? "Bạn cần đăng nhập trước khi đăng ký học hoặc tạo đơn thanh toán."
                : "Sign in before enrolling or creating a payment order."}
            </p>
          )}
          <div className="mt-6 rounded-base border-2 border-border bg-secondary-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-heading uppercase text-primary">
                  {isVietnamese ? "Mục lục" : "Table of contents"}
                </p>
                <h2 className="mt-1 text-xl font-black text-foreground">
                  {isVietnamese ? "Nội dung khóa học" : "Course content"}
                </h2>
              </div>
              <ListChecks className="size-6 text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="size-4 text-primary" />
                {course.modules.length} {dict.courses.module}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-4 text-primary" />
                {course.durationHours} {dict.courses.hourUnit}
              </span>
            </div>
            <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id}>
                  <p className="text-sm font-black text-foreground">
                    {moduleIndex + 1}. {module.title}
                  </p>
                  <div className="mt-2 space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Link
                        className="block rounded-base border-2 border-border bg-muted px-3 py-2 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:bg-secondary hover:shadow-shadow"
                        href={`/learn/${course.slug}/${lesson.slug}`}
                        key={lesson.id}
                      >
                        <span className="text-primary">
                          {moduleIndex + 1}.{lessonIndex + 1}
                        </span>{" "}
                        {lesson.title}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {lesson.estimatedMinutes} {dict.courses.minuteUnit}
                          {lesson.assessment ? ` · ${lesson.assessment.type === "quiz" ? "Quiz" : "Code"}` : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
