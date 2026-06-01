import type { SupabaseClient } from "@supabase/supabase-js";
import { uploadImageToCloudinary } from "@/lib/api/cloudinary";
import { createOrm } from "@/lib/orm";
import type { CourseAsset } from "@/lib/types";

export function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function sanitizeFileName(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return normalized || "upload";
}

export async function uploadCourseStorageFile(
  supabase: SupabaseClient,
  {
    bucket,
    courseId,
    courseSlug,
    file,
    kind,
    title,
    userId,
  }: {
    bucket: "course-media" | "course-documents";
    courseId: string;
    courseSlug: string;
    file: File;
    kind: CourseAsset["kind"];
    title: string;
    userId: string;
  },
) {
  const orm = await createOrm(supabase);

  if (!orm) {
    throw new Error("Supabase ORM chưa được cấu hình.");
  }

  if (bucket === "course-media" || kind === "banner") {
    const upload = await uploadImageToCloudinary(file, { courseSlug });
    const mimeType = file.type || (upload.format ? `image/${upload.format}` : "image/*");
    const fileSize = upload.bytes ?? file.size;

    if (kind === "banner") {
      await orm.courses.updateThumbnail(courseId, upload.secureUrl);
    }

    await orm.courses.createAsset({
      courseId,
      title,
      kind,
      storageBucket: "cloudinary",
      storagePath: upload.publicId,
      publicUrl: upload.secureUrl,
      mimeType,
      fileSize,
      createdBy: userId,
    });

    return upload.secureUrl;
  }

  const safeName = sanitizeFileName(file.name);
  const storagePath = `${courseSlug}/${crypto.randomUUID()}-${safeName}`;
  const contentType = file.type || "application/octet-stream";
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "31536000",
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  await orm.courses.createAsset({
    courseId,
    title,
    kind,
    storageBucket: bucket,
    storagePath,
    publicUrl: data.publicUrl,
    mimeType: contentType,
    fileSize: file.size,
    createdBy: userId,
  });

  return data.publicUrl;
}
