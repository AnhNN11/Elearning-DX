"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, FileText, FolderOpen, LayoutDashboard, Search, Sparkles, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminSearchItem = {
  href: string;
  label: string;
  description?: string;
  group: "Điều hướng" | "Khóa học" | "Lesson" | "Nội dung" | "Thao tác";
  keywords: string;
};

const groupIcons = {
  "Điều hướng": LayoutDashboard,
  "Khóa học": FolderOpen,
  Lesson: BookOpen,
  "Nội dung": FileText,
  "Thao tác": UploadCloud,
};

const groupOrder: AdminSearchItem["group"][] = ["Thao tác", "Khóa học", "Lesson", "Nội dung", "Điều hướng"];

export function AdminCommandSearch({
  className,
  items,
}: {
  className?: string;
  items: AdminSearchItem[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();

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
    const filtered = normalizedQuery
      ? items.filter((item) => `${item.label} ${item.description ?? ""} ${item.keywords}`.toLowerCase().includes(normalizedQuery))
      : items;

    return filtered.slice(0, 14);
  }, [items, normalizedQuery]);

  const groupedResults = groupOrder
    .map((group) => ({
      group,
      items: results.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Tìm nhanh trong admin"
          className="h-11 rounded-base bg-background pl-9 pr-20 shadow-shadow"
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search admin, courses, lessons..."
          ref={inputRef}
          value={query}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-base border-2 border-border bg-secondary-background px-2 py-0.5 text-[10px] font-heading text-muted-foreground sm:inline">
          Ctrl K
        </span>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-base border-2 border-border bg-background shadow-shadow">
          <div className="flex items-center justify-between border-b-2 border-border bg-secondary px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-heading uppercase text-foreground">
              <Sparkles className="size-4" />
              Command search
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
            {groupedResults.length ? (
              groupedResults.map(({ group, items: groupItems }) => {
                const Icon = groupIcons[group];

                return (
                  <div className="pb-2" key={group}>
                    <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-heading uppercase text-muted-foreground">
                      <Icon className="size-3.5" />
                      {group}
                    </div>
                    <div className="space-y-1">
                      {groupItems.map((item) => (
                        <Link
                          className="block rounded-base border-2 border-transparent p-3 transition hover:border-border hover:bg-secondary"
                          href={item.href}
                          key={`${item.group}-${item.href}-${item.label}`}
                          onClick={() => setOpen(false)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-sm font-heading text-foreground">{item.label}</p>
                              {item.description && (
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <Badge className="shrink-0" variant="outline">
                              {group}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-5 text-sm font-heading text-muted-foreground">
                Không tìm thấy kết quả. Thử tên khóa học, lesson, blog hoặc thao tác upload.
              </div>
            )}
          </div>
          <div className="grid gap-2 border-t-2 border-border bg-secondary-background p-2 sm:grid-cols-3">
            <Link className="rounded-base border-2 border-border bg-background p-2 text-xs font-heading hover:bg-secondary" href="/admin/courses">
              Quản lý khóa học
            </Link>
            <Link className="rounded-base border-2 border-border bg-background p-2 text-xs font-heading hover:bg-secondary" href="/admin/blog">
              Tạo blog
            </Link>
            <Link className="rounded-base border-2 border-border bg-background p-2 text-xs font-heading hover:bg-secondary" href="/admin/bookings">
              Xử lý booking
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
