import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const posts = await getBlogPosts(locale);
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge>{post.category}</Badge>
          <Badge variant="outline">{post.readTime}</Badge>
          <Badge>{post.mentorName}</Badge>
          <Badge variant="secondary">{new Date(post.publishedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</Badge>
        </div>
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-6xl">
          {post.title}
        </h1>
        <div className="mt-5 rounded-base border-2 border-border bg-secondary-background p-4">
          <p className="text-sm font-black uppercase text-primary">Mentor viết bài</p>
          <p className="mt-1 text-lg font-heading text-foreground">{post.authorName}</p>
          {post.authorRole && <p className="text-sm text-muted-foreground">{post.authorRole}</p>}
          {post.sourceFileName && (
            <p className="mt-2 text-xs font-bold text-muted-foreground">Nguồn Markdown: {post.sourceFileName}</p>
          )}
        </div>
        <Card className="dx-card mt-8">
          <CardContent>
            <MarkdownViewer content={post.content.join("\n\n")} />
          </CardContent>
        </Card>
        <Button asChild className="mt-8" variant="outline">
          <Link href="/blog">{dict.blog.back}</Link>
        </Button>
      </article>
    </main>
  );
}
