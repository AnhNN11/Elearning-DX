import Link from "next/link";
import { BookOpen, CalendarCheck, FileText, UploadCloud, Video } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { StatCard } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAdminDashboardMetrics, getCourses, getMentorBookings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [metrics, courses, bookings] = await Promise.all([
    getAdminDashboardMetrics(),
    getCourses(true),
    getMentorBookings(),
  ]);
  const latestCourses = courses.slice(0, 5);
  const latestBookings = bookings.slice(0, 5);
  const lessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons));
  const configuredVideos = lessons.filter((lesson) => lesson.videoUrl).length;
  const materialCount = courses.reduce(
    (total, course) => total + course.assets.filter((asset) => asset.kind !== "banner").length,
    0,
  );
  const draftCourses = courses.filter((course) => !course.published).length;
  const videoPercent = lessons.length ? Math.round((configuredVideos / lessons.length) * 100) : 0;
  const bookingQueue = bookings.filter((booking) => ["new", "contacted", "confirmed"].includes(booking.status)).length;

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-heading uppercase text-primary">Admin operations</p>
          <h1 className="mt-2 text-3xl font-heading text-foreground">{dict.admin.dashboardTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Theo dõi chất lượng nội dung, booking và các điểm cần xử lý trước khi publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/courses">
              <BookOpen className="size-4" />
              Courses
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={latestCourses[0] ? `/admin/courses/${latestCourses[0].id}` : "/admin/courses"}>
              <UploadCloud className="size-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label={dict.admin.courseCount} note={`${metrics.publishedCourses} published`} value={String(metrics.courses)} />
        <StatCard label={dict.admin.lessonCount} value={String(metrics.lessons)} />
        <StatCard label="Người học thật" note={`${metrics.activeEnrollments} active enrollments`} value={String(metrics.users)} />
        <StatCard label={dict.admin.certificateCount} value={String(metrics.certificates)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Booking mentor" value={String(metrics.bookings)} />
        <StatCard label="Blog posts" value={String(metrics.blogPosts)} />
        <StatCard label="Câu hỏi phỏng vấn" value={String(metrics.interviewQuestions)} />
      </div>
      <Alert className="mt-8" tone={bookingQueue > 0 || draftCourses > 0 || configuredVideos < lessons.length ? "warning" : "success"}>
        <div>
          <AlertTitle>Checklist vận hành admin</AlertTitle>
          <AlertDescription>
            {draftCourses} draft course, {lessons.length - configuredVideos} lesson thiếu video, {bookingQueue} booking đang chờ.
            Search command ở header có thể mở nhanh khóa học, lesson, blog, booking và thao tác upload.
          </AlertDescription>
        </div>
      </Alert>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái nội dung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black text-foreground">Lesson có video YouTube</p>
                <Badge>{configuredVideos}/{lessons.length}</Badge>
              </div>
              <Progress className="mt-3" value={videoPercent} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Draft</p>
                <p className="mt-1 text-2xl font-heading text-primary">{draftCourses}</p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Tài liệu</p>
                <p className="mt-1 text-2xl font-heading text-primary">{materialCount}</p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-black uppercase text-muted-foreground">Cần xử lý</p>
                <p className="mt-1 text-2xl font-heading text-primary">{bookingQueue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/courses">
                <Video className="size-4" />
                Cấu hình khóa học, YouTube và tài liệu
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/blog">
                <FileText className="size-4" />
                Tạo blog từ file Markdown
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/bookings">
                <CalendarCheck className="size-4" />
                Xử lý booking mentor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Khóa học gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestCourses.length ? latestCourses.map((course) => (
              <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={course.id}>
                <div className="flex items-center justify-between gap-4">
                  <Link className="font-black text-foreground hover:text-primary" href={`/admin/courses/${course.id}`}>
                    {course.title}
                  </Link>
                  <span className="text-xs font-black uppercase text-primary">{course.published ? "Published" : "Draft"}</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {course.category} · {course.modules.length} modules · {course.assets.filter((asset) => asset.kind !== "banner").length} tài liệu
                </p>
              </div>
            )) : (
              <p className="text-sm font-bold text-muted-foreground">Chưa có khóa học thật trong Supabase.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestBookings.length ? latestBookings.map((booking) => (
              <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={booking.id}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-black text-foreground">{booking.fullName}</p>
                  <span className="text-xs font-black uppercase text-primary">{booking.status}</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{booking.topic} · {booking.preferredTime}</p>
              </div>
            )) : (
              <p className="text-sm font-bold text-muted-foreground">Chưa có booking thật trong Supabase.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Vận hành hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-md bg-muted p-4 text-sm font-bold text-foreground">
              Upload ảnh/banner bằng Cloudinary; tài liệu vẫn lưu Supabase Storage.
            </div>
            <div className="rounded-md bg-muted p-4 text-sm font-bold text-foreground">
              Quản lý users, roles và user_roles trực tiếp trong Supabase.
            </div>
            <div className="rounded-md bg-muted p-4 text-sm font-bold text-foreground">
              Theo dõi booking mentor/mock interview từ database.
            </div>
            <div className="rounded-md bg-muted p-4 text-sm font-bold text-foreground">
              Blog và câu hỏi phỏng vấn đọc từ Markdown trong Supabase.
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
