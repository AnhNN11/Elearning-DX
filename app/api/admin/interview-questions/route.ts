import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, csvToArray, formText } from "@/lib/api/responses";
import { interviewQuestionSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const questionMarkdown = formText(formData, "question");
    const answerMarkdown = formText(formData, "answer");
    const parsed = interviewQuestionSchema.parse({
      category: formText(formData, "category"),
      level: formText(formData, "level"),
      role: formText(formData, "role"),
      skills: formText(formData, "skills"),
      question: questionMarkdown,
      prompt: formText(formData, "prompt") || questionMarkdown,
      answer: answerMarkdown,
      checklist: formText(formData, "checklist") || answerMarkdown,
      locale: formText(formData, "locale"),
      published: formData.get("published") === "on" || formData.get("published") === "true",
    });

    const question = await orm.content.createInterviewQuestion({
      ...parsed,
      skills: csvToArray(parsed.skills),
    });

    return apiOk({ question });
  } catch (error) {
    return apiError(error);
  }
}
