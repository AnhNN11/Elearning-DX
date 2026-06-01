import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { ButtonLink, Logo } from "./ui";

export async function AppFooter() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const publicLinks = [
    { href: "/courses", label: dict.nav.courses },
    { href: "/blog", label: dict.nav.blog },
    { href: "/about", label: dict.nav.about },
    { href: "/interview-practice", label: dict.nav.interview },
  ];

  return (
    <footer className="border-t-2 border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Logo className="[&_*]:text-background" />
          <p className="mt-5 max-w-md text-sm leading-7 text-background/75">
            {dict.footer.description}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-main">
            {dict.footer.publicLinks}
          </h2>
          <nav className="mt-4 grid gap-3 text-sm font-black">
            {publicLinks.map((item) => (
              <Link className="text-background/80 transition hover:text-main" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-main">
            {dict.footer.support}
          </h2>
          <div className="mt-4 grid gap-3">
            <ButtonLink className="h-10 px-4 text-sm" href="/login">
              {dict.footer.startNow}
            </ButtonLink>
            <Link className="text-sm font-black text-background/80 transition hover:text-main" href="/mentor-booking">
              {dict.footer.mentorBooking}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-background/20 px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-background/60">
        © 2026 {dict.footer.copyright}
      </div>
    </footer>
  );
}
