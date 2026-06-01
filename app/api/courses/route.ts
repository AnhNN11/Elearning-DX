import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getCourses } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    if (includeDrafts) {
      await requireApiAdmin();
    }

    const courses = await getCourses(includeDrafts);
    return apiOk({ courses });
  } catch (error) {
    return apiError(error);
  }
}
