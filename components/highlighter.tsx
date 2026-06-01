import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Highlighter({
  children,
  className,
  color = "var(--main)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn("magic-highlighter relative inline-block px-1", className)}
      style={{ "--highlight-color": color } as CSSProperties}
    >
      {children}
    </span>
  );
}
