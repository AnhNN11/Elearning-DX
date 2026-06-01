import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./auth";

export function apiOk<T extends Record<string, unknown>>(data?: T) {
  return NextResponse.json({ ok: true, ...(data ?? {}) });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Dữ liệu gửi lên không hợp lệ.";
    return NextResponse.json({ ok: false, error: message, issues: error.issues }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý API.";
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
