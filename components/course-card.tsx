"use client";

import Image from "next/image";
import Link from "next/link";
import { getCourseBanner } from "@/lib/course-banners";
import type { Course } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Pill } from "./ui";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

export function CourseCard({
  copy,
  course,
}: {
  copy: Dictionary["courses"];
  course: Course;
}) {
  const lessonCount = course.modules.reduce((total, item) => total + item.lessons.length, 0);
  const banner = getCourseBanner(course.slug);

  return (
    <Card className="group min-h-[300px] overflow-hidden py-0 transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-40 overflow-hidden border-b-2 border-border bg-muted">
        <Image
          alt={`${course.title} banner`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          height={320}
          src={banner}
          width={600}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/55 to-transparent" />
      </div>
      <CardHeader className="pt-5">
        <div className="flex flex-wrap gap-2">
          <Pill>{course.category}</Pill>
          <Pill>{course.level}</Pill>
        </div>
        <CardTitle className="mt-4 text-xl font-black">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-6">{course.description}</p>
        <div className="text-muted-foreground mt-auto flex items-center justify-between pt-5 text-sm font-bold">
          <span>{lessonCount} {copy.lessonUnit}</span>
          <span>{course.durationHours} {copy.hourUnit}</span>
        </div>
      </CardContent>
      <CardFooter className="pb-5">
        <Button asChild className="w-full">
          <Link href={`/courses/${course.slug}`}>{copy.viewCourse}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
