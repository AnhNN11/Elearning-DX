import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-16 w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-base text-foreground shadow-none outline-none ring-offset-background selection:bg-main selection:text-main-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
