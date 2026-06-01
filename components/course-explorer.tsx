"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Course } from "@/lib/types";

export function CourseExplorer({
  copy,
  courses,
  initialQuery = "",
}: {
  copy: Dictionary["courses"];
  courses: Course[];
  initialQuery?: string;
}) {
  const categories = useMemo(() => Array.from(new Set(courses.map((course) => course.category))), [courses]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState(initialQuery);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory = category === "all" || course.category === category;
      const matchesQuery =
        !normalized ||
        [
          course.title,
          course.description,
          course.category,
          course.level,
          course.outcomes.join(" "),
          course.modules.map((module) => module.title).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, courses, query]);

  return (
    <div className="mt-8 space-y-6">
      <Card className="bg-secondary">
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            value={query}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setCategory("all")}
              size="sm"
              type="button"
              variant={category === "all" ? "default" : "outline"}
            >
              {copy.all}
            </Button>
            {categories.map((item) => (
              <Button
                key={item}
                onClick={() => setCategory(item)}
                size="sm"
                type="button"
                variant={category === item ? "default" : "outline"}
              >
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Badge key={item} variant="outline">{item}</Badge>
        ))}
      </div>

      {filteredCourses.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard copy={copy} course={course} key={course.id} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent>
            <p className="font-heading text-foreground">{copy.noResults}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
