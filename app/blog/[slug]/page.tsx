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
          <Badge variant="secondary">{new Date(post.publishedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</Badge>
        </div>
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-6xl">
          {post.title}
        </h1>
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
