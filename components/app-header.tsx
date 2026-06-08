import { GlobalSearch } from "@/components/global-search";
import { HeaderNav, type HeaderNavItem } from "@/components/header-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileHeaderMenu } from "@/components/mobile-header-menu";
import { getCurrentProfileForRequest } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { ButtonLink, Logo } from "./ui";

export async function AppHeader() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await getCurrentProfileForRequest();
  const startHref = profile ? "/profile" : "/login";
  const startLabel = profile ? (locale === "vi" ? "Hồ sơ" : "Profile") : dict.nav.start;
  const nav: HeaderNavItem[] = [
    { href: "/courses", label: dict.nav.courses },
    { href: "/blog", label: dict.nav.blog },
    { href: "/about", label: dict.nav.about },
    { href: "/interview-practice", label: dict.nav.interview },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-secondary-background text-foreground shadow-shadow">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-3 py-2 sm:px-4 lg:gap-3 lg:px-6 xl:min-h-20 xl:gap-5 xl:py-3">
        <Logo className="shrink-0" />
        <HeaderNav items={nav} />
        <GlobalSearch className="hidden min-w-0 flex-1 lg:block xl:max-w-xl" copy={dict.search} endpoint="/api/search-index" />
        <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex xl:gap-3">
          <LanguageSwitcher className="h-10 w-28 xl:h-12 xl:w-32" locale={locale} tone="light" />
          <ButtonLink className="h-10 px-3 text-xs xl:h-12 xl:px-6 xl:text-sm" href={startHref}>
            {startLabel}
          </ButtonLink>
        </div>
        <MobileHeaderMenu
          className="ml-auto sm:ml-0"
          locale={locale}
          navItems={nav}
          searchCopy={dict.search}
          searchEndpoint="/api/search-index"
          startHref={startHref}
          startLabel={startLabel}
        />
      </div>
    </header>
  );
}
