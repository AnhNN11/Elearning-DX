"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
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
import type { BlogPost, Mentor } from "@/lib/content";

type BlogAction = (formData: FormData) => void | Promise<void>;

const starterMarkdown = `## Mở bài

Tóm tắt vấn đề, ngữ cảnh người học cần biết và kết quả bài viết hướng tới.

## Ý chính

- Luận điểm quan trọng 1
- Luận điểm quan trọng 2
- Ví dụ hoặc checklist có thể áp dụng ngay

## Kết luận

Chốt lại hành động tiếp theo cho người đọc.`;

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

function estimateReadTime(content: string, locale: "vi" | "en") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return locale === "vi" ? `${minutes} phút` : `${minutes} min`;
}

export function AdminBlogComposer({
  action,
  defaultLocale,
  heading,
  initialPost,
  mentors,
  submitLabel,
}: {
  action: BlogAction;
  defaultLocale: "vi" | "en";
  heading?: string;
  initialPost?: BlogPost;
  mentors: Mentor[];
  submitLabel?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialLocale = initialPost?.locale ?? defaultLocale;
  const composerHeading = heading ?? (initialPost ? "Chỉnh sửa bài Markdown" : "Soạn bài Markdown");
  const buttonLabel = submitLabel ?? (initialPost ? "Cập nhật bài viết" : "Lưu bài viết");
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [category, setCategory] = useState(initialPost?.category ?? "Engineering");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl ?? "");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "nextjs, supabase");
  const [readTime, setReadTime] = useState(initialPost?.readTime ?? "");
  const [authorName, setAuthorName] = useState(initialPost?.authorName ?? mentors[0]?.name ?? "DolphinX Mentor");
  const [authorRole, setAuthorRole] = useState(initialPost?.authorRole ?? mentors[0]?.role ?? "");
  const [mentorName, setMentorName] = useState(initialPost?.mentorName ?? mentors[0]?.name ?? "");
  const [locale, setLocale] = useState<"vi" | "en">(initialLocale);
  const [published, setPublished] = useState(initialPost?.published ?? true);
  const [content, setContent] = useState(initialPost?.content.join("\n\n") || starterMarkdown);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("Ảnh minh họa");
  const [imageUploadStatus, setImageUploadStatus] = useState("");

  const previewReadTime = readTime || estimateReadTime(content, locale);
  const initialPublishedAt = initialPost?.publishedAt;
  const previewDate = useMemo(
    () =>
      initialPublishedAt
        ? new Date(initialPublishedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")
        : locale === "vi"
          ? "Hôm nay"
          : "Today",
    [initialPublishedAt, locale],
  );
  const previewCover = coverPreviewUrl || coverImageUrl;
  const hasCustomMentor = Boolean(mentorName && !mentors.some((mentor) => mentor.name === mentorName));

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(makeSlug(value));
    }
  }

  function insertMarkdown(prefix: string, suffix = "", placeholder = "text") {
    const target = textareaRef.current;
    if (!target) {
      setContent((current) => `${current}\n${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${prefix}${selected}${suffix}${content.slice(end)}`;
    const cursor = start + prefix.length + selected.length + suffix.length;

    setContent(next);
    requestAnimationFrame(() => {
      target.focus();
      target.setSelectionRange(cursor, cursor);
    });
  }

  function insertLine(prefix: string, placeholder: string) {
    const target = textareaRef.current;
    const start = target?.selectionStart ?? content.length;
    const needsNewline = start > 0 && content[start - 1] !== "\n";
    const nextPrefix = `${needsNewline ? "\n" : ""}${prefix}`;
    insertMarkdown(nextPrefix, "", placeholder);
  }

  function insertBlock(markdown: string) {
    const target = textareaRef.current;
    const start = target?.selectionStart ?? content.length;
    const end = target?.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const prefix = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after.length && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
    const next = `${before}${prefix}${markdown}${suffix}${after}`;
    const cursor = before.length + prefix.length + markdown.length;

    setContent(next);
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(cursor, cursor);
    });
  }

  async function loadMarkdownFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setContent(text);
    if (!title) {
      const titleFromFile = file.name.replace(/\.(md|markdown)$/i, "").replace(/[-_]+/g, " ");
      updateTitle(titleFromFile);
    }
  }

  async function uploadAndInsertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadStatus("Đang upload ảnh...");
    const formData = new FormData();
    formData.set("image", file);
    formData.set("folder", "blog");
    formData.set("context", slug || makeSlug(title) || "blog-post");

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
      setImageUrl(payload.url);
      setImageUploadStatus("Đã chèn ảnh vào bài.");
    } catch (error) {
      setImageUploadStatus(error instanceof Error ? error.message : "Upload ảnh thất bại.");
    } finally {
      event.target.value = "";
    }
  }

  function updateCoverPreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    if (!file) {
      setCoverPreviewUrl("");
      setCoverFileName("");
      return;
    }

    setCoverPreviewUrl(URL.createObjectURL(file));
    setCoverFileName(file.name);
  }

  function chooseMentor(value: string) {
    setMentorName(value);
    const mentor = mentors.find((item) => item.name === value);
    if (mentor) {
      setAuthorName(mentor.name);
      setAuthorRole(mentor.role);
    }
  }

  return (
    <form action={action} className="grid gap-6">
      {initialPost && (
        <>
          <input name="previousSlug" type="hidden" value={initialPost.slug} />
          <input name="previousLocale" type="hidden" value={initialPost.locale} />
          <input name="sourceFileName" type="hidden" value={initialPost.sourceFileName ?? ""} />
        </>
      )}
      <Card className="overflow-hidden bg-card shadow-none">
        <CardHeader className="border-b-2 border-border bg-card">
          <p className="text-sm font-black uppercase text-primary">Blog composer</p>
          <CardTitle className="mt-2 text-2xl font-black text-foreground">
            {composerHeading}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Tiêu đề</Label>
              <Input
                id="blog-title"
                name="title"
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="VD: Cách thiết kế RLS cho eLearning"
                required
                value={title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                name="slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(makeSlug(event.target.value));
                }}
                placeholder="cach-thiet-ke-rls"
                required
                value={slug}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            <div className="space-y-2">
              <Label htmlFor="blog-excerpt">Mô tả ngắn</Label>
              <Input
                id="blog-excerpt"
                name="excerpt"
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="Một câu mô tả rõ bài viết giúp người học giải quyết gì"
                required
                value={excerpt}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-category">Category</Label>
              <Input
                id="blog-category"
                name="category"
                onChange={(event) => setCategory(event.target.value)}
                required
                value={category}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-locale">Ngôn ngữ</Label>
              <select
                className="h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-bold text-foreground"
                id="blog-locale"
                name="locale"
                onChange={(event) => setLocale(event.target.value === "en" ? "en" : "vi")}
                value={locale}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="blog-tags">Tags</Label>
              <Input
                id="blog-tags"
                name="tags"
                onChange={(event) => setTags(event.target.value)}
                placeholder="nextjs, supabase"
                value={tags}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-read-time">Read time</Label>
              <Input
                id="blog-read-time"
                name="readTime"
                onChange={(event) => setReadTime(event.target.value)}
                placeholder={previewReadTime}
                value={readTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-mentor">Mentor</Label>
              <select
                className="h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-bold text-foreground"
                id="blog-mentor"
                name="mentorName"
                onChange={(event) => chooseMentor(event.target.value)}
                value={mentorName}
              >
                {hasCustomMentor && (
                  <option value={mentorName}>
                    {mentorName}{authorRole ? ` - ${authorRole}` : ""}
                  </option>
                )}
                {mentors.map((mentor) => (
                  <option key={mentor.name} value={mentor.name}>
                    {mentor.name} - {mentor.role}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex min-h-10 items-center gap-3 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-black">
              <input
                checked={published}
                name="published"
                onChange={(event) => setPublished(event.target.checked)}
                type="checkbox"
              />
              Published
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-author">Tên người viết</Label>
              <Input
                id="blog-author"
                name="authorName"
                onChange={(event) => setAuthorName(event.target.value)}
                required
                value={authorName}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-cover-url">Cover image URL</Label>
              <Input
                id="blog-cover-url"
                name="coverImageUrl"
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                value={coverImageUrl}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-cover-file">Hoặc upload cover</Label>
              <Input
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                id="blog-cover-file"
                name="coverImage"
                onChange={updateCoverPreview}
                type="file"
              />
              <p className="text-xs font-bold text-muted-foreground">
                {coverFileName || "Nếu chọn file, file upload sẽ được dùng làm cover chính."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-author-role">Vai trò hiển thị</Label>
            <Input
              id="blog-author-role"
              name="authorRole"
              onChange={(event) => setAuthorRole(event.target.value)}
              placeholder="Senior Mentor / AI Product Lead"
              value={authorRole}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <Card className="min-w-0 bg-card shadow-none">
          <CardHeader className="border-b-2 border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-primary">Editor</p>
                <CardTitle className="mt-2 text-xl font-black text-foreground">Nội dung bài viết</CardTitle>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-base border-2 border-border bg-card px-3 text-sm font-black">
                <Upload className="size-4" />
                Nạp file .md
                <input
                  accept=".md,.markdown,text/markdown,text/plain"
                  className="sr-only"
                  name="markdownFile"
                  onChange={loadMarkdownFile}
                  type="file"
                />
              </label>
            </div>
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
                <Button className="h-8 px-2 text-xs shadow-none" onClick={() => insertLine("> ", "trích dẫn hoặc ghi chú")} type="button" variant="ghost">
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
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="URL ảnh để chèn vào bài"
                  value={imageUrl}
                />
                <Button
                  className="h-10 px-4 shadow-none md:col-start-3 md:row-start-1"
                  disabled={!imageUrl.trim()}
                  onClick={() => insertBlock(`![${imageAlt || "Ảnh minh họa"}](${imageUrl.trim()})`)}
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
                    onChange={uploadAndInsertImage}
                    type="file"
                  />
                </label>
                <p className="text-xs font-bold leading-5 text-muted-foreground md:col-span-3">
                  Muốn ảnh nằm giữa hai đoạn text: đặt con trỏ ở vị trí đó trong editor, dán URL hoặc upload file ảnh, rồi chèn ảnh.
                  {imageUploadStatus ? ` ${imageUploadStatus}` : ""}
                </p>
              </div>
            </div>
            <Textarea
              className="min-h-[560px] resize-y bg-card font-mono text-[15px] leading-7 text-foreground placeholder:text-muted-foreground"
              name="content"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Nhập nội dung bài viết bằng Markdown..."
              ref={textareaRef}
              required
              value={content}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-card shadow-none xl:sticky xl:top-24 xl:h-fit">
          <CardHeader className="border-b-2 border-border bg-card">
            <p className="text-sm font-black uppercase text-primary">Preview</p>
            <CardTitle className="mt-2 text-xl font-black text-foreground">Bài viết khi publish</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <article className="min-w-0">
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge>{category || "Engineering"}</Badge>
                <Badge variant="outline">{previewReadTime}</Badge>
                <Badge>{mentorName || "DolphinX Mentor"}</Badge>
                <Badge variant="secondary">{previewDate}</Badge>
              </div>
              <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-foreground">
                {title || "Tiêu đề bài viết"}
              </h2>
              <p className="mt-4 text-base font-bold leading-7 text-muted-foreground">
                {excerpt || "Mô tả ngắn của bài viết sẽ hiển thị tại đây để admin kiểm tra trước khi lưu."}
              </p>
              <div className="mt-5 overflow-hidden rounded-base border-2 border-border bg-secondary-background">
                {previewCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={title || "Blog cover"} className="h-56 w-full object-cover" src={previewCover} />
                ) : (
                  <div className="grid h-40 place-items-center px-6 text-center text-sm font-black uppercase text-muted-foreground">
                    Chưa có cover image
                  </div>
                )}
              </div>
              <div className="mt-5 rounded-base border-2 border-border bg-card p-4">
                <p className="text-xs font-black uppercase text-primary">Mentor viết bài</p>
                <p className="mt-1 text-lg font-heading text-foreground">{authorName || "DolphinX Mentor"}</p>
                {authorRole && <p className="text-sm font-bold text-muted-foreground">{authorRole}</p>}
              </div>
              <div className="markdown-preview-scroll mt-6 max-h-[560px] overflow-auto rounded-base border-2 border-border bg-card p-5">
                <MarkdownViewer content={content || "_Chưa có nội dung preview._"} />
              </div>
            </article>
            <Button className="mt-6 w-full" type="submit">
              {buttonLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
