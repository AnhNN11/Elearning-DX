import { getAdminDashboardMetrics, getCourses, getMentorBookings } from "@/lib/data";
import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    await requireApiAdmin();
    const [metrics, courses, bookings] = await Promise.all([
      getAdminDashboardMetrics(),
      getCourses(true),
      getMentorBookings(),
    ]);

    return apiOk({ metrics, courses, bookings });
  } catch (error) {
    return apiError(error);
  }
}
