"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast as sonnerToast, Toaster } from "sonner";

const toastMessages: Record<string, { title: string; description: string; type?: "success" | "error" | "info" }> = {
  "asset-uploaded": {
    title: "Đã upload tài liệu",
    description: "Tài liệu khóa học đã được thêm vào thư viện của môn học.",
  },
  "admin-error": {
    title: "Không lưu được thay đổi",
    description: "Kiểm tra lại dữ liệu nhập hoặc cấu hình Supabase rồi thử lại.",
    type: "error",
  },
  "banner-uploaded": {
    title: "Đã cập nhật banner",
    description: "Ảnh đại diện khóa học đã được upload và liên kết với khóa học.",
  },
  "blog-saved": {
    title: "Đã lưu bài blog",
    description: "Bài Markdown và thông tin mentor đã được cập nhật.",
  },
  "booking-updated": {
    title: "Đã cập nhật booking",
    description: "Trạng thái booking mentor đã được lưu.",
  },
  "course-created": {
    title: "Đã tạo khóa học",
    description: "Khóa học mới đã sẵn sàng để cấu hình lesson, YouTube và tài liệu.",
  },
  "course-published": {
    title: "Đã lưu trạng thái xuất bản",
    description: "Trạng thái public/draft của khóa học đã được cập nhật.",
  },
  "course-saved": {
    title: "Đã lưu cấu hình khóa học",
    description: "Thông tin tổng quan, outcomes và thời lượng đã được cập nhật.",
  },
  "interview-created": {
    title: "Đã thêm câu hỏi",
    description: "Câu hỏi phỏng vấn mới đã được lưu.",
  },
  "lesson-created": {
    title: "Đã thêm lesson",
    description: "Lesson mới đã được thêm vào khóa học.",
  },
  "lesson-saved": {
    title: "Đã lưu lesson",
    description: "Nội dung Markdown, thời lượng và link video đã được cập nhật.",
  },
  "landing-saved": {
    title: "Đã lưu landing page",
    description: "Block nội dung trang chủ đã được cập nhật.",
  },
  "role-created": {
    title: "Đã lưu role",
    description: "Role quản trị đã được tạo hoặc cập nhật.",
  },
  "role-updated": {
    title: "Đã cập nhật quyền",
    description: "Role của user đã được cập nhật.",
  },
  "youtube-updated": {
    title: "Đã lưu YouTube",
    description: "Link video của lesson đã được kiểm tra và cập nhật.",
  },
};

export function AdminToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastKey = searchParams.get("toast");
  const customMessage = searchParams.get("message");
  const customType = searchParams.get("toastType");
  const toastToken = searchParams.toString();
  const handledTokenRef = useRef("");

  const toastConfig = useMemo(() => {
    if (!toastKey) {
      return null;
    }

    const fallbackType = customType === "error" || customType === "info" ? customType : "success";
    const mapped = toastMessages[toastKey] ?? {
      title: fallbackType === "error" ? "Không lưu được thay đổi" : "Đã cập nhật",
      description: customMessage ?? "Thao tác đã được xử lý.",
      type: fallbackType,
    };

    return {
      ...mapped,
      description: customMessage ?? mapped.description,
      type: mapped.type ?? fallbackType,
    };
  }, [customMessage, customType, toastKey]);

  useEffect(() => {
    if (!toastToken || !toastConfig || handledTokenRef.current === toastToken) {
      return;
    }

    handledTokenRef.current = toastToken;
    const options = {
      description: toastConfig.description,
      duration: toastConfig.type === "error" ? 7200 : 4600,
    };

    if (toastConfig.type === "error") {
      sonnerToast.error(toastConfig.title, options);
    } else if (toastConfig.type === "info") {
      sonnerToast.info(toastConfig.title, options);
    } else {
      sonnerToast.success(toastConfig.title, options);
    }

    const timeout = window.setTimeout(() => router.replace(pathname, { scroll: false }), 200);
    return () => window.clearTimeout(timeout);
  }, [pathname, router, toastConfig, toastToken]);

  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "border-2 border-border font-base shadow-shadow",
          title: "font-heading",
          description: "font-base",
        },
      }}
    />
  );
}
