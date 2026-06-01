import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { isUploadFile } from "@/lib/api/course-storage";
import { apiError, apiOk, csvToArray, formText } from "@/lib/api/responses";
import { blogPostSchema } from "@/lib/api/schemas";

function estimateReadTime(content: string, locale: "vi" | "en") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return locale === "vi" ? `${minutes} phút` : `${minutes} min`;
}

export async function POST(request: Request) {
  try {
    const profile = await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const markdownFile = formData.get("markdownFile");
    const fileContent = isUploadFile(markdownFile) ? await markdownFile.text() : "";
    const locale = formText(formData, "locale") === "en" ? "en" : "vi";
    const content = fileContent || formText(formData, "content");
    const readTime = formText(formData, "readTime") || estimateReadTime(content, locale);
    const parsed = blogPostSchema.parse({
      title: formText(formData, "title"),
      slug: formText(formData, "slug"),
      excerpt: formText(formData, "excerpt"),
      category: formText(formData, "category"),
      tags: formText(formData, "tags"),
      readTime,
      locale,
      authorName: formText(formData, "authorName") || profile.fullName,
      authorRole: formText(formData, "authorRole"),
      mentorName: formText(formData, "mentorName"),
      sourceFileName: isUploadFile(markdownFile) ? markdownFile.name : "",
      content,
      published: formData.get("published") === "on" || formData.get("published") === "true",
    });

    const post = await orm.content.upsertBlogPost({
      ...parsed,
      readTime: parsed.readTime ?? readTime,
      tags: csvToArray(parsed.tags),
      createdBy: profile.id,
    });

    return apiOk({ post });
  } catch (error) {
    return apiError(error);
  }
}
