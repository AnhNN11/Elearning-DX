import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CourseCard } from "@/components/course-card";
import { SectionHeader, StatCard } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getCourses, getUserCertificates, getUserEnrollments } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function LearnPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await requireUser();
  const [courses, enrollments, certificates] = await Promise.all([
    getCourses(),
    getUserEnrollments(profile.id),
    getUserCertificates(profile.id),
  ]);
  const enrolledCourseIds = new Set(enrollments.map((enrollment) => enrollment.courseId));
  const enrolledCourses = courses.filter((course) => enrolledCourseIds.has(course.id));
  const activeEnrollment = enrollments[0];
  const activeCourse = activeEnrollment
    ? enrolledCourses.find((course) => course.id === activeEnrollment.courseId)
    : enrolledCourses[0];
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((total, item) => total + item.progressPercent, 0) / enrollments.length)
    : 0;

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
          <StatCard label="Tiến độ thật" note="Tính từ bảng enrollments" value={`${averageProgress}%`} />
          <StatCard label={dict.courses.yourCourses} note="Khóa học đã ghi danh" value={String(enrollments.length)} />
          <StatCard label={dict.courses.certificates} note={dict.courses.certificatesNote} value={String(certificates.length)} />
        </div>
        {activeCourse ? (
          <Card className="mt-10">
            <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-primary">{dict.courses.continueLearning}</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">{activeCourse.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dict.courses.nextLesson}: {activeCourse.modules[0]?.lessons[0]?.title ?? "Chưa có lesson"}
                </p>
              </div>
              {activeCourse.modules[0]?.lessons[0] && (
                <Button asChild>
                  <Link href={`/learn/${activeCourse.slug}/${activeCourse.modules[0].lessons[0].slug}`}>
                    {dict.courses.continueButton}
                  </Link>
                </Button>
              )}
            </div>
            <Progress className="mt-5 h-3" value={activeEnrollment?.progressPercent ?? 0} />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-10 border-dashed">
            <CardContent>
              <p className="font-bold text-muted-foreground">Bạn chưa ghi danh khóa học thật nào trong Supabase.</p>
            </CardContent>
          </Card>
        )}
        <div className="mt-10">
          <h2 className="text-2xl font-black text-foreground">{dict.courses.yourCourses}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.length ? enrolledCourses.map((course) => (
              <CourseCard copy={dict.courses} course={course} key={course.id} />
            )) : (
              <Card className="border-dashed md:col-span-2 xl:col-span-3">
                <CardContent>
                  <p className="font-bold text-muted-foreground">Danh sách này sẽ có dữ liệu sau khi bạn ghi danh khóa học thật.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
