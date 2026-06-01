"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export type GlobalSearchItem = {
  href: string;
  label: string;
  type: keyof Dictionary["search"]["types"];
  text: string;
};

export function GlobalSearch({
  className,
  copy,
  items,
}: {
  className?: string;
  copy: Dictionary["search"];
  items: GlobalSearchItem[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items.slice(0, 6);
    }

    return items
      .filter((item) => item.text.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className={cn("relative", className)}>
      <Input
        aria-label={copy.open}
        className="h-9 bg-background"
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={copy.globalPlaceholder}
        value={query}
      />
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(420px,calc(100vw-2rem))] rounded-base border-2 border-border bg-background p-2 shadow-shadow">
          {results.length ? (
            <div className="space-y-2">
              {results.map((item) => (
                <Link
                  className="block rounded-base border-2 border-transparent p-3 transition hover:border-border hover:bg-secondary"
                  href={item.href}
                  key={`${item.type}-${item.href}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="line-clamp-1 text-sm font-heading text-foreground">{item.label}</span>
                    <Badge variant="outline">{copy.types[item.type]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-3 text-sm font-heading text-muted-foreground">{copy.noResults}</p>
          )}
          <Link className="mt-2 block border-t-2 border-dashed border-border pt-2 text-sm font-heading text-primary" href="/courses">
            {copy.viewAllCourses}
          </Link>
        </div>
      )}
    </div>
  );
}
