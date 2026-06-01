import { cn } from "@/lib/utils";

export function DotPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern
          height="24"
          id="dolphinx-dot-pattern"
          patternUnits="userSpaceOnUse"
          width="24"
          x="0"
          y="0"
        >
          <circle cx="2" cy="2" fill="currentColor" r="1.35" />
        </pattern>
      </defs>
      <rect fill="url(#dolphinx-dot-pattern)" height="100%" width="100%" />
    </svg>
  );
}
