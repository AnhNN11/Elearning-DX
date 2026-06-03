import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ProfileSettings } from "@/components/profile-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAccountIdentities, requireUser } from "@/lib/auth";
import { getCourses, getCourseLessonCount, getUserCertificates, getUserEnrollments } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { formatVnd } from "@/lib/money";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DX";
}

function Stat({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: LucideIcon;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="rounded-base border-2 border-border bg-card p-4 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-heading uppercase text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-base border-2 border-border bg-secondary-background">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-heading text-foreground">{value}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">{note}</p>
    </div>
  );
}

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
  const isVietnamese = locale === "vi";
  const roleLabel = profile.roles.join(", ") || profile.role;
  const enrollmentByCourseId = new Map(enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  const enrolledCourses = courses.filter((course) => enrollmentByCourseId.has(course.id));
  const completedCourses = enrollments.filter((enrollment) => enrollment.progressPercent >= 100).length;
  const activeCourses = Math.max(enrolledCourses.length - completedCourses, 0);
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((total, enrollment) => total + enrollment.progressPercent, 0) / enrollments.length)
    : 0;
  const totalLessons = enrolledCourses.reduce((total, course) => total + getCourseLessonCount(course), 0);
  const totalHours = enrolledCourses.reduce((total, course) => total + course.durationHours, 0);
  const nextCourse =
    enrolledCourses.find((course) => (enrollmentByCourseId.get(course.id)?.progressPercent ?? 0) < 100) ??
    enrolledCourses[0];
  const nextCourseEnrollment = nextCourse ? enrollmentByCourseId.get(nextCourse.id) : undefined;
  const nextCourseProgress = nextCourseEnrollment?.progressPercent ?? 0;
  const nextCourseLesson = nextCourse?.modules[0]?.lessons[0];
  const copy = isVietnamese
    ? {
        active: "Đang học",
        certificates: "Chứng chỉ",
        completed: "Hoàn thành",
        continueLearning: "Tiếp tục học",
        emptyCourse:
          "Bạn chưa đăng ký khóa học nào. Sau khi đăng ký hoặc thanh toán thành công, khóa học sẽ xuất hiện ở đây.",
        heroDescription:
          "Theo dõi tiến độ, khóa học đã mở quyền và chứng chỉ của bạn trong một không gian gọn hơn.",
        heroEyebrow: "Hồ sơ học tập",
        hours: "giờ học",
        lessons: "bài học",
        linkedAccounts: "Tài khoản liên kết",
        learningPlan: "Lộ trình đang học",
        noCertificate: "Chưa có chứng chỉ. Hoàn thành 100% khóa học để nhận chứng chỉ tự động.",
        overview: "Tổng quan",
        profileReady: "Tài khoản đã sẵn sàng lưu tiến độ học.",
        progress: "Tiến độ",
        settings: "Cài đặt tài khoản",
        startCourse: "Xem khóa học",
        status: "Trạng thái tài khoản",
        yourCourses: "Khóa học của bạn",
      }
    : {
        active: "In progress",
        certificates: "Certificates",
        completed: "Completed",
        continueLearning: "Continue learning",
        emptyCourse:
          "You have not enrolled in any courses yet. Courses appear here after enrollment or successful payment.",
        heroDescription:
          "Track your progress, unlocked courses, and certificates in a cleaner workspace.",
        heroEyebrow: "Learning profile",
        hours: "learning hours",
        lessons: "lessons",
        linkedAccounts: "Linked accounts",
        learningPlan: "Current learning plan",
        noCertificate: "No certificates yet. Complete a course at 100% to receive one automatically.",
        overview: "Overview",
        profileReady: "Your account is ready to save learning progress.",
        progress: "Progress",
        settings: "Account settings",
        startCourse: "View courses",
        status: "Account status",
        yourCourses: "Your courses",
      };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-base border-2 border-border bg-main text-2xl font-heading text-main-foreground shadow-shadow">
                {getInitials(profile.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-heading uppercase text-primary">{copy.heroEyebrow}</p>
                <h1 className="mt-2 break-words text-3xl font-heading leading-tight text-foreground md:text-4xl">
                  {profile.fullName}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-2 rounded-base border-2 border-border bg-background px-3 py-2">
                    <Mail className="size-4 shrink-0 text-primary" />
                    <span className="break-all">{profile.email ?? "No email"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-background px-3 py-2">
                    <ShieldCheck className="size-4 text-primary" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={nextCourse ? `/learn/${nextCourse.slug}` : "/courses"}>
                  <GraduationCap className="size-4" />
                  {copy.continueLearning}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/courses">
                  {copy.startCourse}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm font-bold leading-6 text-muted-foreground">
            {copy.heroDescription}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={BookOpen} label={copy.yourCourses} note={`${totalLessons} ${copy.lessons}`} value={String(enrolledCourses.length)} />
          <Stat icon={Clock3} label={copy.active} note={`${totalHours} ${copy.hours}`} value={String(activeCourses)} />
          <Stat icon={CheckCircle2} label={copy.progress} note={copy.profileReady} value={`${averageProgress}%`} />
          <Stat icon={Award} label={copy.certificates} note={copy.completed} value={String(certificates.length)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {nextCourse && (
              <section className="rounded-base border-2 border-border bg-card p-5 shadow-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-heading uppercase text-primary">{copy.learningPlan}</p>
                    <h2 className="mt-2 break-words text-2xl font-heading text-foreground">{nextCourse.title}</h2>
                    <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">{nextCourse.description}</p>
                  </div>
                  <Badge variant={nextCourseProgress >= 100 ? "default" : "secondary"}>
                    {nextCourseProgress >= 100 ? copy.completed : `${nextCourseProgress}%`}
                  </Badge>
                </div>
                <Progress className="mt-5" value={nextCourseProgress} />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold text-muted-foreground">
                    {getCourseLessonCount(nextCourse)} {copy.lessons} · {nextCourse.durationHours} {copy.hours}
                  </p>
                  <Button asChild>
                    <Link href={nextCourseLesson ? `/learn/${nextCourse.slug}/${nextCourseLesson.slug}` : `/learn/${nextCourse.slug}`}>
                      {copy.continueLearning}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-heading uppercase text-primary">{copy.yourCourses}</p>
                  <h2 className="mt-2 text-2xl font-heading text-foreground">{copy.overview}</h2>
                </div>
                <Badge variant="outline">
                  {enrolledCourses.length} {isVietnamese ? "khóa" : "courses"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-4">
                {enrolledCourses.length ? (
                  enrolledCourses.map((course) => {
                    const enrollment = enrollmentByCourseId.get(course.id);
                    const progress = enrollment?.progressPercent ?? 0;
                    const firstLesson = course.modules[0]?.lessons[0];

                    return (
                      <Card className="shadow-none" key={course.id}>
                        <CardContent>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={progress >= 100 ? "default" : "secondary"}>
                                  {progress >= 100 ? copy.completed : `${progress}%`}
                                </Badge>
                                <Badge variant="outline">{formatVnd(course.priceVnd)}</Badge>
                              </div>
                              <h3 className="mt-3 break-words text-xl font-heading text-foreground">{course.title}</h3>
                              <p className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <BookOpen className="size-4 text-primary" />
                                  {getCourseLessonCount(course)} {copy.lessons}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="size-4 text-primary" />
                                  {course.durationHours} {copy.hours}
                                </span>
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Button asChild>
                                <Link href={firstLesson ? `/learn/${course.slug}/${firstLesson.slug}` : `/learn/${course.slug}`}>
                                  {dict.courses.continueButton}
                                </Link>
                              </Button>
                              <Button asChild variant="outline">
                                <Link href={`/courses/${course.slug}`}>{dict.courses.viewCourse}</Link>
                              </Button>
                            </div>
                          </div>
                          <Progress className="mt-5" value={progress} />
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="border-dashed shadow-none">
                    <CardContent>
                      <p className="font-bold text-muted-foreground">{copy.emptyCourse}</p>
                      <Button asChild className="mt-4">
                        <Link href="/courses">{dict.nav.courses}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-base border-2 border-border bg-card p-5 shadow-none">
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <UserRound className="size-4" />
                {copy.status}
              </p>
              <div className="mt-5 space-y-3 text-sm font-bold">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Role</span>
                  <span className="break-all text-right text-foreground">{roleLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="break-all text-right text-foreground">{profile.email ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{copy.linkedAccounts}</span>
                  <span className="text-foreground">{identities.length}</span>
                </div>
              </div>
            </section>

            <section className="rounded-base border-2 border-border bg-card p-5 shadow-none">
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <Sparkles className="size-4" />
                {copy.certificates}
              </p>
              <div className="mt-4 space-y-3">
                {certificates.length ? (
                  certificates.slice(0, 4).map((certificate) => (
                    <Link
                      className="block rounded-base border-2 border-border bg-secondary-background p-3 transition hover:-translate-y-0.5 hover:shadow-shadow"
                      href={`/certificate/${certificate.id}`}
                      key={certificate.id}
                    >
                      <p className="break-words font-black text-foreground">{certificate.courseTitle}</p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        {certificate.certificateNo} · {new Date(certificate.issuedAt).toLocaleDateString(dateLocale)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-base border-2 border-dashed border-border p-3 text-sm font-bold text-muted-foreground">
                    {copy.noCertificate}
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-sm font-heading uppercase text-primary">{copy.settings}</p>
            <h2 className="mt-2 text-2xl font-heading text-foreground">{dict.profile.editTitle}</h2>
          </div>
          <ProfileSettings
            copy={dict.profile}
            dateLocale={dateLocale}
            identities={identities}
            profile={profile}
            saved={resolvedSearchParams?.saved === "1"}
          />
        </section>
      </section>
    </main>
  );
}
