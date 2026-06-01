import { AdminShell } from "@/components/admin-shell";
import { StatCard } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourses, getDemoCertificates } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const courses = await getCourses(true);
  const certificates = await getDemoCertificates();
  const lessons = courses.flatMap((course) => course.modules.flatMap((item) => item.lessons));

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">{dict.admin.dashboardTitle}</h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label={dict.admin.courseCount} value={String(courses.length)} />
        <StatCard label={dict.admin.lessonCount} value={String(lessons.length)} />
        <StatCard label={dict.admin.learnerCount} value="128" />
        <StatCard label={dict.admin.certificateCount} value={String(certificates.length)} />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{dict.admin.tasksTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {dict.admin.tasks.map((item) => (
              <div className="rounded-md bg-muted p-4 text-sm font-bold text-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
