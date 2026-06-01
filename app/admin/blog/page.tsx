import { AdminShell } from "@/components/admin-shell";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBlogPostAction } from "@/lib/actions";
import { getBlogPosts } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminBlogPage() {
  const locale = await getLocale();
  const posts = await getBlogPosts(locale);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Markdown content</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">Quản lý blog</h1>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Bài viết đã xuất bản</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {posts.map((post) => (
              <div className="rounded-base border-2 border-border p-4" key={post.slug}>
                <div className="flex flex-wrap gap-2">
                  <Badge>{post.category}</Badge>
                  <Badge variant="outline">{post.readTime}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-black text-foreground">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tạo / cập nhật bài Markdown</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBlogPostAction} className="space-y-3">
              <Input name="title" placeholder="Tiêu đề" required />
              <Input name="slug" placeholder="slug-bai-viet" required />
              <Input name="excerpt" placeholder="Mô tả ngắn" required />
              <Input name="category" placeholder="Engineering / Interview" required />
              <Input name="tags" placeholder="nextjs, supabase, interview" />
              <Input name="readTime" placeholder="6 phút" required />
              <select className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-bold" name="locale" defaultValue={locale}>
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
              <MarkdownEditor name="content" placeholder="Nội dung bài viết bằng Markdown" required />
              <label className="flex items-center gap-2 text-sm font-black">
                <input name="published" type="checkbox" defaultChecked />
                Published
              </label>
              <Button className="w-full" type="submit">Lưu bài viết</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
