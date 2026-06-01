import { requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { quizSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = quizSchema.parse({
      assessmentId: formText(formData, "assessmentId"),
      score: formText(formData, "score"),
      passed: formText(formData, "passed"),
    });
    const answers = Object.fromEntries(
      [...formData.entries()].map(([key, value]) => [key, typeof value === "string" ? value : value.name]),
    );

    const submission = await orm.learning.submitQuiz(profile.id, {
      assessmentId: parsed.assessmentId,
      score: parsed.score,
      passed: parsed.passed,
      answers,
    });

    return apiOk({ submission });
  } catch (error) {
    return apiError(error);
  }
}
