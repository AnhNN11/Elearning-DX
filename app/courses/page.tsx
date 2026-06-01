import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { CourseExplorer } from "@/components/course-explorer";
import { DotPattern } from "@/components/dot-pattern";
import { SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const resolvedSearchParams = await searchParams;
  const courses = await getCourses();
  const featuredCourse = courses[0];

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate overflow-hidden border-b-2 border-border bg-foreground py-12 text-background">
        <DotPattern className="text-main/25 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_72%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge className="bg-main text-main-foreground">{dict.courses.catalogEyebrow}</Badge>
            <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
              {dict.courses.catalogTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-background/75">
              {dict.courses.catalogDescription}
            </p>
          </div>
          {featuredCourse && (
            <div className="relative h-72 overflow-hidden rounded-base border-2 border-background bg-background shadow-shadow">
              {featuredCourse.thumbnailUrl ? (
                <Image
                  alt={`${featuredCourse.title} banner`}
                  className="h-full w-full object-cover"
                  height={520}
                  priority
                  src={featuredCourse.thumbnailUrl}
                  width={900}
                />
              ) : (
                <div className="grid h-full place-items-center bg-secondary px-8 text-center text-3xl font-black uppercase text-foreground">
                  {featuredCourse.title}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeader
          description={dict.courses.browseDescription}
          eyebrow={dict.courses.browseEyebrow}
          title={dict.courses.browseTitle}
        />
        <CourseExplorer copy={dict.courses} courses={courses} initialQuery={resolvedSearchParams?.q ?? ""} />
      </section>
    </main>
  );
}
