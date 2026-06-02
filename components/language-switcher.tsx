"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  locale,
  tone = "dark",
}: {
  className?: string;
  locale: Locale;
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [visualLocale, setVisualLocale] = useOptimistic(locale);
  const isDark = tone === "dark";

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === visualLocale) {
      return;
    }

    startTransition(async () => {
      setVisualLocale(nextLocale);
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  }

  return (
    <div
      aria-label="Language"
      aria-busy={isPending}
      className={cn(
        "relative isolate grid h-12 w-32 grid-cols-2 rounded-base border-2 p-1 shadow-shadow transition-[background-color,border-color,box-shadow] duration-200",
        isDark ? "border-background/35 bg-background/10" : "border-border bg-secondary-background",
        className,
      )}
      role="group"
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-1 top-1 z-0 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-base border-2 border-border bg-main shadow-[2px_2px_0_0_var(--border)] transition-transform duration-200 ease-out will-change-transform transform-gpu",
          visualLocale === "en" && "translate-x-full",
        )}
      />
      {(["vi", "en"] as Locale[]).map((item) => (
        <button
          aria-pressed={visualLocale === item}
          className={cn(
            "relative z-10 grid h-full place-items-center rounded-[calc(var(--radius)-1px)] text-sm font-heading uppercase transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            visualLocale === item
              ? "text-main-foreground"
              : isDark
                ? "text-background/70 hover:text-background"
                : "text-muted-foreground hover:text-foreground",
          )}
          key={item}
          onClick={() => switchLocale(item)}
          type="button"
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
