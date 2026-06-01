import { AdminShell } from "@/components/admin-shell";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createInterviewQuestionAction } from "@/lib/actions";
import { getInterviewQuestions } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminInterviewsPage() {
  const locale = await getLocale();
  const questions = await getInterviewQuestions(locale);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Markdown question bank</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">Quản lý phỏng vấn</h1>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Câu hỏi đang hiển thị</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {questions.map((question) => (
              <div className="rounded-base border-2 border-border p-4" key={question.id}>
                <div className="flex flex-wrap gap-2">
                  <Badge>{question.category}</Badge>
                  <Badge variant="outline">{question.level}</Badge>
                </div>
                <h2 className="mt-3 text-lg font-black text-foreground">{question.question}</h2>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tạo câu hỏi Markdown</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createInterviewQuestionAction} className="space-y-3">
              <Input name="category" placeholder="React / Next.js / Database" required />
              <Input name="level" placeholder="Cơ bản / Trung cấp / Nâng cao" required />
              <Input name="role" placeholder="Frontend React Developer" />
              <Input name="skills" placeholder="React, Next.js, Security" />
              <Input name="question" placeholder="Câu hỏi phỏng vấn" required />
              <select className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-bold" name="locale" defaultValue={locale}>
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
              <MarkdownEditor name="prompt" placeholder="Prompt luyện tập bằng Markdown" required />
              <MarkdownEditor name="answer" placeholder="Câu trả lời mẫu bằng Markdown" required />
              <MarkdownEditor name="checklist" placeholder="- Ý chính 1&#10;- Ý chính 2" required />
              <label className="flex items-center gap-2 text-sm font-black">
                <input name="published" type="checkbox" defaultChecked />
                Published
              </label>
              <Button className="w-full" type="submit">Lưu câu hỏi</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
