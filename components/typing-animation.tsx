"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function TypingAnimation({
  className,
  pause = 1200,
  speed = 62,
  words,
}: {
  className?: string;
  pause?: number;
  speed?: number;
  words: string[];
}) {
  const items = useMemo(() => words.filter(Boolean), [words]);
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [display, setDisplay] = useState(() => items[0] ?? "");

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const current = items[index % items.length];
    let timeout: number;

    if (!isDeleting && display === current) {
      timeout = window.setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && display === "") {
      timeout = window.setTimeout(() => {
        setIsDeleting(false);
        setIndex((value) => (value + 1) % items.length);
      }, 220);
    } else {
      timeout = window.setTimeout(
        () => {
          const nextLength = isDeleting ? display.length - 1 : display.length + 1;
          setDisplay(current.slice(0, nextLength));
        },
        isDeleting ? Math.max(24, speed / 2) : speed,
      );
    }

    return () => window.clearTimeout(timeout);
  }, [display, index, isDeleting, items, pause, speed]);

  return (
    <span className={cn("inline-flex min-w-[8ch] items-baseline whitespace-nowrap", className)}>
      <span>{display || "\u00a0"}</span>
      <span aria-hidden className="magic-typing-caret ml-1 inline-block h-[0.82em] w-[0.08em] bg-current" />
    </span>
  );
}
