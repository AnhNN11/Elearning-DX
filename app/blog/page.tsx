import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BlogExplorer } from "@/components/blog-explorer";
import { DotPattern } from "@/components/dot-pattern";
import { SectionHeader } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function BlogPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const posts = await getBlogPosts(locale);
  const featuredPost = posts[0];
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate overflow-hidden border-b-2 border-foreground bg-foreground py-14 text-background">
        <DotPattern className="text-main/35 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-main">{dict.blog.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
            {dict.blog.title}
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {featuredPost && (
          <article className="mb-12 grid overflow-hidden rounded-base border-2 border-foreground bg-card text-card-foreground shadow-shadow lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative isolate min-h-64 overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
              <DotPattern className="text-background/22 [mask-image:radial-gradient(circle_at_45%_35%,black,transparent_72%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-background text-foreground">{dict.blog.featuredLabel}</Badge>
                  <Badge className="border-background bg-primary text-background" variant="outline">
                    {featuredPost.category}
                  </Badge>
                </div>
                <div className="rounded-base border-2 border-background/80 bg-foreground/35 p-4 font-mono text-sm leading-7">
                  <p>const article = await learn({`{`}</p>
                  <p className="pl-4 text-main">{`topic: "${featuredPost.tags[0]}",`}</p>
                  <p className="pl-4 text-accent">{`format: "markdown + practice"`}</p>
                  <p>{`});`}</p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{featuredPost.readTime}</Badge>
                <Badge>{featuredPost.mentorName}</Badge>
                <Badge variant="outline">
                  {new Date(featuredPost.publishedAt).toLocaleDateString(dateLocale)}
                </Badge>
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                {featuredPost.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                {featuredPost.excerpt}
              </p>
              <p className="mt-4 text-sm font-black uppercase text-primary">
                {featuredPost.authorName}{featuredPost.authorRole ? ` · ${featuredPost.authorRole}` : ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline">#{tag}</Badge>
                ))}
              </div>
              <Button asChild className="mt-8">
                <Link href={`/blog/${featuredPost.slug}`}>{dict.blog.readMore}</Link>
              </Button>
            </div>
          </article>
        )}
        <SectionHeader
          description={dict.blog.sectionDescription}
          eyebrow={dict.blog.sectionEyebrow}
          title={dict.blog.sectionTitle}
        />
        <div className="mt-8">
          <BlogExplorer copy={dict.blog} posts={posts} />
        </div>
      </section>
    </main>
  );
}
