import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./auth";

const zodFieldLabels: Record<string, string> = {
  title: "Tiêu đề",
  slug: "Slug",
  excerpt: "Mô tả ngắn",
  category: "Category",
  content: "Nội dung",
  locale: "Ngôn ngữ",
  authorName: "Tên người viết",
  authorRole: "Vai trò người viết",
  mentorName: "Mentor",
  sourceFileName: "File Markdown",
  coverImageUrl: "Cover image",
  readTime: "Read time",
  description: "Mô tả",
  thumbnailUrl: "Link ảnh",
  durationHours: "Thời lượng",
  outcomes: "Bạn sẽ học được",
  level: "Trình độ",
};

function formatZodIssue(error: ZodError) {
  const issue = error.issues[0];

  if (!issue) {
    return "Dữ liệu gửi lên không hợp lệ.";
  }

  const fieldPath = issue.path.map(String).join(".");
  const field = zodFieldLabels[fieldPath] ?? fieldPath;

  return field ? `${field}: ${issue.message}` : issue.message;
}

function getObjectErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as Record<string, unknown>;
  const message = typeof record.message === "string" ? record.message : "";
  const code = typeof record.code === "string" ? record.code : "";
  const details = typeof record.details === "string" ? record.details : "";
  const hint = typeof record.hint === "string" ? record.hint : "";
  const description = typeof record.error_description === "string" ? record.error_description : "";
  const name = typeof record.name === "string" ? record.name : "";
  const parts = [
    code ? `[${code}]` : "",
    message || description || name,
    details ? `Details: ${details}` : "",
    hint ? `Hint: ${hint}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : null;
}

export function apiOk<T extends Record<string, unknown>>(data?: T) {
  return NextResponse.json({ ok: true, ...(data ?? {}) });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const message = formatZodIssue(error);
    return NextResponse.json({ ok: false, error: message, issues: error.issues }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : getObjectErrorMessage(error) ?? "Có lỗi xảy ra khi xử lý API.";
  console.error("[apiError]", message, error);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export function csvToArray(value?: string | null) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

export function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
