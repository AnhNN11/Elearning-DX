import { getMentorBookings } from "@/lib/data";
import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    await requireApiAdmin();
    const bookings = await getMentorBookings();
    return apiOk({ bookings });
  } catch (error) {
    return apiError(error);
  }
}
