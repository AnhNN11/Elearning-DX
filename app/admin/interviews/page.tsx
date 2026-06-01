import { AdminShell } from "@/components/admin-shell";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createInterviewQuestionAction } from "@/lib/actions";
import { getInterviewQuestions } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminInterviewsPage() {
  const locale = await getLocale();
  const questions = await getInterviewQuestions(locale, true);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-heading uppercase text-primary">Markdown question bank</p>
        <h1 className="mt-2 text-3xl font-heading text-foreground">Quản lý phỏng vấn</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Soạn câu hỏi và câu trả lời bằng Markdown. Prompt luyện tập và checklist sẽ tự lấy từ nội dung này nếu không cần tách riêng.
        </p>
      </div>

      <Alert className="mt-6" tone="info">
        <div>
          <AlertTitle>Form đã rút gọn</AlertTitle>
          <AlertDescription>
            Admin chỉ cần nhập category, level, câu hỏi Markdown và câu trả lời Markdown. Các trường role, skills, prompt, checklist
            được xử lý ngầm để không phải nhập trùng.
          </AlertDescription>
        </div>
      </Alert>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_460px]">
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
                <div className="mt-3 text-lg font-heading text-foreground">
                  <MarkdownViewer content={question.question} />
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-heading text-primary">Xem câu trả lời</summary>
                  <div className="mt-3 rounded-base border-2 border-border bg-secondary-background p-4">
                    <MarkdownViewer content={question.answer} />
                  </div>
                </details>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="category" placeholder="React / Next.js / Database" required />
                <Input name="level" placeholder="Cơ bản / Trung cấp / Nâng cao" required />
              </div>
              <select className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-bold" name="locale" defaultValue={locale}>
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
              <input name="role" type="hidden" value="" />
              <input name="skills" type="hidden" value="" />
              <MarkdownEditor name="question" placeholder="## Câu hỏi&#10;Mô tả tình huống hoặc yêu cầu phỏng vấn..." required />
              <MarkdownEditor name="answer" placeholder="## Câu trả lời mẫu&#10;- Ý chính 1&#10;- Ý chính 2" required />
              <label className="flex items-center gap-2 text-sm font-heading">
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
