import Link from "next/link";
import { GlobalSearch, type GlobalSearchItem } from "@/components/global-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getBlogPosts, getInterviewQuestions } from "@/lib/content";
import { getCourses } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { ButtonLink, Logo } from "./ui";

export async function AppHeader() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [courses, blogPosts, interviewQuestions] = await Promise.all([
    getCourses(),
    getBlogPosts(locale),
    getInterviewQuestions(locale),
  ]);
  const nav = [
    { href: "/courses", label: dict.nav.courses },
    { href: "/blog", label: dict.nav.blog },
    { href: "/about", label: dict.nav.about },
    { href: "/interview-practice", label: dict.nav.interview },
  ];
  const searchItems: GlobalSearchItem[] = [
    ...courses.map((course) => ({
      href: `/courses/${course.slug}`,
      label: course.title,
      text: `${course.title} ${course.description} ${course.category} ${course.level}`,
      type: "course" as const,
    })),
    ...blogPosts.map((post) => ({
      href: `/blog/${post.slug}`,
      label: post.title,
      text: `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")}`,
      type: "blog" as const,
    })),
    ...interviewQuestions.map((question) => ({
      href: "/interview-practice",
      label: question.question,
      text: `${question.question} ${question.category} ${question.level} ${question.prompt}`,
      type: "interview" as const,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-secondary-background text-foreground shadow-shadow">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <Logo />
        <nav className="hidden min-w-0 shrink-0 items-center gap-3 text-xs font-heading uppercase tracking-wide text-foreground xl:flex">
          {nav.map((item) => (
            <Link
              className="group relative whitespace-nowrap py-2 transition duration-200 hover:-translate-y-0.5 hover:text-primary"
              href={item.href}
              key={item.href}
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-1 origin-left scale-x-0 rounded-full bg-main transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <GlobalSearch className="hidden min-w-0 flex-1 md:block" copy={dict.search} items={searchItems} />
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={locale} tone="light" />
          <ButtonLink className="h-10 px-3 text-xs sm:px-5 sm:text-sm" href="/login">
            {dict.nav.start}
          </ButtonLink>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 md:hidden">
        <GlobalSearch copy={dict.search} items={searchItems} />
      </div>
    </header>
  );
}
