"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type ApiPayload = {
  ok?: boolean;
  error?: string;
  url?: string;
  checkoutUrl?: string;
  course?: {
    id: string;
    slug: string;
    title?: string;
  };
  post?: {
    locale?: string;
    slug: string;
  };
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getInternalOrigin() {
  const headerStore = await headers();
  const requestOrigin = headerStore.get("origin");
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (requestOrigin) {
    return requestOrigin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

async function callApi(
  path: string,
  formData?: FormData,
  options: {
    admin?: boolean;
    loginNext?: string;
    method?: "DELETE" | "POST" | "PATCH";
  } = {},
) {
  const headerStore = await headers();
  const cookie = headerStore.get("cookie");
  const requestHeaders = new Headers();

  if (cookie) {
    requestHeaders.set("cookie", cookie);
  }

  const response = await fetch(`${await getInternalOrigin()}${path}`, {
    body: formData,
    cache: "no-store",
    headers: requestHeaders,
    method: options.method ?? "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as ApiPayload;

  if (response.status === 401) {
    const loginNext =
      options.loginNext && options.loginNext.startsWith("/") && !options.loginNext.startsWith("//")
        ? `?next=${encodeURIComponent(options.loginNext)}`
        : "";
    redirect(options.admin ? "/admin/login" : `/login${loginNext}`);
  }

  if (response.status === 403) {
    redirect(options.admin ? "/admin/login?error=not-admin" : "/login");
  }

  if (!response.ok) {
    throw new Error(payload.error ?? `API request failed: ${path}`);
  }

  return payload;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu dữ liệu.";
}

async function callAdminApiOrToast(
  path: string,
  formData: FormData | undefined,
  returnTo: string,
  options: {
    method?: "DELETE" | "POST" | "PATCH";
  } = {},
): Promise<ApiPayload> {
  try {
    return await callApi(path, formData, {
      admin: true,
      method: options.method,
    });
  } catch (error) {
    redirectWithToast(returnTo, "admin-error", {
      message: getErrorMessage(error),
      type: "error",
    });
  }
}

function redirectWithToast(
  path: string,
  toast: string,
  options: {
    message?: string;
    type?: "error" | "info" | "success";
  } = {},
): never {
  const separator = path.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    toast,
    toastType: options.type ?? "success",
  });

  if (options.message) {
    params.set("message", options.message);
  }

  redirect(`${path}${separator}${params.toString()}`);
}

export async function enrollCourseAction(formData: FormData) {
  const courseSlug = formValue(formData, "courseSlug");
  await callApi("/api/enrollments", formData, {
    loginNext: `/courses/${courseSlug}`,
  });

  revalidatePath("/learn");
  redirect(`/learn/${courseSlug}`);
}

export async function checkoutCourseAction(formData: FormData) {
  const courseSlug = formValue(formData, "courseSlug");
  const payload = await callApi("/api/payments/sepay/checkout", formData, {
    loginNext: `/courses/${courseSlug}`,
  });

  revalidatePath(`/courses/${courseSlug}`);
  redirect(payload.checkoutUrl ?? `/courses/${courseSlug}`);
}

export async function createCourseAction(formData: FormData) {
  const payload = await callAdminApiOrToast("/api/admin/courses", formData, "/admin/courses");

  revalidatePath("/admin/courses");
  redirectWithToast(payload.course?.id ? `/admin/courses/${payload.course.id}` : "/admin/courses", "course-created");
}

export async function updateCourseAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const previousSlug = formValue(formData, "previousSlug");
  const courseSlug = formValue(formData, "slug") || previousSlug;
  await callAdminApiOrToast(`/api/admin/courses/${courseId}`, formData, `/admin/courses/${courseId}`, {
    method: "PATCH",
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${previousSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirectWithToast(`/admin/courses/${courseId}`, "course-saved");
}

export async function deleteCourseAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  await callAdminApiOrToast(`/api/admin/courses/${courseId}`, undefined, "/admin/courses", {
    method: "DELETE",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  if (courseSlug) {
    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath(`/learn/${courseSlug}`);
  }
  revalidatePath("/admin/courses");
  redirectWithToast("/admin/courses", "course-deleted");
}

export async function updateCoursePublishAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  const returnTo = formValue(formData, "returnTo") || "/admin/courses";
  await callAdminApiOrToast(`/api/admin/courses/${courseId}/publish`, formData, returnTo, {
    method: "PATCH",
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirectWithToast(returnTo, "course-published");
}

export async function confirmCoursePaymentAction(formData: FormData) {
  const orderId = formValue(formData, "orderId");
  const returnTo = formValue(formData, "returnTo") || "/admin/payments";

  if (!orderId) {
    redirectWithToast(returnTo, "admin-error", {
      message: "Thiếu mã đơn thanh toán.",
      type: "error",
    });
  }

  await callAdminApiOrToast(`/api/admin/payments/${orderId}/mark-paid`, undefined, returnTo, {
    method: "PATCH",
  });

  revalidatePath("/admin/payments");
  revalidatePath("/profile");
  revalidatePath("/learn");
  redirectWithToast(returnTo, "payment-confirmed", {
    message: `Đã xác nhận thanh toán ${orderId}.`,
  });
}

export async function uploadCourseBannerAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  await callAdminApiOrToast(`/api/admin/courses/${courseId}/banner`, formData, `/admin/courses/${courseId}`);

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirectWithToast(`/admin/courses/${courseId}`, "banner-uploaded");
}

export async function uploadCourseAssetAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  await callAdminApiOrToast(`/api/admin/courses/${courseId}/assets`, formData, `/admin/courses/${courseId}`);

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/admin/courses/${courseId}`);
  redirectWithToast(`/admin/courses/${courseId}`, "asset-uploaded");
}

export async function updateUserRoleAction(formData: FormData) {
  const userId = formValue(formData, "userId");
  await callAdminApiOrToast(`/api/admin/users/${userId}/role`, formData, "/admin/users", {
    method: "PATCH",
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
  redirectWithToast("/admin/users", "role-updated");
}

export async function createRoleAction(formData: FormData) {
  await callAdminApiOrToast("/api/admin/roles", formData, "/admin/roles");

  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
  redirectWithToast("/admin/roles", "role-created");
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = formValue(formData, "bookingId");
  await callAdminApiOrToast(`/api/admin/bookings/${bookingId}/status`, formData, "/admin/bookings", {
    method: "PATCH",
  });

  revalidatePath("/admin/bookings");
  redirectWithToast("/admin/bookings", "booking-updated");
}

export async function createLessonAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  await callAdminApiOrToast(`/api/admin/courses/${courseId}/lessons`, formData, `/admin/courses/${courseId}`);

  revalidatePath(`/admin/courses/${courseId}`);
  if (courseSlug) {
    revalidatePath(`/learn/${courseSlug}`);
  }
  redirectWithToast(`/admin/courses/${courseId}`, "lesson-created");
}

export async function updateLessonAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  const lessonId = formValue(formData, "lessonId");
  await callAdminApiOrToast(`/api/admin/lessons/${lessonId}`, formData, `/admin/courses/${courseId}`, {
    method: "PATCH",
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/learn/${courseSlug}`);
  redirectWithToast(`/admin/courses/${courseId}`, "lesson-saved");
}

export async function updateLessonVideoAction(formData: FormData) {
  const courseId = formValue(formData, "courseId");
  const courseSlug = formValue(formData, "courseSlug");
  const lessonId = formValue(formData, "lessonId");
  await callAdminApiOrToast(`/api/admin/lessons/${lessonId}/video`, formData, `/admin/courses/${courseId}`, {
    method: "PATCH",
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/learn/${courseSlug}`);
  redirectWithToast(`/admin/courses/${courseId}`, "youtube-updated");
}

export async function bookMentorAction(formData: FormData) {
  await callApi("/api/mentor-bookings", formData);

  revalidatePath("/mentor-booking");
  redirect("/mentor-booking?booking=sent");
}

export async function createBlogPostAction(formData: FormData) {
  const slug = formValue(formData, "slug");
  await callAdminApiOrToast("/api/admin/blog-posts", formData, "/admin/blog");

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  redirectWithToast("/admin/blog", "blog-saved");
}

export async function updateBlogPostAction(formData: FormData) {
  const previousSlug = formValue(formData, "previousSlug");
  const slug = formValue(formData, "slug") || previousSlug;
  await callAdminApiOrToast("/api/admin/blog-posts", formData, "/admin/blog", {
    method: "PATCH",
  });

  revalidatePath("/blog");
  if (previousSlug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/admin/blog");
  redirectWithToast("/admin/blog", "blog-saved");
}

export async function deleteBlogPostAction(formData: FormData) {
  const slug = formValue(formData, "slug");
  await callAdminApiOrToast("/api/admin/blog-posts", formData, "/admin/blog", {
    method: "DELETE",
  });

  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/admin/blog");
  redirectWithToast("/admin/blog", "blog-deleted");
}

export async function upsertLandingBlockAction(formData: FormData) {
  await callAdminApiOrToast("/api/admin/landing-blocks", formData, "/admin/landing");

  revalidatePath("/");
  revalidatePath("/admin/landing");
  redirectWithToast("/admin/landing", "landing-saved");
}

export async function createInterviewQuestionAction(formData: FormData) {
  await callAdminApiOrToast("/api/admin/interview-questions", formData, "/admin/interviews");

  revalidatePath("/interview-practice");
  revalidatePath("/admin/interviews");
  redirectWithToast("/admin/interviews", "interview-created");
}

export async function completeLessonAction(formData: FormData) {
  const courseSlug = formValue(formData, "courseSlug");
  await callApi("/api/lesson-progress", formData);

  revalidatePath(`/learn/${courseSlug}`);
}

export async function submitQuizAction(formData: FormData) {
  await callApi("/api/submissions/quiz", formData);

  revalidatePath("/learn");
}

export async function submitCodeAction(formData: FormData) {
  await callApi("/api/submissions/code", formData);

  revalidatePath("/learn");
}

export async function updateProfileAction(formData: FormData) {
  await callApi("/api/profile", formData, { method: "PATCH" });

  revalidatePath("/profile");
  revalidatePath("/login");
  redirect("/profile?saved=1");
}

export async function linkGoogleAccountAction() {
  const payload = await callApi("/api/account/link-google", undefined, { method: "POST" });

  if (!payload.url) {
    redirect("/profile?account=error");
  }

  redirect(payload.url);
}
