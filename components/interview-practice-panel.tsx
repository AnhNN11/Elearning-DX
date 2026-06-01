"use client";

import { CheckCircle2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MarkdownViewer } from "@/components/markdown-viewer";
import type { InterviewQuestion } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const storageKey = "dolphinx-interview-practice";

type PracticeState = {
  completed: Record<string, boolean>;
};

function readStoredPractice(): PracticeState {
  if (typeof window === "undefined") {
    return { completed: {} };
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return { completed: {} };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PracticeState>;
    return {
      completed: parsed.completed ?? {},
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return { completed: {} };
  }
}

export function InterviewPracticePanel({
  copy,
  questions,
}: {
  copy: Dictionary["interview"];
  questions: InterviewQuestion[];
}) {
  const roleProfiles = copy.roleProfiles;
  const levels = useMemo(
    () => [
      { label: copy.all, value: "all" },
      ...Array.from(new Set(questions.map((question) => question.level))).map((item) => ({
        label: item,
        value: item,
      })),
    ],
    [copy.all, questions],
  );
  const allSkills = useMemo(
    () => Array.from(new Set(questions.map((question) => question.category))),
    [questions],
  );

  const [selectedRole, setSelectedRole] = useState<string>(roleProfiles[0]?.role ?? "");
  const currentRole = roleProfiles.find((item) => item.role === selectedRole) ?? roleProfiles[0];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => [...(currentRole?.skills ?? [])]);
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [practice, setPractice] = useState<PracticeState>(readStoredPractice);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(practice));
  }, [practice]);

  function chooseRole(role: string) {
    const profile = roleProfiles.find((item) => item.role === role);
    setSelectedRole(role);
    setSelectedSkills([...(profile?.skills ?? [])]);
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  }

  function toggleCompleted(questionId: string) {
    setPractice((current) => ({
      completed: {
        ...current.completed,
        [questionId]: !current.completed[questionId],
      },
    }));
  }

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSkill = !selectedSkills.length || selectedSkills.includes(question.category);
      const matchesLevel = level === "all" || question.level === level;
      const matchesQuery =
        !normalizedQuery ||
        [
          question.question,
          question.answer,
          question.category,
          question.level,
          question.prompt,
          question.checklist.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesSkill && matchesLevel && matchesQuery;
    });
  }, [level, query, questions, selectedSkills]);

  const completedCount = filteredQuestions.filter((question) => practice.completed[question.id]).length;
  const progressValue = filteredQuestions.length
    ? Math.round((completedCount / filteredQuestions.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="dx-card overflow-hidden bg-card">
        <div className="border-b-2 border-border bg-secondary p-6">
          <p className="text-sm font-black uppercase tracking-wide text-primary">{copy.plannerTitle}</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.plannerDescription}
          </p>
        </div>
        <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{copy.chooseRole}</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {roleProfiles.map((profile) => (
                  <button
                    className={`rounded-base border-2 p-4 text-left transition ${
                      selectedRole === profile.role
                        ? "border-primary bg-secondary shadow-shadow"
                        : "border-border bg-background hover:-translate-y-0.5 hover:shadow-shadow"
                    }`}
                    key={profile.role}
                    onClick={() => chooseRole(profile.role)}
                    type="button"
                  >
                    <p className="font-black text-foreground">{profile.role}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{profile.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{copy.requiredSkills}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <Button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    size="sm"
                    type="button"
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{copy.chooseLevel}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {levels.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => setLevel(item.value)}
                    size="sm"
                    type="button"
                    variant={level === item.value ? "default" : "outline"}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </section>
          </div>

          <div className="rounded-base border-2 border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              <Input
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                value={query}
              />
            </div>
            <div className="mt-5 rounded-base border-2 border-border bg-secondary p-4">
              <p className="text-sm font-black uppercase text-primary">{copy.selectedPlan}</p>
              <div className="mt-3 grid gap-3 text-sm">
                <p><span className="text-muted-foreground">{copy.roleLabel}:</span> {selectedRole}</p>
                <p><span className="text-muted-foreground">{copy.levelLabel}:</span> {levels.find((item) => item.value === level)?.label}</p>
                <p><span className="text-muted-foreground">{copy.skillsLabel}:</span> {selectedSkills.join(", ") || copy.all}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black text-primary">{filteredQuestions.length}</p>
                  <p className="text-xs font-black uppercase text-muted-foreground">
                    {copy.matchingQuestions}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-foreground">{progressValue}%</p>
                  <p className="text-xs font-bold text-muted-foreground">
                    {completedCount}/{filteredQuestions.length}
                  </p>
                </div>
              </div>
              <Progress className="mt-3" value={progressValue} />
              <p className="mt-3 text-xs font-bold leading-5 text-muted-foreground">{copy.progressNote}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!filteredQuestions.length ? (
        <Card className="dx-card border-dashed">
          <CardContent>
            <p className="font-black">{copy.noQuestions}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {filteredQuestions.map((question, index) => (
            <Card className="dx-card bg-card" key={question.id}>
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                    <Badge variant="secondary">{question.category}</Badge>
                    <Badge variant="outline">{question.level}</Badge>
                    {practice.completed[question.id] && <Badge>{copy.done}</Badge>}
                  </div>
                  <Button
                    onClick={() => toggleCompleted(question.id)}
                    size="sm"
                    type="button"
                    variant={practice.completed[question.id] ? "secondary" : "outline"}
                  >
                    <CheckCircle2 className="size-4" />
                    {practice.completed[question.id] ? copy.unmarkDone : copy.markDone}
                  </Button>
                </div>
                <div className="text-2xl font-black leading-tight md:text-3xl">
                  <MarkdownViewer content={question.question} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-base border-2 border-border bg-muted p-4">
                  <p className="text-sm font-black uppercase text-primary">{copy.practicePrompt}</p>
                  <MarkdownViewer className="mt-2 text-sm" content={question.prompt} />
                </div>
                <div className="rounded-base border-2 border-border bg-background p-4">
                  <p className="text-sm font-black uppercase text-primary">{copy.answerLabel}</p>
                  <MarkdownViewer className="mt-3 text-sm" content={question.answer} />
                  <p className="mt-5 text-xs font-black uppercase tracking-wide text-muted-foreground">
                    {copy.checklistLabel}
                  </p>
                  <div className="mt-3 rounded-base border-2 border-border bg-muted p-4">
                    <MarkdownViewer content={question.checklist.map((point) => `- ${point}`).join("\n")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
