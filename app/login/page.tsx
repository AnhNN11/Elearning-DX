import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-4 py-12 sm:px-6">
        <DotPattern className="text-primary/14 [mask-image:radial-gradient(circle_at_50%_35%,black,transparent_72%)]" />
        <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-base border-2 border-border bg-card shadow-shadow lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative isolate hidden min-h-[560px] overflow-hidden bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
            <DotPattern className="text-background/18 [mask-image:radial-gradient(circle_at_40%_25%,black,transparent_72%)]" />
            <div className="relative z-10">
              <Badge className="border-background bg-background text-foreground" variant="outline">
                {dict.auth.eyebrow}
              </Badge>
              <h1 className="mt-6 text-5xl font-black uppercase leading-none tracking-tight">
                {dict.auth.title}
              </h1>
              <p className="mt-5 text-base leading-8 text-primary-foreground/90">
                {dict.auth.description}
              </p>
            </div>
            <div className="relative z-10 grid gap-3">
              {[dict.courses.dashboardTitle, dict.courses.certificates, dict.profile.accountTitle].map((item) => (
                <div className="rounded-base border-2 border-background/80 bg-background/10 p-4 text-sm font-black" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mb-6 lg:hidden">
              <Badge>{dict.auth.eyebrow}</Badge>
              <h1 className="mt-4 text-4xl font-black uppercase leading-none text-foreground">
                {dict.auth.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{dict.auth.description}</p>
            </div>
            <LoginForm className="border-beam-card" copy={dict.auth} />
          </div>
        </div>
      </section>
    </main>
  );
}
