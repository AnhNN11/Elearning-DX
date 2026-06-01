"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BlogExplorer({
  copy,
  posts,
}: {
  copy: Dictionary["blog"];
  posts: BlogPost[];
}) {
  const categories = useMemo(
    () => [
      { label: copy.all, value: "all" },
      ...Array.from(new Set(posts.map((post) => post.category))).map((item) => ({
        label: item,
        value: item,
      })),
    ],
    [copy.all, posts],
  );
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesCategory = category === "all" || post.category === category;
    const matchesQuery =
      !normalizedQuery ||
      [post.title, post.excerpt, post.category, ...post.tags].join(" ").toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <Card className="dx-card bg-secondary">
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            value={query}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Button
                key={item.value}
                onClick={() => setCategory(item.value)}
                size="sm"
                type="button"
                variant={category === item.value ? "default" : "outline"}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <Card className="dx-card group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-md" key={post.slug}>
            <div className="h-2 bg-primary transition group-hover:bg-destructive" />
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge>{post.category}</Badge>
                <Badge variant="outline">{post.readTime}</Badge>
                <Badge variant="secondary">{post.publishedAt}</Badge>
              </div>
              <CardTitle className="text-2xl font-black leading-tight">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">#{tag}</Badge>
                ))}
              </div>
              <Link className="mt-5 inline-flex text-sm font-black text-primary" href={`/blog/${post.slug}`}>
                {copy.readMore}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredPosts.length && (
        <Card className="dx-card border-dashed">
          <CardContent>
            <p className="font-black">{copy.noResults}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
