import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MagicCodingShowcase({ copy }: { copy: Dictionary["home"] }) {
  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="magic-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-heading uppercase tracking-wide text-primary">{copy.codingLabEyebrow}</p>
          <h2 className="mt-2 text-4xl font-heading uppercase tracking-tight text-foreground sm:text-5xl">
            {copy.codingLabTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.codingLabDescription}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="magic-terminal-shell overflow-hidden bg-foreground p-0 text-background">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-4 border-b-2 border-border bg-background px-4 py-3 text-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full border-2 border-border bg-destructive" />
                  <span className="size-3 rounded-full border-2 border-border bg-main" />
                  <span className="size-3 rounded-full border-2 border-border bg-secondary" />
                  <span className="ml-2 hidden font-mono text-xs font-black text-muted-foreground sm:inline">
                    ~/dolphinx/lesson
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="magic-terminal-status-dot size-2 rounded-full bg-main" />
                  <Badge variant="outline">{copy.terminalTitle}</Badge>
                </div>
              </div>
              <div className="magic-terminal-body relative p-5 font-mono text-sm leading-6">
                <div className="relative z-10 rounded-base border border-background/15 bg-background/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-background/45">
                    running pipeline
                  </p>
                  <div className="mt-3 flex min-w-0 items-center gap-2 text-main">
                    <span className="shrink-0 text-background/55">$</span>
                    <span
                      className="magic-terminal-command min-w-0"
                      style={{ "--delay": "120ms" } as CSSProperties}
                    >
                      {copy.terminalLines[0].replace(/^\$\s*/, "")}
                    </span>
                  </div>
                  <div className="magic-terminal-progress mt-4 h-2 overflow-hidden rounded-full border border-background/20 bg-background/10">
                    <span />
                  </div>
                </div>
                <div className="relative z-10 mt-5 space-y-2">
                  {copy.terminalLines.slice(1).map((line, index) => (
                    <div
                      className="magic-terminal-line flex items-center justify-between gap-3 rounded-base border border-background/15 bg-background/5 px-3 py-2"
                      key={line}
                      style={{ "--delay": `${900 + index * 210}ms` } as CSSProperties}
                    >
                      <span className="flex min-w-0 items-center gap-2 truncate text-background/85">
                        <span className="magic-terminal-check grid size-5 shrink-0 place-items-center rounded-full border border-main/50 text-[10px] text-main">
                          ✓
                        </span>
                        <span className="truncate">{line}</span>
                      </span>
                      <span className="magic-terminal-spinner size-3 shrink-0 rounded-full border-2 border-background/25 border-t-main" />
                    </div>
                  ))}
                </div>
                <div className="magic-terminal-metrics relative z-10 mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase text-background/65">
                  <span>tests</span>
                  <span>sync</span>
                  <span>save</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary">
            <CardContent>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-heading text-foreground">{copy.comparisonTitle}</h3>
                <Badge variant="outline">progress.ts</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <CodePanel code={copy.beforeCode} label={copy.beforeLabel} tone="before" />
                <CodePanel code={copy.afterCode} label={copy.afterLabel} tone="after" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.bentoItems.map(([title, description], index) => (
            <Card className="group min-h-44 overflow-hidden bg-card transition hover:-translate-y-1" key={title}>
              <CardContent>
                <div className="mb-5 flex items-center justify-between">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  <span className="font-mono text-xs font-black text-primary">{"{ }"}</span>
                </div>
                <h3 className="text-xl font-heading text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                <div className="mt-5 h-2 rounded-base border-2 border-border bg-secondary-background">
                  <div
                    className="h-full bg-main transition-all group-hover:w-full"
                    style={{ width: `${45 + index * 12}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodePanel({
  code,
  label,
  tone,
}: {
  code: string;
  label: string;
  tone: "before" | "after";
}) {
  return (
    <div className="overflow-hidden rounded-base border-2 border-border bg-foreground text-background shadow-shadow">
      <div className="flex items-center justify-between border-b-2 border-border bg-background px-3 py-2 text-foreground">
        <span className="text-xs font-heading uppercase">{label}</span>
        <span className={tone === "before" ? "text-xs font-heading text-destructive" : "text-xs font-heading text-primary"}>
          {tone === "before" ? "- bug" : "+ guard"}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}
