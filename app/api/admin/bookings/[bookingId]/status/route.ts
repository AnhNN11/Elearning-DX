import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { bookingStatusSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = bookingStatusSchema.parse({
      bookingId,
      status: formText(formData, "status"),
    });

    await orm.bookings.updateStatus(parsed.bookingId, parsed.status);

    return apiOk({ status: parsed.status });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
