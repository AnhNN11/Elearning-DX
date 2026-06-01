import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getBlogPosts } from "@/lib/content";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") === "en" ? "en" : "vi";
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    if (includeDrafts) {
      await requireApiAdmin();
    }

    const posts = await getBlogPosts(locale, includeDrafts);
    return apiOk({ posts });
  } catch (error) {
    return apiError(error);
  }
}
