"use client";

import { useState, useTransition } from "react";
import { submitCodeAction } from "@/lib/actions";
import type { Assessment, CodeTestCase } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

type TestResult = CodeTestCase & {
  actual?: unknown;
  passed: boolean;
  error?: string;
};

const workerSource = `
self.onmessage = (event) => {
  const { code, functionName, testCases } = event.data;
  try {
    const fn = new Function(code + "\\nreturn " + functionName + ";")();
    if (typeof fn !== "function") {
      throw new Error("__MISSING_FUNCTION__:" + functionName);
    }
    const results = testCases.map((test) => {
      try {
        const actual = fn(...test.args);
        const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
        return { ...test, actual, passed };
      } catch (error) {
        return { ...test, passed: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
    self.postMessage({ ok: true, results });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
`;

export function CodeRunner({
  assessment,
  copy,
}: {
  assessment: Assessment;
  copy: Dictionary["assessment"];
}) {
  const exercise = assessment.exercise;
  const [code, setCode] = useState(exercise?.starterCode ?? "");
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!exercise) {
    return null;
  }

  const currentExercise = exercise;

  function runTests() {
    setError("");
    setResults([]);

    const blob = new Blob([workerSource], { type: "text/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    const timeout = window.setTimeout(() => {
      worker.terminate();
      setError(copy.timeout);
    }, 2000);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; results?: TestResult[]; error?: string }>) => {
      window.clearTimeout(timeout);
      worker.terminate();

      if (!event.data.ok) {
        setError(formatRunnerError(event.data.error, copy));
        return;
      }

      const nextResults = event.data.results ?? [];
      setResults(nextResults);
      const passed = nextResults.every((item) => item.passed);
      const formData = new FormData();
      formData.set("assessmentId", assessment.id);
      formData.set("score", passed ? "100" : "0");
      formData.set("passed", String(passed));
      formData.set("code", code);
      formData.set("results", JSON.stringify(nextResults));

      startTransition(() => {
        void submitCodeAction(formData);
      });
    };

    worker.postMessage({
      code,
      functionName: currentExercise.functionName,
      testCases: currentExercise.testCases,
    });
  }

  return (
    <Card className="border-foreground bg-foreground text-background">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-primary">{copy.codeRunner}</p>
          <CardTitle className="mt-1 text-xl font-black">{assessment.title}</CardTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-background/80">{currentExercise.prompt}</p>
        </div>
        <Badge className="bg-background/10 text-background hover:bg-background/20">JavaScript</Badge>
      </CardHeader>
      <CardContent>
        <Textarea
          className="mt-5 min-h-[220px] w-full border-background/10 bg-black/20 p-4 font-mono text-sm leading-6 text-background outline-none focus-visible:ring-primary"
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          value={code}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            className="bg-background text-primary hover:bg-secondary"
            disabled={isPending}
            onClick={runTests}
            type="button"
          >
            {isPending ? copy.saving : copy.runTests}
          </Button>
          <p className="text-sm text-background/80">{currentExercise.testCases.length} test case</p>
        </div>
        {error && <p className="mt-4 rounded-md bg-destructive/20 p-3 text-sm text-background">{error}</p>}
        {results.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-md border border-white/10">
            {results.map((item) => (
              <div
                className="grid gap-2 border-b border-white/10 p-3 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1fr_auto]"
                key={item.name}
              >
                <span className="font-bold">{item.name}</span>
                <span>{copy.expected}: {JSON.stringify(item.expected)}</span>
                <span>{copy.actual}: {JSON.stringify(item.actual)}</span>
                <span className={item.passed ? "text-emerald-300" : "text-rose-300"}>
                  {item.passed ? copy.pass : copy.fail}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRunnerError(error: string | undefined, copy: Dictionary["assessment"]) {
  if (!error) {
    return copy.runError;
  }

  if (error.startsWith("__MISSING_FUNCTION__:")) {
    return `${copy.missingFunction} ${error.replace("__MISSING_FUNCTION__:", "")}`;
  }

  return error;
}
