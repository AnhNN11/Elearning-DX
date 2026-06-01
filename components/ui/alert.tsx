import * as React from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const toneClasses: Record<AlertTone, string> = {
  info: "bg-secondary text-secondary-foreground",
  success: "bg-main text-main-foreground",
  warning: "bg-accent text-accent-foreground",
  danger: "bg-destructive text-white",
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

function Alert({
  className,
  tone = "info",
  ...props
}: React.ComponentProps<"div"> & {
  tone?: AlertTone;
}) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-base border-2 border-border p-4 text-sm leading-6 shadow-shadow",
        toneClasses[tone],
        className,
      )}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      {...props}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">{props.children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("font-heading text-foreground", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm text-foreground/75", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
