import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Pill } from "@/components/ui";
import { createCourseAction } from "@/lib/actions";
import { getCourseLessonCount, getCourses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminCoursesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const courses = await getCourses(true);

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-primary">Content</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">{dict.admin.coursesTitle}</h1>
        </div>
      </div>
      <form
        action={createCourseAction}
        className="mt-8 grid gap-3 rounded-lg border bg-card p-5 shadow-sm lg:grid-cols-[1fr_160px_160px]"
      >
        <Input
          name="title"
          placeholder={dict.admin.courseName}
          required
        />
        <Input
          name="slug"
          placeholder="slug"
          required
        />
        <Select name="level" defaultValue="Cơ bản">
          <SelectTrigger>
            <SelectValue placeholder={dict.admin.level} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cơ bản">Cơ bản</SelectItem>
            <SelectItem value="Trung cấp">Trung cấp</SelectItem>
            <SelectItem value="Nâng cao">Nâng cao</SelectItem>
          </SelectContent>
        </Select>
        <Input
          name="category"
          placeholder={dict.admin.category}
          required
        />
        <Input
          className="lg:col-span-2"
          name="description"
          placeholder={dict.admin.description}
          required
        />
        <Button className="lg:col-span-3" type="submit">
          {dict.admin.createCourse}
        </Button>
      </form>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{dict.admin.courseList}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.admin.course}</TableHead>
                <TableHead>{dict.admin.category}</TableHead>
                <TableHead>{dict.admin.lessons}</TableHead>
                <TableHead>{dict.admin.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Link className="font-black text-foreground hover:text-primary" href={`/admin/courses/${course.id}`}>
                      {course.title}
                    </Link>
                    <p className="text-muted-foreground mt-1 max-w-xl text-sm">{course.description}</p>
                  </TableCell>
                  <TableCell><Pill>{course.category}</Pill></TableCell>
                  <TableCell>{getCourseLessonCount(course)}</TableCell>
                  <TableCell>{course.published ? "Published" : "Draft"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
