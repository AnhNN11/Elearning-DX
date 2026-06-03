"use client";

import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { markdownToPlainText } from "@/lib/markdown-text";
import { formatVnd } from "@/lib/money";
import { Pill } from "./ui";
import { Badge } from "./ui/badge";
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
  const description = markdownToPlainText(course.description);
  const isFree = course.priceVnd <= 0;

  return (
    <Card className="group min-h-[300px] overflow-hidden py-0 transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-40 overflow-hidden border-b-2 border-border bg-muted">
        {course.thumbnailUrl ? (
          <Image
            alt={`${course.title} banner`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            height={320}
            src={course.thumbnailUrl}
            width={600}
          />
        ) : (
          <div className="grid h-full place-items-center bg-secondary px-6 text-center">
            <span className="text-lg font-black uppercase text-foreground">{course.title}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/55 to-transparent" />
        {isFree && (
          <Badge className="absolute left-3 top-3 border-background bg-main text-main-foreground shadow-shadow">
            Free
          </Badge>
        )}
      </div>
      <CardHeader className="pt-5">
        <div className="flex flex-wrap gap-2">
          <Pill>{course.category}</Pill>
          <Pill>{course.level}</Pill>
          <Pill>{formatVnd(course.priceVnd)}</Pill>
        </div>
        <CardTitle className="mt-4 text-xl font-black">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-6">{description}</p>
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
