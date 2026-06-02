import { AdminShell } from "@/components/admin-shell";
import { AdminBlogComposer } from "@/components/admin-blog-composer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBlogPostAction } from "@/lib/actions";
import { getBlogPosts, mentors } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminBlogPage() {
  const locale = await getLocale();
  const posts = await getBlogPosts(locale, true);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-primary">Markdown content</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-foreground">Quản lý blog</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-muted-foreground">
            Soạn bài bằng Markdown, chèn link/ảnh nhanh và xem trước đúng layout người học sẽ đọc trên trang blog.
          </p>
        </div>
        <div className="rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-sm font-black shadow-shadow">
          {posts.length} bài trong 2 ngôn ngữ
        </div>
      </div>

      <div className="mt-8">
        <AdminBlogComposer action={createBlogPostAction} defaultLocale={locale} mentors={mentors} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-foreground">Bài viết đã xuất bản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={`${post.locale}-${post.slug}`}>
              {post.coverImageUrl && (
                <div className="relative mb-4 h-32 overflow-hidden rounded-base border-2 border-border bg-card">
                  <Image
                    alt={`${post.title} cover`}
                    className="h-full w-full object-cover"
                    height={220}
                    src={post.coverImageUrl}
                    width={520}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant={post.locale === locale ? "default" : "outline"}>{post.locale.toUpperCase()}</Badge>
                <Badge>{post.category}</Badge>
                <Badge variant="outline">{post.readTime}</Badge>
                <Badge variant="secondary">{post.mentorName}</Badge>
                {post.sourceFileName && <Badge variant="outline">.md: {post.sourceFileName}</Badge>}
              </div>
              <h2 className="mt-3 text-xl font-black text-foreground">{post.title}</h2>
              <p className="mt-1 text-xs font-black uppercase text-primary">
                {post.authorName}{post.authorRole ? ` · ${post.authorRole}` : ""}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
