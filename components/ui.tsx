import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-11 w-11 shrink-0 translate-y-0.5 items-center justify-center overflow-visible sm:h-12 sm:w-12", className)}>
      <Image
        alt=""
        aria-hidden
        className="h-full w-full object-contain"
        height={746}
        src="/brand/dolphinx-fish-mark.png"
        width={649}
      />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link className={cn("flex min-w-0 items-center gap-2 text-primary", className)} href="/">
      <LogoMark />
      <span className="hidden whitespace-nowrap text-xl font-heading tracking-tight sm:inline">DolphinX Learn</span>
      <span className="whitespace-nowrap text-lg font-heading leading-none tracking-tight sm:hidden">DX Learn</span>
    </Link>
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Button
      asChild
      className={className}
      size="lg"
      style={{ color: variant === "primary" ? "var(--main-foreground)" : "var(--foreground)" }}
      variant={variant === "primary" ? "default" : "outline"}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return <Badge variant="secondary">{children}</Badge>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-sm font-heading uppercase tracking-wide text-primary">{eyebrow}</p>}
      <h1 className="mt-2 text-3xl font-heading tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>
      {description && <p className="text-muted-foreground mt-4 text-base leading-7">{description}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm font-heading">{label}</p>
        <p className="mt-2 text-3xl font-heading text-primary">{value}</p>
        {note && <p className="text-muted-foreground mt-1 text-xs font-medium">{note}</p>}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-0 text-center">
        <p className="text-lg font-black text-foreground">{title}</p>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

export function PageShell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6", className)}>{children}</div>;
}
