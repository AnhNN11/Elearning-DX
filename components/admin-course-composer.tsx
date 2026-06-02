"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bold,
  Code2,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Upload,
} from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CourseAction = (formData: FormData) => void | Promise<void>;

const starterDescription = `## Mục tiêu khóa học

Xây dựng một nền tảng thực tế, hiểu được luồng database, auth, API và triển khai production.

## Dự án thực hành

- Thiết kế schema và quyền truy cập dữ liệu
- Xây API bằng route handlers
- Hoàn thiện lesson, quiz và chứng chỉ`;

const starterOutcomes = `Thiết kế database có RLS và bảng roles/users
Xây API bằng Next Route Handlers
Upload tài liệu khóa học lên storage
Hoàn thành quiz/code assessment và cấp chứng chỉ`;

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function outcomeItems(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminCourseComposer({ action }: { action: CourseAction }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("Fullstack");
  const [level, setLevel] = useState("Cơ bản");
  const [durationHours, setDurationHours] = useState("18");
  const [accent, setAccent] = useState("#075bbb");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");
  const [bannerFileName, setBannerFileName] = useState("");
  const [description, setDescription] = useState(starterDescription);
  const [outcomes, setOutcomes] = useState(starterOutcomes);
  const [linkUrl, setLinkUrl] = useState("");
  const [contentImageUrl, setContentImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("Ảnh minh họa");
  const [imageUploadStatus, setImageUploadStatus] = useState("");

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
  }, [bannerPreviewUrl]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(makeSlug(value));
    }
  }

  function insertMarkdown(prefix: string, suffix = "", placeholder = "text") {
    const target = textareaRef.current;
    if (!target) {
      setDescription((current) => `${current}\n${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selected = description.slice(start, end) || placeholder;
    const next = `${description.slice(0, start)}${prefix}${selected}${suffix}${description.slice(end)}`;
    const cursor = start + prefix.length + selected.length + suffix.length;

    setDescription(next);
    requestAnimationFrame(() => {
      target.focus();
      target.setSelectionRange(cursor, cursor);
    });
  }

  function insertLine(prefix: string, placeholder: string) {
    const target = textareaRef.current;
    const start = target?.selectionStart ?? description.length;
    const needsNewline = start > 0 && description[start - 1] !== "\n";
    insertMarkdown(`${needsNewline ? "\n" : ""}${prefix}`, "", placeholder);
  }

  function insertBlock(markdown: string) {
    const target = textareaRef.current;
    const start = target?.selectionStart ?? description.length;
    const end = target?.selectionEnd ?? description.length;
    const before = description.slice(0, start);
    const after = description.slice(end);
    const prefix = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after.length && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
    const next = `${before}${prefix}${markdown}${suffix}${after}`;
    const cursor = before.length + prefix.length + markdown.length;

    setDescription(next);
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(cursor, cursor);
    });
  }

  function updateBannerPreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (bannerPreviewUrl) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    if (!file) {
      setBannerPreviewUrl("");
      setBannerFileName("");
      return;
    }

    setBannerPreviewUrl(URL.createObjectURL(file));
    setBannerFileName(file.name);
  }

  async function uploadAndInsertContentImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadStatus("Đang upload ảnh...");
    const formData = new FormData();
    formData.set("image", file);
    formData.set("folder", "courses");
    formData.set("context", slug || makeSlug(title) || "course-content");

    try {
      const response = await fetch("/api/admin/content-images", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Upload ảnh thất bại.");
      }

      insertBlock(`![${imageAlt || file.name}](${payload.url})`);
      setContentImageUrl(payload.url);
      setImageUploadStatus("Đã chèn ảnh vào mô tả.");
    } catch (error) {
      setImageUploadStatus(error instanceof Error ? error.message : "Upload ảnh thất bại.");
    } finally {
      event.target.value = "";
    }
  }

  const previewImage = bannerPreviewUrl || thumbnailUrl;
  const previewOutcomes = outcomeItems(outcomes);

  return (
    <form action={action} className="grid gap-6">
      <Card className="overflow-hidden bg-card shadow-none">
        <CardHeader className="border-b-2 border-border bg-card">
          <p className="text-sm font-black uppercase text-primary">Course composer</p>
          <CardTitle className="mt-2 text-2xl font-black text-foreground">
            Tạo khóa học bằng editor
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <Label htmlFor="course-title">Tên khóa học</Label>
              <Input
                id="course-title"
                name="title"
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="VD: Next.js 16 + Supabase Fullstack"
                required
                value={title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input
                id="course-slug"
                name="slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(makeSlug(event.target.value));
                }}
                placeholder="nextjs-supabase-fullstack"
                required
                value={slug}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_180px_160px_110px]">
            <div className="space-y-2">
              <Label htmlFor="course-category">Category</Label>
              <Input
                id="course-category"
                name="category"
                onChange={(event) => setCategory(event.target.value)}
                required
                value={category}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-level">Trình độ</Label>
              <select
                className="h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-bold text-foreground"
                id="course-level"
                name="level"
                onChange={(event) => setLevel(event.target.value)}
                value={level}
              >
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-duration">Thời lượng</Label>
              <Input
                id="course-duration"
                name="durationHours"
                onChange={(event) => setDurationHours(event.target.value)}
                required
                step="0.5"
                type="number"
                value={durationHours}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-accent">Accent</Label>
              <Input
                id="course-accent"
                name="accent"
                onChange={(event) => setAccent(event.target.value)}
                required
                type="color"
                value={accent}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="course-thumbnail-url">Link ảnh banner</Label>
              <Input
                id="course-thumbnail-url"
                name="thumbnailUrl"
                onChange={(event) => setThumbnailUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                value={thumbnailUrl}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-banner">Hoặc upload file ảnh</Label>
              <Input
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                id="course-banner"
                name="banner"
                onChange={updateBannerPreview}
                type="file"
              />
              <p className="text-xs font-bold text-muted-foreground">
                {bannerFileName || "Nếu chọn file, file upload sẽ được dùng làm banner chính."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <Card className="min-w-0 bg-card shadow-none">
          <CardHeader className="border-b-2 border-border bg-card">
            <p className="text-sm font-black uppercase text-primary">Editor</p>
            <CardTitle className="mt-2 text-xl font-black text-foreground">Mô tả khóa học</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-base border-2 border-border bg-card">
              <div className="flex flex-wrap gap-1 border-b-2 border-border p-2">
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertLine("## ", "Tiêu đề mục")} type="button" variant="ghost">
                  <Heading2 className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertMarkdown("**", "**", "đoạn in đậm")} type="button" variant="ghost">
                  <Bold className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertMarkdown("_", "_", "đoạn in nghiêng")} type="button" variant="ghost">
                  <Italic className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertLine("- ", "ý chính")} type="button" variant="ghost">
                  <List className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertLine("1. ", "bước thực hiện")} type="button" variant="ghost">
                  <ListOrdered className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertLine("> ", "ghi chú")} type="button" variant="ghost">
                  <Quote className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertMarkdown("`", "`", "code")} type="button" variant="ghost">
                  <Code2 className="size-4" />
                </Button>
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertMarkdown("[", `](${linkUrl || "https://"})`, "link text")} type="button" variant="ghost">
                  <LinkIcon className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 p-3 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  aria-label="Link URL"
                  className="bg-card"
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="Link URL"
                  value={linkUrl}
                />
                <Input
                  aria-label="Image alt"
                  className="bg-card"
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="Mô tả ảnh"
                  value={imageAlt}
                />
                <Input
                  aria-label="Image URL"
                  className="bg-card md:col-span-2"
                  onChange={(event) => setContentImageUrl(event.target.value)}
                  placeholder="URL ảnh để chèn vào mô tả"
                  value={contentImageUrl}
                />
                <Button
                  className="h-10 px-4 shadow-none md:col-start-3 md:row-start-1"
                  disabled={!contentImageUrl.trim()}
                  onClick={() => insertBlock(`![${imageAlt || "Ảnh minh họa"}](${contentImageUrl.trim()})`)}
                  type="button"
                  variant="outline"
                >
                  <ImagePlus className="size-4" />
                  Chèn ảnh
                </Button>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-base border-2 border-border bg-card px-4 text-sm font-black shadow-none transition hover:bg-secondary-background md:col-start-3">
                  <Upload className="size-4" />
                  Upload ảnh
                  <input
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    onChange={uploadAndInsertContentImage}
                    type="file"
                  />
                </label>
                <p className="text-xs font-bold leading-5 text-muted-foreground md:col-span-3">
                  Đặt con trỏ trong mô tả, rồi dán URL hoặc upload ảnh để chèn vào đúng vị trí.
                  {imageUploadStatus ? ` ${imageUploadStatus}` : ""}
                </p>
              </div>
            </div>
            <Textarea
              className="min-h-[420px] resize-y bg-card font-mono text-[15px] leading-7 text-foreground"
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              ref={textareaRef}
              required
              value={description}
            />
            <div className="space-y-2">
              <Label htmlFor="course-outcomes">Bạn sẽ học được</Label>
              <Textarea
                className="min-h-32 bg-card"
                id="course-outcomes"
                name="outcomes"
                onChange={(event) => setOutcomes(event.target.value)}
                placeholder="Mỗi dòng là một outcome"
                required
                value={outcomes}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-card shadow-none xl:sticky xl:top-24 xl:h-fit">
          <CardHeader className="border-b-2 border-border bg-card">
            <p className="text-sm font-black uppercase text-primary">Preview</p>
            <CardTitle className="mt-2 text-xl font-black text-foreground">Khóa học khi publish</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative min-h-52 overflow-hidden rounded-base border-2 border-border bg-secondary-background">
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={title || "Course banner"} className="h-56 w-full object-cover" src={previewImage} />
              ) : (
                <div className="grid h-56 place-items-center px-6 text-center text-xl font-black uppercase text-foreground">
                  {title || "Course banner"}
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{category || "Fullstack"}</Badge>
              <Badge variant="outline">{level || "Cơ bản"}</Badge>
              <Badge variant="secondary">{durationHours || "18"} giờ</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight text-foreground">
              {title || "Tên khóa học"}
            </h2>
            <div className="markdown-preview-scroll mt-5 max-h-[360px] overflow-auto rounded-base border-2 border-border bg-card p-4">
              <MarkdownViewer content={description || "_Chưa có mô tả._"} />
            </div>
            <div className="mt-5 rounded-base border-2 border-border bg-secondary-background p-4">
              <p className="text-sm font-black uppercase text-primary">Bạn sẽ học được</p>
              <div className="mt-3 grid gap-2">
                {(previewOutcomes.length ? previewOutcomes : ["Outcome mẫu"]).map((outcome) => (
                  <div className="rounded-base border-2 border-border bg-card px-3 py-2 text-sm font-bold" key={outcome}>
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
            <Button className="mt-6 w-full" type="submit">
              Tạo khóa học
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
