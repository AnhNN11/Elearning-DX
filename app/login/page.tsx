import Image from "next/image";
import { AppHeader } from "@/components/app-header";
import { DotPattern } from "@/components/dot-pattern";
import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const params = await searchParams;
  const isVietnamese = locale === "vi";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="relative isolate grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-4 py-12 sm:px-6">
        <div className="login-board-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-base border-2 border-border bg-card shadow-shadow lg:grid-cols-[1.04fr_0.96fr]">
          <div className="relative isolate hidden min-h-[620px] overflow-hidden bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
            <DotPattern className="text-background/28 [mask-image:radial-gradient(circle_at_40%_25%,black,transparent_72%)]" />
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
            <div className="relative z-10">
              <div className="overflow-hidden rounded-base border-2 border-background bg-background shadow-shadow">
                <Image
                  alt={isVietnamese ? "Màn hình code cho bài học trực tuyến" : "Code screen for online lessons"}
                  className="h-56 w-full object-cover"
                  height={420}
                  priority
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=960&q=80"
                  width={960}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["100%", dict.courses.certificateLabel],
                  ["DB", "Supabase"],
                  ["AI", "Coding lab"],
                ].map(([value, label]) => (
                  <div className="rounded-base border-2 border-background bg-background/10 p-3 text-center" key={label}>
                    <p className="text-2xl font-black text-background">{value}</p>
                    <p className="mt-1 text-xs font-black text-primary-foreground/85">{label}</p>
                  </div>
                ))}
              </div>
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
            {params?.error === "oauth" && (
              <div className="mb-4 rounded-base border-2 border-border bg-accent p-4 text-sm font-black text-accent-foreground">
                {isVietnamese
                  ? "Không hoàn tất đăng nhập Google. Hãy thử lại hoặc kiểm tra Google provider trong Supabase Auth."
                  : "Google sign-in could not be completed. Try again or check the Google provider in Supabase Auth."}
              </div>
            )}
            <LoginForm className="border-beam-card" copy={dict.auth} />
          </div>
        </div>
      </section>
    </main>
  );
}
