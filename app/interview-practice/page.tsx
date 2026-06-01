import { AppHeader } from "@/components/app-header";
import { InterviewPracticePanel } from "@/components/interview-practice-panel";
import { SectionHeader } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { getInterviewQuestions } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function InterviewPracticePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const questions = await getInterviewQuestions(locale);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="dx-dot-grid border-b-2 border-foreground bg-primary py-14 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-200">{dict.interview.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black uppercase leading-none tracking-tight">
            {dict.interview.title}
          </h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[340px_1fr]">
        <div>
          <SectionHeader
            description={dict.interview.sectionDescription}
            eyebrow={dict.interview.sectionEyebrow}
            title={dict.interview.sectionTitle}
          />
          <Card className="dx-card mt-8">
            <CardContent>
              <p className="text-4xl font-black text-primary">{questions.length}</p>
              <p className="text-muted-foreground mt-2 text-sm font-bold uppercase">{dict.interview.keyQuestions}</p>
            </CardContent>
          </Card>
        </div>
        <InterviewPracticePanel copy={dict.interview} questions={questions} />
      </section>
    </main>
  );
}
