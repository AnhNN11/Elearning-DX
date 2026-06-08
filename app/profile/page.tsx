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
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AccountSurfaceNav } from "@/components/account-surface-nav";
import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
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
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DX"
  );
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
    <div className="relative overflow-hidden rounded-base border-2 border-border bg-card p-4 shadow-none">
      <div className="absolute inset-x-0 top-0 h-2 bg-main" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs font-heading uppercase text-muted-foreground">{label}</p>
        <span className="grid size-10 place-items-center rounded-base border-2 border-border bg-secondary-background">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-heading leading-none text-foreground">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-muted-foreground">{note}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t-2 border-dashed border-border py-3 text-sm font-bold">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right text-foreground">{value}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
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
  const initials = getInitials(profile.fullName);
  const copy = isVietnamese
    ? {
        accountCenter: "Trung tâm tài khoản",
        accountNavProfile: "Hồ sơ",
        accountNavSettings: "Cài đặt",
        active: "Đang học",
        certificates: "Chứng chỉ",
        completed: "Hoàn thành",
        continueLearning: "Tiếp tục học",
        currentFocus: "Đang ưu tiên",
        emptyCourse:
          "Bạn chưa đăng ký khóa học nào. Sau khi đăng ký hoặc thanh toán thành công, khóa học sẽ xuất hiện ở đây.",
        heroDescription:
          "Một màn hình gọn để theo dõi tiến độ, quyền truy cập khóa học, chứng chỉ và trạng thái tài khoản.",
        heroEyebrow: "Hồ sơ học tập",
        hours: "giờ học",
        lessons: "bài học",
        linkedAccounts: "Tài khoản liên kết",
        noCertificate: "Chưa có chứng chỉ. Hoàn thành 100% khóa học để nhận chứng chỉ tự động.",
        noFocus: "Chưa có khóa học đang mở. Hãy chọn một khóa để bắt đầu lộ trình.",
        openSettings: "Mở cài đặt",
        overview: "Tổng quan",
        profileReady: "Tài khoản đã sẵn sàng lưu tiến độ học.",
        progress: "Tiến độ",
        settings: "Cài đặt tài khoản",
        startCourse: "Xem khóa học",
        status: "Trạng thái tài khoản",
        yourCourses: "Khóa học của bạn",
      }
    : {
        accountCenter: "Account center",
        accountNavProfile: "Profile",
        accountNavSettings: "Settings",
        active: "In progress",
        certificates: "Certificates",
        completed: "Completed",
        continueLearning: "Continue learning",
        currentFocus: "Current focus",
        emptyCourse:
          "You have not enrolled in any courses yet. Courses appear here after enrollment or successful payment.",
        heroDescription:
          "A cleaner workspace for progress, unlocked courses, certificates, and account status.",
        heroEyebrow: "Learning profile",
        hours: "learning hours",
        lessons: "lessons",
        linkedAccounts: "Linked accounts",
        noCertificate: "No certificates yet. Complete a course at 100% to receive one automatically.",
        noFocus: "No unlocked course yet. Pick a course to start your path.",
        openSettings: "Open settings",
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
      <section className="relative isolate overflow-hidden border-b-2 border-border bg-foreground py-10 text-background">
        <DotPattern className="text-main/25 [mask-image:radial-gradient(circle_at_55%_30%,black,transparent_72%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <Badge className="border-background bg-background text-foreground" variant="outline">
                {copy.heroEyebrow}
              </Badge>
              <div className="mt-6 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <span
                  aria-hidden
                  className="grid size-24 shrink-0 place-items-center rounded-base border-2 border-background bg-main bg-cover bg-center text-3xl font-heading text-main-foreground shadow-shadow"
                  style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
                >
                  {!profile.avatarUrl && initials}
                </span>
                <div className="min-w-0">
                  <h1 className="break-words text-4xl font-heading leading-none tracking-tight md:text-6xl">
                    {profile.fullName}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-background/85">
                    <span className="inline-flex min-w-0 items-center gap-2 rounded-base border-2 border-background/70 bg-background/10 px-3 py-2">
                      <Mail className="size-4 shrink-0 text-main" />
                      <span className="break-all">{profile.email ?? "No email"}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-base border-2 border-background/70 bg-background/10 px-3 py-2">
                      <ShieldCheck className="size-4 text-main" />
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-base font-bold leading-8 text-background/75">
                {copy.heroDescription}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={nextCourse ? `/learn/${nextCourse.slug}` : "/courses"}>
                    <GraduationCap className="size-4" />
                    {copy.continueLearning}
                  </Link>
                </Button>
                <Button asChild className="bg-background text-foreground [&_svg]:text-foreground" variant="outline">
                  <Link href="/settings">
                    <Settings className="size-4" />
                    {copy.openSettings}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-base border-2 border-background bg-background p-5 text-foreground shadow-shadow">
              <p className="text-sm font-heading uppercase text-primary">{copy.currentFocus}</p>
              {nextCourse ? (
                <>
                  <h2 className="mt-3 break-words text-2xl font-heading leading-tight">{nextCourse.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm font-bold leading-6 text-muted-foreground">
                    {nextCourse.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4 text-sm font-heading">
                    <span>{copy.progress}</span>
                    <span>{nextCourseProgress}%</span>
                  </div>
                  <Progress className="mt-3" value={nextCourseProgress} />
                  <Button asChild className="mt-5 w-full">
                    <Link href={nextCourseLesson ? `/learn/${nextCourse.slug}/${nextCourseLesson.slug}` : `/learn/${nextCourse.slug}`}>
                      {copy.continueLearning}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-bold leading-6 text-muted-foreground">{copy.noFocus}</p>
                  <Button asChild className="mt-5 w-full">
                    <Link href="/courses">
                      {copy.startCourse}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex max-w-7xl justify-center px-4 py-4 sm:justify-start sm:px-6">
          <AccountSurfaceNav
            active="profile"
            profileLabel={copy.accountNavProfile}
            settingsLabel={copy.accountNavSettings}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={BookOpen} label={copy.yourCourses} note={`${totalLessons} ${copy.lessons}`} value={String(enrolledCourses.length)} />
          <Stat icon={Clock3} label={copy.active} note={`${totalHours} ${copy.hours}`} value={String(activeCourses)} />
          <Stat icon={CheckCircle2} label={copy.progress} note={copy.profileReady} value={`${averageProgress}%`} />
          <Stat icon={Award} label={copy.certificates} note={copy.completed} value={String(certificates.length)} />
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-heading uppercase text-primary">{copy.yourCourses}</p>
                <h2 className="mt-2 text-3xl font-heading text-foreground">{copy.overview}</h2>
              </div>
              <Badge variant="outline">
                {enrolledCourses.length} {isVietnamese ? "khóa" : "courses"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4">
              {enrolledCourses.length ? (
                enrolledCourses.map((course) => {
                  const enrollment = enrollmentByCourseId.get(course.id);
                  const progress = enrollment?.progressPercent ?? 0;
                  const firstLesson = course.modules[0]?.lessons[0];

                  return (
                    <Card className="shadow-none transition hover:-translate-y-1 hover:shadow-shadow" key={course.id}>
                      <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={progress >= 100 ? "default" : "secondary"}>
                                {progress >= 100 ? copy.completed : `${progress}%`}
                              </Badge>
                              <Badge variant="outline">{formatVnd(course.priceVnd)}</Badge>
                            </div>
                            <h3 className="mt-3 break-words text-2xl font-heading leading-tight text-foreground">
                              {course.title}
                            </h3>
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
                    <p className="font-bold leading-7 text-muted-foreground">{copy.emptyCourse}</p>
                    <Button asChild className="mt-4">
                      <Link href="/courses">{dict.nav.courses}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-base border-2 border-border bg-card p-5 shadow-none">
              <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                <UserRound className="size-4" />
                {copy.status}
              </p>
              <div className="mt-4">
                <DetailRow label={dict.profile.role} value={roleLabel} />
                <DetailRow label={dict.profile.email} value={profile.email ?? "-"} />
                <DetailRow label={copy.linkedAccounts} value={String(identities.length)} />
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
                      <p className="break-words font-heading text-foreground">{certificate.courseTitle}</p>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        {certificate.certificateNo} · {new Date(certificate.issuedAt).toLocaleDateString(dateLocale)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-base border-2 border-dashed border-border p-3 text-sm font-bold leading-6 text-muted-foreground">
                    {copy.noCertificate}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-base border-2 border-border bg-main p-5 text-main-foreground shadow-shadow">
              <p className="flex items-center gap-2 text-sm font-heading uppercase">
                <Settings className="size-4" />
                {copy.accountCenter}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-main-foreground/80">
                {dict.profile.description}
              </p>
              <Button asChild className="mt-5 w-full" variant="outline">
                <Link href="/settings">
                  {copy.settings}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
