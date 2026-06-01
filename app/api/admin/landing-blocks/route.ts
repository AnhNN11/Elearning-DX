import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { landingBlockSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const profile = await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = landingBlockSchema.parse({
      key: formText(formData, "key"),
      locale: formText(formData, "locale"),
      eyebrow: formText(formData, "eyebrow"),
      title: formText(formData, "title"),
      description: formText(formData, "description"),
      ctaLabel: formText(formData, "ctaLabel"),
      ctaHref: formText(formData, "ctaHref"),
      secondaryCtaLabel: formText(formData, "secondaryCtaLabel"),
      secondaryCtaHref: formText(formData, "secondaryCtaHref"),
      imageUrl: formText(formData, "imageUrl"),
      items: formText(formData, "items"),
      position: formText(formData, "position") || "50",
      published: formData.get("published") === "on" || formData.get("published") === "true",
    });

    const block = await orm.content.upsertLandingBlock({
      ...parsed,
      updatedBy: profile.id,
    });

    return apiOk({ block });
  } catch (error) {
    return apiError(error);
  }
}
