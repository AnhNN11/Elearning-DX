"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DotPattern } from "@/components/dot-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Mentor } from "@/lib/content";

type MentorProfile = {
  experience: string;
  bio: string;
  focus: readonly string[];
  outcome: string;
};

export function MentorSlider({
  mentors,
  profiles,
  copy,
}: {
  mentors: Mentor[];
  profiles: readonly MentorProfile[];
  copy: {
    bookMentor: string;
    expertiseLabel: string;
    focusLabel: string;
    scheduleLabel: string;
  };
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideIndexRef = useRef(mentors.length);
  const resetTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const loopedMentors = [...mentors, ...mentors, ...mentors];

  useEffect(() => {
    const baseIndex = mentors.length;
    const target = scrollerRef.current?.children[baseIndex] as HTMLElement | undefined;

    slideIndexRef.current = baseIndex;
    target?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
  }, [mentors.length]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  function getRealIndex(index: number) {
    return ((index % mentors.length) + mentors.length) % mentors.length;
  }

  function scrollToSlide(index: number, behavior: ScrollBehavior = "smooth") {
    const scroller = scrollerRef.current;
    const target = scroller?.children[index] as HTMLElement | undefined;

    if (!target || mentors.length === 0) {
      return;
    }

    target?.scrollIntoView({
      behavior,
      block: "nearest",
      inline: "start",
    });
    slideIndexRef.current = index;
    setActiveIndex(getRealIndex(index));
  }

  function normalizeLoopPosition(index: number) {
    if (mentors.length === 0) {
      return;
    }

    const baseIndex = mentors.length + getRealIndex(index);

    if (index < mentors.length || index >= mentors.length * 2) {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        scrollToSlide(baseIndex, "auto");
      }, 430);
    }
  }

  function moveBy(delta: number) {
    const nextIndex = slideIndexRef.current + delta;

    scrollToSlide(nextIndex);
    normalizeLoopPosition(nextIndex);
  }

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      const children = Array.from(scroller.children) as HTMLElement[];
      const scrollerLeft = scroller.getBoundingClientRect().left;
      const nearestIndex = children.reduce(
        (nearest, child, index) => {
          const distance = Math.abs(child.getBoundingClientRect().left - scrollerLeft);
          return distance < nearest.distance ? { distance, index } : nearest;
        },
        { distance: Number.POSITIVE_INFINITY, index: slideIndexRef.current },
      ).index;

      slideIndexRef.current = nearestIndex;
      setActiveIndex(getRealIndex(nearestIndex));
      normalizeLoopPosition(nearestIndex);
    }, 120);
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-heading uppercase text-primary">
          {String(activeIndex + 1).padStart(2, "0")} / {String(mentors.length).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Previous mentor"
            className="size-10 p-0"
            onClick={() => moveBy(-1)}
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            aria-label="Next mentor"
            className="size-10 p-0"
            onClick={() => moveBy(1)}
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      <div
        className="mt-4 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        ref={scrollerRef}
      >
        {loopedMentors.map((mentor, index) => {
          const realIndex = index % mentors.length;
          const profile = profiles[realIndex] ?? profiles[0];

          return (
            <Card
              className="dx-card h-full basis-[88%] shrink-0 snap-start overflow-hidden bg-card py-0 sm:basis-[calc((100%_-_1rem)/2)] lg:basis-[calc((100%_-_2rem)/3)]"
              key={`${mentor.name}-${index}`}
            >
              <div className="relative isolate h-28 bg-primary">
                <DotPattern className="text-background/20 [mask-image:linear-gradient(90deg,black,transparent_90%)]" />
                <Badge className="absolute right-4 top-4 border-background bg-background text-foreground" variant="outline">
                  {profile.experience}
                </Badge>
                <div className="absolute left-5 top-10 size-24 overflow-hidden rounded-base border-2 border-background bg-background shadow-shadow">
                  <Image
                    alt={mentor.name}
                    className="h-full w-full object-cover"
                    height={160}
                    src={mentor.avatarUrl}
                    width={160}
                  />
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-12">
                <div>
                  <h2 className="text-2xl font-heading uppercase leading-tight text-foreground">{mentor.name}</h2>
                  <p className="mt-1 text-sm font-black text-primary">{mentor.role}</p>
                </div>
                <p className="mt-4 min-h-[72px] line-clamp-3 text-sm font-bold leading-6 text-muted-foreground">
                  {profile.bio}
                </p>

                <div className="mt-4 min-h-[58px]">
                  <p className="text-xs font-heading uppercase text-muted-foreground">{copy.expertiseLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((item) => (
                      <Badge className="text-xs" key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 min-h-[88px]">
                  <p className="text-xs font-heading uppercase text-muted-foreground">{copy.focusLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.focus.slice(0, 3).map((item) => (
                      <Badge className="text-xs" key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="min-h-[78px] rounded-base border-2 border-border bg-secondary px-3 py-3">
                  <p className="text-xs font-heading uppercase text-muted-foreground">{copy.scheduleLabel}</p>
                  <p className="mt-1 text-sm font-black text-foreground">{mentor.schedule}</p>
                </div>

                <div className="mt-auto pt-4">
                  <p className="min-h-[48px] line-clamp-2 text-sm font-bold leading-6 text-foreground">
                    {profile.outcome}
                  </p>
                  <Button asChild className="mt-4 h-12 w-full justify-center text-center">
                    <Link href="/mentor-booking">{copy.bookMentor}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
