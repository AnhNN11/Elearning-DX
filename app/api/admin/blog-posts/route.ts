import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { uploadImageToCloudinary } from "@/lib/api/cloudinary";
import { isUploadFile } from "@/lib/api/course-storage";
import { apiError, apiOk, csvToArray, formText } from "@/lib/api/responses";
import { blogPostSchema } from "@/lib/api/schemas";
import type { Profile } from "@/lib/types";

function estimateReadTime(content: string, locale: "vi" | "en") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return locale === "vi" ? `${minutes} phút` : `${minutes} min`;
}

async function parseBlogPostFormData(formData: FormData, profile: Profile) {
  const markdownFile = formData.get("markdownFile");
  const fileContent = isUploadFile(markdownFile) ? await markdownFile.text() : "";
  const locale = formText(formData, "locale") === "en" ? "en" : "vi";
  const content = fileContent || formText(formData, "content");
  const readTime = formText(formData, "readTime") || estimateReadTime(content, locale);
  const slug = formText(formData, "slug");
  const coverImage = formData.get("coverImage");
  let coverImageUrl = formText(formData, "coverImageUrl");

  if (isUploadFile(coverImage)) {
    const upload = await uploadImageToCloudinary(coverImage, {
      courseSlug: slug || "blog-post",
      folderName: "blog-covers",
    });
    coverImageUrl = upload.secureUrl;
  }

  const parsed = blogPostSchema.parse({
    title: formText(formData, "title"),
    slug,
    excerpt: formText(formData, "excerpt"),
    category: formText(formData, "category"),
    coverImageUrl,
    tags: formText(formData, "tags"),
    readTime,
    locale,
    authorName: formText(formData, "authorName") || profile.fullName,
    authorRole: formText(formData, "authorRole"),
    mentorName: formText(formData, "mentorName"),
    sourceFileName: isUploadFile(markdownFile) ? markdownFile.name : formText(formData, "sourceFileName"),
    content,
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });

  return {
    ...parsed,
    readTime: parsed.readTime ?? readTime,
    tags: csvToArray(parsed.tags),
    createdBy: profile.id,
  };
}

export async function POST(request: Request) {
  try {
    const profile = await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const post = await orm.content.upsertBlogPost(await parseBlogPostFormData(formData, profile));

    return apiOk({ post });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const previousLocale = formText(formData, "previousLocale") === "en" ? "en" : "vi";
    const previousSlug = formText(formData, "previousSlug") || formText(formData, "slug");
    const post = await orm.content.updateBlogPost({
      ...(await parseBlogPostFormData(formData, profile)),
      originalLocale: previousLocale,
      originalSlug: previousSlug,
    });

    return apiOk({ post });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const slug = formText(formData, "slug");
    const locale = formText(formData, "locale") === "en" ? "en" : "vi";

    await orm.content.deleteBlogPost(slug, locale);

    return apiOk({ post: { locale, slug } });
  } catch (error) {
    return apiError(error);
  }
}
