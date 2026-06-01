import { requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { codeSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = codeSchema.parse({
      assessmentId: formText(formData, "assessmentId"),
      score: formText(formData, "score"),
      passed: formText(formData, "passed"),
      code: formText(formData, "code"),
      results: formText(formData, "results"),
    });

    const submission = await orm.learning.submitCode(profile.id, {
      assessmentId: parsed.assessmentId,
      score: parsed.score,
      passed: parsed.passed,
      code: parsed.code,
      results: JSON.parse(parsed.results) as unknown,
    });

    return apiOk({ submission });
  } catch (error) {
    return apiError(error);
  }
}
