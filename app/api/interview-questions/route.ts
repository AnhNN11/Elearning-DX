import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getInterviewQuestions } from "@/lib/content";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") === "en" ? "en" : "vi";
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    if (includeDrafts) {
      await requireApiAdmin();
    }

    const questions = await getInterviewQuestions(locale, includeDrafts);
    return apiOk({ questions });
  } catch (error) {
    return apiError(error);
  }
}
