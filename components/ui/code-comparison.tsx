import { cn } from "@/lib/utils";

interface CodeComparisonProps {
  afterCode: string;
  afterLabel: string;
  beforeCode: string;
  beforeLabel: string;
  filename: string;
  title: string;
}

const keywordTokens = new Set(["function", "return", "if"]);
const functionTokens = new Set(["progress", "Math", "round"]);
const parameterTokens = new Set(["done", "total"]);
const operatorTokens = new Set(["===", "==", "!==", "!=", "=>", "=", "/", "*", "+"]);
const punctuationTokens = new Set(["{", "}", "(", ")", ",", "."]);

export function CodeComparison({
  afterCode,
  afterLabel,
  beforeCode,
  beforeLabel,
  filename,
  title,
}: CodeComparisonProps) {
  return (
    <section className="h-full min-w-0 rounded-base border-2 border-border bg-secondary p-4 text-foreground shadow-shadow sm:p-5">
      <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-base border-2 border-border bg-background px-4 py-3 shadow-[4px_4px_0_0_var(--foreground)]">
        <h3 className="min-w-0 text-xl font-heading leading-tight tracking-tight sm:text-2xl">
          {title}
        </h3>
        <span className="rounded-base border-2 border-border bg-secondary px-3 py-1 font-mono text-xs font-black">
          {filename}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-4">
        <CodePane code={beforeCode} label={beforeLabel} tone="before" />
        <CodePane code={afterCode} label={afterLabel} tone="after" />
      </div>
    </section>
  );
}

function CodePane({
  code,
  label,
  tone,
}: {
  code: string;
  label: string;
  tone: "before" | "after";
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-base border-2 border-border bg-foreground shadow-[6px_6px_0_0_var(--foreground)]">
      <div className="flex items-center justify-between border-b-2 border-border bg-background px-4 py-2.5">
        <span className="text-sm font-heading uppercase text-foreground">{label}</span>
        <span
          className={cn(
            "font-heading text-sm",
            tone === "before" ? "text-destructive" : "text-primary",
          )}
        >
          {tone === "before" ? "- bug" : "+ guard"}
        </span>
      </div>

      <pre
        className="max-h-48 min-h-36 overflow-y-auto overflow-x-hidden bg-foreground px-4 py-4 font-mono text-[12px] leading-6 text-background sm:text-[13px] xl:max-h-56"
        style={{ fontFeatureSettings: '"liga" 0, "calt" 0', fontVariantLigatures: "none" }}
      >
        <code className="block max-w-full">{renderCodeLines(code)}</code>
      </pre>

      <div className="border-t-2 border-border bg-background px-2 py-2" />
    </div>
  );
}

function renderCodeLines(code: string) {
  return code.split("\n").map((line, index) => (
    <span className="block whitespace-pre-wrap break-words" key={`${line}-${index}`}>
      {line ? renderTokens(line) : "\u00a0"}
    </span>
  ));
}

function renderTokens(line: string) {
  return line
    .split(/(\s+|===|!==|==|!=|=>|\bfunction\b|\breturn\b|\bif\b|\bMath\b|\bround\b|\bprogress\b|\bdone\b|\btotal\b|\d+|[{}()/=*+,.])/g)
    .filter((token) => token.length > 0)
    .map((token, index) => (
      <span className={tokenClassName(token)} key={`${token}-${index}`}>
        {token}
      </span>
    ));
}

function tokenClassName(token: string) {
  if (/^\s+$/.test(token)) {
    return undefined;
  }

  if (keywordTokens.has(token)) {
    return "text-main";
  }

  if (functionTokens.has(token)) {
    return token === "progress" ? "text-cyan-200" : "text-yellow-300";
  }

  if (parameterTokens.has(token)) {
    return "text-sky-300";
  }

  if (/^\d+$/.test(token)) {
    return "text-pink-300";
  }

  if (operatorTokens.has(token)) {
    return "text-background/70";
  }

  if (punctuationTokens.has(token)) {
    return "text-background/55";
  }

  return "text-background";
}
