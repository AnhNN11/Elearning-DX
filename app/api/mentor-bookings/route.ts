import { requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, csvToArray, formText } from "@/lib/api/responses";
import { mentorBookingSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = mentorBookingSchema.parse({
      fullName: formText(formData, "fullName"),
      email: formText(formData, "email"),
      topic: formText(formData, "topic"),
      mentorName: formText(formData, "mentorName") || undefined,
      interviewRole: formText(formData, "interviewRole") || undefined,
      skills: formText(formData, "skills") || undefined,
      level: formText(formData, "level"),
      preferredTime: formText(formData, "preferredTime"),
      note: formText(formData, "note") || undefined,
    });

    const booking = await orm.bookings.createMentorBooking({
      ...parsed,
      skills: csvToArray(parsed.skills),
    });

    return apiOk({ booking });
  } catch (error) {
    return apiError(error);
  }
}
