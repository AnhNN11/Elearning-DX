import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, FileText, ImageIcon, LockKeyhole, PlusCircle, UploadCloud, Video } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Pill } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  createLessonAction,
  updateCourseAction,
  updateCoursePublishAction,
  updateLessonAction,
  updateLessonVideoAction,
  uploadCourseAssetAction,
  uploadCourseBannerAction,
} from "@/lib/actions";
import { getCourses } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { formatVnd } from "@/lib/money";
import { getYouTubeEmbedUrl, getYouTubeVideoId } from "@/lib/youtube";

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

  const lessons = course.modules.flatMap((module) => module.lessons);
  const configuredVideoCount = lessons.filter((lesson) => Boolean(lesson.videoUrl)).length;
  const materialAssets = course.assets.filter((asset) => asset.kind !== "banner");
  const missingVideoCount = lessons.length - configuredVideoCount;
  const missingContentCount = lessons.filter((lesson) => !lesson.content || lesson.content.length < 40).length;

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-heading text-primary hover:underline" href="/admin/courses">
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
          <p className="mt-5 text-sm font-heading uppercase text-primary">Course editor</p>
          <h1 className="mt-2 text-3xl font-heading text-foreground">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{course.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/courses/${course.slug}`} target="_blank">
              <ExternalLink className="size-4" />
              Xem public
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="#new-lesson">
              <PlusCircle className="size-4" />
              Thêm lesson
            </a>
          </Button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent>
            <BookOpen className="mb-3 size-5 text-primary" />
            <p className="text-sm font-heading text-muted-foreground">Modules</p>
            <p className="mt-2 text-3xl font-heading text-primary">{course.modules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <FileText className="mb-3 size-5 text-primary" />
            <p className="text-sm font-heading text-muted-foreground">Lessons</p>
            <p className="mt-2 text-3xl font-heading text-primary">{lessons.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Video className="mb-3 size-5 text-primary" />
            <p className="text-sm font-heading text-muted-foreground">YouTube</p>
            <p className="mt-2 text-3xl font-heading text-primary">{configuredVideoCount}/{lessons.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <UploadCloud className="mb-3 size-5 text-primary" />
            <p className="text-sm font-heading text-muted-foreground">Tài liệu</p>
            <p className="mt-2 text-3xl font-heading text-primary">{materialAssets.length}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Alert tone={missingVideoCount > 0 || missingContentCount > 0 ? "warning" : "success"}>
          <div>
            <AlertTitle>Readiness trước khi publish</AlertTitle>
            <AlertDescription>
              {missingVideoCount} lesson thiếu video, {missingContentCount} lesson có nội dung quá ngắn. Hoàn tất video, Markdown,
              banner và tài liệu trước khi bật published.
            </AlertDescription>
          </div>
        </Alert>
        <Alert tone="info">
          <div>
            <AlertTitle>YouTube private không mở theo tài khoản app</AlertTitle>
            <AlertDescription>
              Nếu đặt video là private, người học chỉ xem được khi Google account của họ được invite trên YouTube. Với khóa có phân
              quyền, nên dùng unlisted cho MVP hoặc private storage/streaming có signed URL.
            </AlertDescription>
          </div>
        </Alert>
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
                  {item.lessons.map((lesson) => {
                    const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);
                    const videoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;

                    return (
                      <div className="grid gap-4 py-5 xl:grid-cols-[1fr_430px]" key={lesson.id}>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground">{lesson.title}</p>
                            <Pill>{lesson.estimatedMinutes} phút</Pill>
                            {lesson.assessment && <Pill>{lesson.assessment.type}</Pill>}
                            {videoId ? <Pill>YouTube: {videoId}</Pill> : <Badge variant="outline">Chưa có video</Badge>}
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">{lesson.slug}</p>
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-black text-primary">
                              {dict.admin.previewMarkdown}
                            </summary>
                            <div className="mt-3 rounded-base border-2 border-border bg-background p-4">
                              <MarkdownViewer content={lesson.content || dict.admin.emptyMarkdown} />
                            </div>
                          </details>
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-black text-primary">
                              Chỉnh sửa lesson
                            </summary>
                            <form action={updateLessonAction} className="mt-3 grid gap-3 rounded-base border-2 border-border bg-secondary-background p-4">
                              <input name="courseId" type="hidden" value={course.id} />
                              <input name="courseSlug" type="hidden" value={course.slug} />
                              <input name="lessonId" type="hidden" value={lesson.id} />
                              <Input name="title" defaultValue={lesson.title} placeholder={dict.admin.lessonName} required />
                              <Input name="slug" defaultValue={lesson.slug} placeholder="lesson-slug" required />
                              <Input
                                defaultValue={String(lesson.estimatedMinutes || 15)}
                                min="1"
                                name="estimatedMinutes"
                                placeholder="Số phút"
                                required
                                type="number"
                              />
                              <Input
                                defaultValue={lesson.videoUrl ?? ""}
                                name="videoUrl"
                                placeholder={dict.admin.youtubeLesson}
                              />
                              <MarkdownEditor
                                defaultValue={lesson.content}
                                emptyPreview={dict.admin.emptyMarkdown}
                                name="content"
                                placeholder={dict.admin.markdownContent}
                                required
                              />
                              <Button type="submit">{dict.admin.save}</Button>
                            </form>
                          </details>
                        </div>
                        <div className="rounded-base border-2 border-border bg-secondary-background p-3">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="flex items-center gap-2 text-sm font-heading text-foreground">
                              <Video className="size-4" />
                              YouTube config
                            </p>
                            <Badge variant={embedUrl ? "default" : "outline"}>
                              {embedUrl ? "Ready" : "Missing"}
                            </Badge>
                          </div>
                          {embedUrl ? (
                            <iframe
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="aspect-video w-full rounded-base border-2 border-border bg-foreground"
                              src={embedUrl}
                              title={lesson.title}
                            />
                          ) : (
                            <div className="grid aspect-video place-items-center rounded-base border-2 border-dashed border-border bg-background px-4 text-center text-sm font-black text-muted-foreground">
                              Chưa cấu hình link YouTube cho lesson này.
                            </div>
                          )}
                          <form action={updateLessonVideoAction} className="mt-3 flex gap-2">
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
                          <div className="mt-3 rounded-base border-2 border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
                            <p className="flex items-center gap-2 font-heading text-foreground">
                              <LockKeyhole className="size-4" />
                              Ghi chú quyền xem
                            </p>
                            <p className="mt-1">
                              Dán link public/unlisted để iframe chạy ổn. Link private thường báo lỗi trong embed nếu user không
                              được YouTube invite bằng Google account.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="scroll-mt-24" id="new-lesson">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
                    <PlusCircle className="size-4" />
                    Tạo content bài học
                  </p>
                  <CardTitle className="mt-2 text-2xl font-black text-foreground">
                    Lesson mới lưu trực tiếp vào Supabase
                  </CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Nội dung Markdown ở đây được ghi vào cột lessons.content_md và hiển thị ở trang học ngay sau khi lưu.
                  </p>
                </div>
                <Badge variant="outline">Database content</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form action={createLessonAction} className="grid gap-4">
                <input name="courseId" type="hidden" value={course.id} />
                <input name="courseSlug" type="hidden" value={course.slug} />
                <div className="grid gap-4 md:grid-cols-2">
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
                    defaultValue="15"
                    min="1"
                    name="estimatedMinutes"
                    placeholder="Số phút"
                    required
                    type="number"
                  />
                  <Input
                    className="md:col-span-2"
                    name="videoUrl"
                    placeholder={dict.admin.youtubeLesson}
                  />
                </div>
                <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                  <p className="mb-3 text-sm font-heading text-foreground">{dict.admin.markdownContent}</p>
                  <MarkdownEditor
                    emptyPreview={dict.admin.emptyMarkdown}
                    name="content"
                    placeholder="## Mục tiêu bài học\n\n- Viết nội dung chính\n- Thêm checklist, code block, link tài liệu..."
                    required
                  />
                </div>
                <Button className="w-full sm:w-fit" type="submit">
                  {dict.admin.addLesson}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardContent>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-foreground">Cấu hình khóa học</h2>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  Sửa thông tin public, thời lượng và giá bán của khóa học.
                </p>
              </div>
              <Badge variant={course.priceVnd <= 0 ? "default" : "secondary"}>
                {course.priceVnd <= 0 ? "Free" : formatVnd(course.priceVnd)}
              </Badge>
            </div>
            <form action={updateCourseAction} className="mt-4 space-y-4 rounded-base border-2 border-border bg-secondary-background p-3">
              <input name="courseId" type="hidden" value={course.id} />
              <input name="previousSlug" type="hidden" value={course.slug} />
              <div className="space-y-2">
                <Label htmlFor="edit-course-title">Tên khóa học</Label>
                <Input id="edit-course-title" name="title" defaultValue={course.title} placeholder={dict.admin.courseName} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-slug">Slug</Label>
                <Input id="edit-course-slug" name="slug" defaultValue={course.slug} placeholder="course-slug" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-course-category">{dict.admin.category}</Label>
                  <Input
                    id="edit-course-category"
                    name="category"
                    defaultValue={course.category}
                    placeholder={dict.admin.category}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-level">{dict.admin.level}</Label>
                  <select
                    className="h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-base text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={course.level}
                    id="edit-course-level"
                    name="level"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-course-duration">Thời lượng giờ</Label>
                  <Input
                    defaultValue={String(course.durationHours || 1)}
                    id="edit-course-duration"
                    min="0.5"
                    name="durationHours"
                    placeholder="Thời lượng giờ"
                    required
                    step="0.5"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-price">Giá VND</Label>
                  <Input
                    defaultValue={String(course.priceVnd || 0)}
                    id="edit-course-price"
                    min="0"
                    name="priceVnd"
                    placeholder="VD: 990000"
                    required
                    step="1"
                    type="number"
                  />
                  <p className="text-xs font-bold text-muted-foreground">
                    Nhập 0 để hiển thị Free, khóa trả phí từ 1.000đ trở lên.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-accent">Accent</Label>
                <Input className="h-12 p-1" defaultValue={course.accent} id="edit-course-accent" name="accent" type="color" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-description">{dict.admin.description}</Label>
                <Textarea
                  className="min-h-28"
                  defaultValue={course.description}
                  id="edit-course-description"
                  name="description"
                  placeholder={dict.admin.description}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-outcomes">Outcomes</Label>
                <Textarea
                  className="min-h-28"
                  defaultValue={course.outcomes.join("\n")}
                  id="edit-course-outcomes"
                  name="outcomes"
                  placeholder="Outcomes, mỗi dòng một mục"
                  required
                />
              </div>
              <Button className="w-full" type="submit">{dict.admin.save}</Button>
            </form>
            <h2 className="mt-6 text-xl font-black text-foreground">{dict.admin.publishingInfo}</h2>
            <div className="mt-4 overflow-hidden rounded-base border-2 border-border bg-secondary">
              {course.thumbnailUrl ? (
                <Image
                  alt={`${course.title} banner`}
                  className="h-40 w-full object-cover"
                  height={240}
                  src={course.thumbnailUrl}
                  width={420}
                />
              ) : (
                <div className="grid h-40 place-items-center px-6 text-center text-sm font-black uppercase text-foreground">
                  Chưa có banner Cloudinary
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>{dict.admin.slug}:</strong> {course.slug}
              </p>
              <p>
                <strong>{dict.admin.level}:</strong> {course.level}
              </p>
              <p>
                <strong>Giá:</strong> {formatVnd(course.priceVnd)}
              </p>
              <p>
                <strong>{dict.admin.published}:</strong> {course.published ? "Yes" : "No"}
              </p>
            </div>
            <form action={updateCoursePublishAction} className="mt-5 flex items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
              <input name="courseId" type="hidden" value={course.id} />
              <input name="courseSlug" type="hidden" value={course.slug} />
              <input name="returnTo" type="hidden" value={`/admin/courses/${course.id}`} />
              <label className="flex items-center gap-2 text-sm font-black">
                <input name="published" type="checkbox" defaultChecked={course.published} />
                Published
              </label>
              <Button size="sm" type="submit">Lưu trạng thái</Button>
            </form>
            <Alert className="mt-5 shadow-none" tone="info">
              <div>
                <AlertTitle>Ảnh public, tài liệu theo bucket</AlertTitle>
                <AlertDescription>
                  Banner/thumbnail upload lên Cloudinary, Supabase chỉ lưu URL và metadata. Tài liệu vẫn lưu Supabase Storage;
                  nếu cần khóa tài liệu/video theo enrollment, đổi bucket sang private và phát signed URL từ server.
                </AlertDescription>
              </div>
            </Alert>
            <form action={uploadCourseBannerAction} className="mt-5 space-y-3 rounded-base border-2 border-border bg-secondary-background p-3">
              <input name="courseId" type="hidden" value={course.id} />
              <input name="courseSlug" type="hidden" value={course.slug} />
              <p className="flex items-center gap-2 text-sm font-heading text-foreground">
                <ImageIcon className="size-4" />
                Upload banner
              </p>
              <Input name="title" placeholder="Tên banner" defaultValue={`${course.title} banner`} required />
              <Input
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                name="file"
                required
                type="file"
              />
              <Button className="w-full" type="submit" variant="secondary">Upload banner</Button>
            </form>
            <form action={uploadCourseAssetAction} className="mt-5 space-y-3 rounded-base border-2 border-border bg-secondary-background p-3">
              <input name="courseId" type="hidden" value={course.id} />
              <input name="courseSlug" type="hidden" value={course.slug} />
              <p className="flex items-center gap-2 text-sm font-heading text-foreground">
                <UploadCloud className="size-4" />
                Upload tài liệu
              </p>
              <Input name="title" placeholder="Tên tài liệu: Slide buổi 1 / Source code..." required />
              <select className="w-full rounded-base border-2 border-border bg-background px-3 py-2 text-sm font-bold" name="kind" defaultValue="document">
                <option value="document">Document/PDF</option>
                <option value="slide">Slide</option>
                <option value="source">Source code</option>
                <option value="resource">Resource</option>
              </select>
              <Input
                accept=".pdf,.md,.txt,.zip,.pptx,.docx,application/pdf,text/markdown,text/plain,application/zip,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                name="file"
                required
                type="file"
              />
              <Button className="w-full" type="submit" variant="secondary">Upload tài liệu</Button>
            </form>
            {course.assets.length > 0 && (
              <div className="mt-5 space-y-2">
                <h3 className="text-sm font-black uppercase text-primary">Tài liệu đã upload</h3>
                {course.assets.map((asset) => (
                  <a
                    className="block rounded-base border-2 border-border bg-background p-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-shadow"
                    href={asset.publicUrl}
                    key={asset.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Badge variant={asset.kind === "banner" ? "default" : "outline"}>{asset.kind}</Badge>
                    <span className="mt-2 block text-foreground">{asset.title}</span>
                    {asset.fileSize && (
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
            <p className="bg-secondary text-secondary-foreground mt-5 rounded-md p-3 text-sm leading-6">
              {dict.admin.addLessonHelp}
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
