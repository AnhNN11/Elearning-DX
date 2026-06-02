"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={copy.open}
          className="h-12 bg-background pl-11 pr-20 text-base shadow-shadow"
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={copy.globalPlaceholder}
          ref={inputRef}
          value={query}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-base border-2 border-border bg-secondary-background px-2.5 py-1 text-[10px] font-heading text-muted-foreground sm:inline">
          Ctrl K
        </span>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-base border-2 border-border bg-background shadow-shadow">
          <div className="flex items-center justify-between border-b-2 border-border bg-secondary px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-heading uppercase text-foreground">
              <Sparkles className="size-4" />
              {copy.open}
            </div>
            {query && (
              <Button
                aria-label="Xóa tìm kiếm"
                className="size-7 border-transparent bg-transparent p-0 shadow-none hover:translate-x-0 hover:translate-y-0"
                onClick={() => setQuery("")}
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <div className="max-h-[min(28rem,calc(100vh-7rem))] overflow-y-auto p-2">
            {results.length ? (
              <div className="space-y-1">
                {results.map((item, index) => (
                  <Link
                    className="block rounded-base border-2 border-transparent p-3 transition hover:border-border hover:bg-secondary"
                    href={item.href}
                    key={`${item.type}-${item.href}-${item.label}-${index}`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="line-clamp-2 text-sm font-heading text-foreground">{item.label}</span>
                      <Badge className="shrink-0" variant="outline">{copy.types[item.type]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-3 text-sm font-heading text-muted-foreground">{copy.noResults}</p>
            )}
          </div>
          <Link
            className="block border-t-2 border-dashed border-border bg-secondary-background px-4 py-3 text-sm font-heading text-primary"
            href="/courses"
            onClick={() => setOpen(false)}
          >
            {copy.viewAllCourses}
          </Link>
        </div>
      )}
    </div>
  );
}
