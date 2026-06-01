"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "./ui/button";

export function LanguageSwitcher({
  locale,
  tone = "dark",
}: {
  locale: Locale;
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDark = tone === "dark";

  function switchLocale(nextLocale: Locale) {
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  }

  return (
    <div className={`flex rounded-md border p-1 ${isDark ? "border-background/30" : "border-input"}`}>
      {(["vi", "en"] as Locale[]).map((item) => (
        <Button
          className={`h-7 px-2 text-xs ${
            locale === item
              ? ""
              : isDark
                ? "text-background hover:bg-background/10 hover:text-background"
                : "text-foreground hover:bg-accent"
          }`}
          disabled={isPending || locale === item}
          key={item}
          onClick={() => switchLocale(item)}
          size="sm"
          type="button"
          variant={locale === item ? "secondary" : "ghost"}
        >
          {item.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
