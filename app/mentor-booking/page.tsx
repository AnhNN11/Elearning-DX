import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
import { MentorBookingCalendar } from "@/components/mentor-booking-calendar";
import { Badge } from "@/components/ui/badge";
import { mentors } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function MentorBookingPage({
  searchParams,
}: {
  searchParams?: Promise<{ booking?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const resolvedSearchParams = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate overflow-hidden border-b-2 border-foreground bg-primary py-14 text-primary-foreground">
        <DotPattern className="text-background/18 [mask-image:radial-gradient(circle_at_35%_30%,black,transparent_72%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <Badge className="border-background bg-background text-foreground" variant="outline">
            {dict.booking.eyebrow}
          </Badge>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            {dict.booking.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-primary-foreground/90">
            {dict.booking.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <MentorBookingCalendar
          bookingCopy={dict.booking}
          formCopy={dict.home}
          locale={locale}
          mentors={mentors}
          success={resolvedSearchParams?.booking === "sent"}
        />
      </section>
    </main>
  );
}
