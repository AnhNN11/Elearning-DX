import { createOrm, type BlogPost, type InterviewQuestion } from "./orm";
import { mapBlogPost } from "./orm/mappers";
import type { BlogPostRow } from "./orm/shared";
import { supabasePublishableKey, supabaseUrl } from "./supabase/config";
import type { LandingBlock } from "./types";

export type Mentor = {
  name: string;
  role: string;
  expertise: string[];
  schedule: string;
};

export type { BlogPost, InterviewQuestion };
export type { LandingBlock };

export const mentors: Mentor[] = [
  {
    name: "Anh Minh",
    role: "Senior Fullstack Engineer",
    expertise: ["Next.js", "System Design", "Supabase"],
    schedule: "Tối thứ 3 và thứ 5",
  },
  {
    name: "Chị Linh",
    role: "AI Product Lead",
    expertise: ["AI workflow", "Prompt design", "Portfolio review"],
    schedule: "Cuối tuần",
  },
  {
    name: "Anh Khoa",
    role: "DevOps Mentor",
    expertise: ["Cloud", "CI/CD", "Interview coaching"],
    schedule: "Trưa thứ 2-4",
  },
];

async function getBlogPostsFromRest(locale: "vi" | "en", includeDrafts = false) {
  if (!supabaseUrl || !supabasePublishableKey) {
    return [];
  }

  const url = new URL("/rest/v1/blog_posts", supabaseUrl);
  url.searchParams.set(
    "select",
    "slug,locale,title,excerpt,category,tags,read_time,published_at,author_name,author_role,mentor_name,source_file_name,cover_image_url,content_md",
  );
  url.searchParams.set("locale", `eq.${locale}`);
  url.searchParams.set("order", "published_at.desc");

  if (!includeDrafts) {
    url.searchParams.set("published", "eq.true");
  }

  let response = await fetch(url, {
    cache: "no-store",
    headers: {
      apikey: supabasePublishableKey,
      authorization: `Bearer ${supabasePublishableKey}`,
    },
  });

  if (!response.ok) {
    const legacyUrl = new URL(url);
    legacyUrl.searchParams.set("select", "slug,locale,title,excerpt,category,tags,read_time,published_at,content_md");
    response = await fetch(legacyUrl, {
      cache: "no-store",
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${supabasePublishableKey}`,
      },
    });

    if (!response.ok) {
      return [];
    }
  }

  const rows = (await response.json().catch(() => [])) as BlogPostRow[];
  return rows.map(mapBlogPost);
}

function sortBlogPosts(posts: BlogPost[]) {
  return [...posts].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

function mergeLocalizedBlogPosts(primary: BlogPost[], secondary: BlogPost[]) {
  const postsBySlug = new Map<string, BlogPost>();

  for (const post of primary) {
    postsBySlug.set(post.slug, post);
  }

  for (const post of secondary) {
    if (!postsBySlug.has(post.slug)) {
      postsBySlug.set(post.slug, post);
    }
  }

  return sortBlogPosts(Array.from(postsBySlug.values()));
}

async function getBlogPostsForLocale(
  locale: "vi" | "en",
  includeDrafts: boolean,
  orm: Awaited<ReturnType<typeof createOrm>>,
) {
  const posts = orm ? await orm.content.listBlogPosts(locale, includeDrafts) : [];

  if (posts.length) {
    return posts;
  }

  return getBlogPostsFromRest(locale, includeDrafts);
}

export async function getBlogPosts(locale: "vi" | "en", includeDrafts = false) {
  const fallbackLocale = locale === "vi" ? "en" : "vi";
  const orm = await createOrm();
  const [primaryPosts, secondaryPosts] = await Promise.all([
    getBlogPostsForLocale(locale, includeDrafts, orm),
    getBlogPostsForLocale(fallbackLocale, includeDrafts, orm),
  ]);

  if (includeDrafts) {
    return sortBlogPosts([...primaryPosts, ...secondaryPosts]);
  }

  return mergeLocalizedBlogPosts(primaryPosts, secondaryPosts);
}

export async function getLandingBlocks(locale: "vi" | "en", includeDrafts = false) {
  const orm = await createOrm();
  return orm ? orm.content.listLandingBlocks(locale, includeDrafts) : [];
}

export async function getInterviewQuestions(locale: "vi" | "en", includeDrafts = false) {
  const orm = await createOrm();
  return orm ? orm.content.listInterviewQuestions(locale, includeDrafts) : [];
}
