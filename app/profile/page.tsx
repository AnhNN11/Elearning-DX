import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Highlighter } from "@/components/highlighter";
import { ProfileSettings } from "@/components/profile-settings";
import { SectionHeader, StatCard } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAccountIdentities, requireUser } from "@/lib/auth";
import { getCourses, getCourseLessonCount, getUserCertificates, getUserEnrollments } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { formatVnd } from "@/lib/money";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const resolvedSearchParams = await searchParams;
  const profile = await requireUser();
  const [identities, courses, enrollments, certificates] = await Promise.all([
    getAccountIdentities(),
    getCourses(),
    getUserEnrollments(profile.id),
    getUserCertificates(profile.id),
  ]);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const roleLabel = profile.roles.join(", ") || profile.role;
  const enrollmentByCourseId = new Map(enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  const enrolledCourses = courses.filter((course) => enrollmentByCourseId.has(course.id));
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((total, enrollment) => total + enrollment.progressPercent, 0) / enrollments.length)
    : 0;
  const isVietnamese = locale === "vi";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SectionHeader
          description={dict.profile.description}
          eyebrow={dict.profile.eyebrow}
          title={profile.fullName}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label={dict.profile.role} value={roleLabel} />
          <StatCard label={dict.profile.email} value={profile.email ?? dict.profile.demo} />
          <StatCard label={dict.courses.yourCourses} note={dict.courses.progressNote} value={String(enrolledCourses.length)} />
          <StatCard label={dict.courses.progress} note={dict.courses.demoProgressNote} value={`${averageProgress}%`} />
          <StatCard label={dict.courses.certificates} note={dict.courses.certificatesNote} value={String(certificates.length)} />
        </div>
        <Card className="mt-6 bg-secondary">
          <CardContent>
            <p className="text-sm font-heading uppercase tracking-wide text-primary">
              {dict.profile.highlightsTitle}
            </p>
            <div className="mt-4 space-y-3 text-base leading-7 text-foreground">
              <p>
                <Highlighter>{roleLabel}</Highlighter>{" "}
                {dict.profile.highlightRole}
              </p>
              <p>
                <Highlighter color="var(--accent)">{dict.profile.active}</Highlighter>{" "}
                {dict.profile.highlightAccount}
              </p>
              <p>
                <Highlighter color="var(--main)">{dict.courses.certificates}</Highlighter>{" "}
                {dict.profile.highlightCertificates}
              </p>
            </div>
          </CardContent>
        </Card>
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-heading uppercase tracking-wide text-primary">
                {dict.courses.yourCourses}
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">
                {isVietnamese ? "Khóa học đã học" : "Enrolled courses"}
              </h2>
            </div>
            <Badge variant="secondary">
              {enrolledCourses.length} {isVietnamese ? "khóa" : "courses"}
            </Badge>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {enrolledCourses.length ? (
              enrolledCourses.map((course) => {
                const enrollment = enrollmentByCourseId.get(course.id);
                const progress = enrollment?.progressPercent ?? 0;
                const firstLesson = course.modules[0]?.lessons[0];

                return (
                  <Card key={course.id}>
                    <CardContent>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={progress >= 100 ? "default" : "secondary"}>
                              {progress >= 100 ? (isVietnamese ? "Hoàn thành" : "Completed") : `${progress}%`}
                            </Badge>
                            <Badge variant="outline">{formatVnd(course.priceVnd)}</Badge>
                          </div>
                          <h3 className="mt-3 text-xl font-black text-foreground">{course.title}</h3>
                          <p className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="size-4 text-primary" />
                              {getCourseLessonCount(course)} {dict.courses.lessonUnit}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-4 text-primary" />
                              {course.durationHours} {dict.courses.hourUnit}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Progress className="mt-5" value={progress} />
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button asChild>
                          <Link href={firstLesson ? `/learn/${course.slug}/${firstLesson.slug}` : `/learn/${course.slug}`}>
                            {dict.courses.continueButton}
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/courses/${course.slug}`}>{dict.courses.viewCourse}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed md:col-span-2">
                <CardContent>
                  <p className="font-bold text-muted-foreground">
                    {isVietnamese
                      ? "Bạn chưa đăng ký khóa học nào. Sau khi đăng ký hoặc thanh toán thành công, khóa học sẽ xuất hiện ở đây."
                      : "You have not enrolled in any courses yet. Courses appear here after enrollment or successful payment."}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/courses">{dict.nav.courses}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
        <ProfileSettings
          copy={dict.profile}
          dateLocale={dateLocale}
          identities={identities}
          profile={profile}
          saved={resolvedSearchParams?.saved === "1"}
        />
      </section>
    </main>
  );
}
