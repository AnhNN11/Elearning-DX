import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CodeComparison } from "@/components/ui/code-comparison";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation as TerminalTypingAnimation,
} from "@/components/ui/terminal";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MagicCodingShowcase({ copy }: { copy: Dictionary["home"] }) {
  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="magic-grid absolute inset-0 opacity-100" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-heading uppercase tracking-wide text-primary">{copy.codingLabEyebrow}</p>
          <h2 className="mt-2 text-4xl font-heading uppercase tracking-tight text-foreground sm:text-5xl">
            {copy.codingLabTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.codingLabDescription}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Terminal
            className="magic-terminal-shell magic-terminal-body max-h-none max-w-none border-2 border-border bg-foreground text-background shadow-shadow"
            loop
            loopDelay={1300}
          >
            <AnimatedSpan className="text-xs font-black uppercase tracking-[0.22em] text-background/45">
              {copy.terminalTitle}
            </AnimatedSpan>
            <TerminalTypingAnimation className="text-main" duration={34}>
              {copy.terminalLines[0]}
            </TerminalTypingAnimation>
            {copy.terminalLines.slice(1).map((line) => (
              <AnimatedSpan
                className="flex min-w-0 items-center gap-2 rounded-base border border-background/15 bg-background/5 px-3 py-2 text-background/85"
                key={line}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-main/50 text-[10px] text-main">
                  OK
                </span>
                <span className="truncate">{line.replace(/^OK\s*/, "")}</span>
              </AnimatedSpan>
            ))}
            <AnimatedSpan className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase text-background/65">
              <span className="rounded-base border border-background/15 bg-background/5 p-2">tests</span>
              <span className="rounded-base border border-background/15 bg-background/5 p-2">sync</span>
              <span className="rounded-base border border-background/15 bg-background/5 p-2">save</span>
            </AnimatedSpan>
          </Terminal>

          <CodeComparison
            afterCode={copy.afterCode}
            afterLabel={copy.afterLabel}
            beforeCode={copy.beforeCode}
            beforeLabel={copy.beforeLabel}
            filename="progress.ts"
            title={copy.comparisonTitle}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.bentoItems.map(([title, description], index) => (
            <Card className="group min-h-72 overflow-hidden bg-card transition hover:-translate-y-1" key={title}>
              <CardContent className="flex h-full flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  <span className="font-mono text-xs font-black text-primary">{"{ }"}</span>
                </div>
                <h3 className="text-xl font-heading text-foreground">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                <div className="mt-8 h-2 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background">
                  <div
                    className="h-full bg-main transition-all duration-300 group-hover:w-full"
                    style={{ width: `${64 + index * 6}%` }}
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
