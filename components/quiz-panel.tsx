"use client";

import { useMemo, useState, useTransition } from "react";
import { submitQuizAction } from "@/lib/actions";
import type { Assessment } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function QuizPanel({
  assessment,
  copy,
}: {
  assessment: Assessment;
  copy: Dictionary["assessment"];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const questions = useMemo(() => assessment.questions ?? [], [assessment.questions]);

  const result = useMemo(() => {
    if (!questions.length) {
      return { score: 0, passed: false };
    }

    const correct = questions.filter((question) => answers[question.id] === question.correctIndex).length;
    const nextScore = Math.round((correct / questions.length) * 100);
    return { score: nextScore, passed: nextScore >= assessment.passingScore };
  }, [answers, assessment.passingScore, questions]);

  function submit() {
    setScore(result.score);
    const formData = new FormData();
    formData.set("assessmentId", assessment.id);
    formData.set("score", String(result.score));
    formData.set("passed", String(result.passed));

    startTransition(() => {
      void submitQuizAction(formData);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-primary">{copy.quiz}</p>
          <CardTitle className="mt-1 text-xl font-black">{assessment.title}</CardTitle>
        </div>
        <Badge variant="secondary">{copy.passScore} {assessment.passingScore}%</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {questions.map((question) => (
          <fieldset key={question.id}>
            <legend className="font-bold text-foreground">{question.prompt}</legend>
            <div className="mt-3 grid gap-2">
              {question.options.map((option, index) => (
                <label
                  className="bg-background flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium"
                  key={option}
                >
                  <input
                    checked={answers[question.id] === index}
                    name={question.id}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
                    type="radio"
                  />
                  {option}
                </label>
              ))}
            </div>
            {score !== null && (
              <p className="text-muted-foreground mt-2 text-sm">
                {answers[question.id] === question.correctIndex ? copy.correct : copy.incorrect}{" "}
                {question.explanation}
              </p>
            )}
          </fieldset>
        ))}
        <Button
          className="mt-5"
          disabled={questions.some((question) => answers[question.id] === undefined) || isPending}
          onClick={submit}
          type="button"
        >
          {isPending ? copy.saving : copy.submit}
        </Button>
        {score !== null && (
          <p className="mt-3 text-sm font-bold text-foreground">
            {copy.score}: {score}% - {result.passed ? copy.passed : copy.failed}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
