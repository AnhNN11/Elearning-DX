import Link from "next/link";
import Image from "next/image";
import { BookOpen, Filter, PlusCircle, Search, UploadCloud, Video } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminCourseComposer } from "@/components/admin-course-composer";
import { Pill } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCourseAction, updateCoursePublishAction } from "@/lib/actions";
import { getCourseLessonCount, getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { markdownToPlainText } from "@/lib/markdown-text";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const courses = await getCourses(true);
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";
  const filteredCourses = courses.filter((course) => {
    const haystack = `${course.title} ${course.slug} ${course.description} ${course.category} ${course.level}`.toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    const matchesStatus =
      status === "draft" ? !course.published : status === "published" ? course.published : true;

    return matchesQuery && matchesStatus;
  });
  const totalLessons = courses.reduce((total, course) => total + getCourseLessonCount(course), 0);
  const configuredVideos = courses.reduce(
    (total, course) =>
      total + course.modules.flatMap((module) => module.lessons).filter((lesson) => Boolean(lesson.videoUrl)).length,
    0,
  );
  const totalMaterials = courses.reduce(
    (total, course) => total + course.assets.filter((asset) => asset.kind !== "banner").length,
    0,
  );
  const missingVideos = totalLessons - configuredVideos;
  const draftCourses = courses.filter((course) => !course.published).length;

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-heading uppercase text-primary">Content operations</p>
          <h1 className="mt-2 text-3xl font-heading text-foreground">{dict.admin.coursesTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Quản lý khóa học, lesson, banner, tài liệu và trạng thái publish ở cùng một nơi.
          </p>
        </div>
        <Button asChild className="sm:mt-2">
          <a href="#create-course">
            <PlusCircle className="size-4" />
            Tạo khóa học
          </a>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent>
            <BookOpen className="size-5 text-primary" />
            <p className="mt-3 text-sm font-heading text-muted-foreground">Tổng khóa học</p>
            <p className="mt-2 text-3xl font-heading text-primary">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Filter className="size-5 text-primary" />
            <p className="mt-3 text-sm font-heading text-muted-foreground">Draft cần rà soát</p>
            <p className="mt-2 text-3xl font-heading text-primary">{draftCourses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Video className="size-5 text-primary" />
            <p className="mt-3 text-sm font-heading text-muted-foreground">Video lesson</p>
            <p className="mt-2 text-3xl font-heading text-primary">
              {configuredVideos}/{totalLessons}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <UploadCloud className="size-5 text-primary" />
            <p className="mt-3 text-sm font-heading text-muted-foreground">Tài liệu upload</p>
            <p className="mt-2 text-3xl font-heading text-primary">{totalMaterials}</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-6" tone={missingVideos > 0 ? "warning" : "success"}>
        <div>
          <AlertTitle>{missingVideos > 0 ? "Còn lesson chưa có video" : "Video lessons đã được cấu hình"}</AlertTitle>
          <AlertDescription>
            YouTube private chỉ xem được bằng Google account được mời, không mở theo user đăng nhập trong app. Với khóa trả phí,
            dùng YouTube unlisted cho MVP hoặc dùng storage/streaming private có signed URL.
          </AlertDescription>
        </div>
      </Alert>

      <div className="mt-8" id="create-course">
        <AdminCourseComposer action={createCourseAction} />
      </div>

      <Card className="mt-8">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>{dict.admin.courseList}</CardTitle>
              <form className="grid gap-2 sm:grid-cols-[1fr_150px_auto]" role="search">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" defaultValue={params.q ?? ""} name="q" placeholder="Tìm course, slug, stack..." />
                </div>
                <select
                  className="h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-base"
                  defaultValue={status}
                  name="status"
                >
                  <option value="all">Tất cả</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Button type="submit" variant="secondary">
                  Lọc
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>{dict.admin.course}</TableHead>
                  <TableHead>{dict.admin.category}</TableHead>
                  <TableHead>{dict.admin.lessons}</TableHead>
                  <TableHead>YouTube</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>{dict.admin.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => {
                  const lessons = course.modules.flatMap((module) => module.lessons);
                  const videoCount = lessons.filter((lesson) => lesson.videoUrl).length;
                  const materialCount = course.assets.filter((asset) => asset.kind !== "banner").length;

                  return (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="relative h-14 w-24 overflow-hidden rounded-base border-2 border-border bg-secondary">
                          {course.thumbnailUrl ? (
                            <Image
                              alt={`${course.title} banner`}
                              className="h-full w-full object-cover"
                              height={96}
                              src={course.thumbnailUrl}
                              width={160}
                            />
                          ) : (
                            <span className="grid h-full place-items-center px-2 text-center text-[10px] font-heading uppercase">
                              No image
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-80 whitespace-normal">
                        <Link className="font-heading text-foreground hover:text-primary" href={`/admin/courses/${course.id}`}>
                          {course.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                          {markdownToPlainText(course.description)}
                        </p>
                        <p className="mt-2 text-xs font-heading text-primary">/{course.slug}</p>
                      </TableCell>
                      <TableCell>
                        <Pill>{course.category}</Pill>
                      </TableCell>
                      <TableCell>{getCourseLessonCount(course)}</TableCell>
                      <TableCell>
                        <Badge variant={videoCount === lessons.length && lessons.length > 0 ? "default" : "outline"}>
                          {videoCount}/{lessons.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={materialCount > 0 ? "default" : "outline"}>{materialCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <form action={updateCoursePublishAction} className="flex items-center gap-2">
                          <input name="courseId" type="hidden" value={course.id} />
                          <input name="courseSlug" type="hidden" value={course.slug} />
                          <input name="returnTo" type="hidden" value="/admin/courses" />
                          <label className="flex items-center gap-2 text-xs font-heading">
                            <input name="published" type="checkbox" defaultChecked={course.published} />
                            {course.published ? "Published" : "Draft"}
                          </label>
                          <Button size="sm" type="submit" variant="outline">
                            Lưu
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filteredCourses.length && (
                  <TableRow>
                    <TableCell className="whitespace-normal py-8 text-center text-sm text-muted-foreground" colSpan={7}>
                      Không có khóa học phù hợp bộ lọc.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
      </Card>
    </AdminShell>
  );
}
