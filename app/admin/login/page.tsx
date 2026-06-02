import Link from "next/link";
import { redirect } from "next/navigation";
import { DotPattern } from "@/components/dot-pattern";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const isVietnamese = locale === "vi";

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-foreground px-4 py-10 text-background sm:px-6">
      <DotPattern className="text-main/25 [mask-image:radial-gradient(circle_at_50%_35%,black,transparent_72%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_18%,rgba(19,188,231,0.45),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,79,94,0.22),transparent_28%),linear-gradient(135deg,#071a2f_0%,#063c8b_58%,#075bbb_100%)]" />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-base border-2 border-background bg-background text-foreground shadow-shadow lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden min-h-[580px] flex-col justify-between border-r-2 border-border bg-primary p-8 text-primary-foreground lg:flex">
          <div>
            <Logo className="text-background" />
            <Badge className="mt-10 border-background bg-background text-foreground" variant="outline">
              Admin console
            </Badge>
            <h1 className="mt-6 text-5xl font-black uppercase leading-none tracking-tight">
              {isVietnamese ? "Đăng nhập quản trị" : "Admin sign in"}
            </h1>
            <p className="mt-5 max-w-md text-base leading-8 text-primary-foreground/90">
              {isVietnamese
                ? "Trang riêng cho admin quản lý khóa học, user, ảnh Cloudinary, tài liệu Supabase Storage, booking, blog và câu hỏi phỏng vấn."
                : "A dedicated admin entry for managing courses, users, Cloudinary images, Supabase Storage documents, bookings, blog posts, and interview questions."}
            </p>
          </div>
          <div className="grid gap-3">
            {[
              isVietnamese ? "Kiểm tra role admin từ bảng user_roles" : "Checks admin role from user_roles",
              isVietnamese ? "Không cho tài khoản student vào dashboard" : "Blocks student accounts from the dashboard",
              isVietnamese ? "OAuth quay về /admin sau callback" : "OAuth returns to /admin after callback",
            ].map((item) => (
              <div className="rounded-base border-2 border-background/80 bg-background/10 p-4 text-sm font-black" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 lg:hidden">
            <Logo />
            <Badge className="mt-6">Admin console</Badge>
            <h1 className="mt-4 text-4xl font-black uppercase leading-none text-foreground">
              {isVietnamese ? "Đăng nhập quản trị" : "Admin sign in"}
            </h1>
          </div>

          {params?.error === "not-admin" && (
            <div className="mb-4 rounded-base border-2 border-border bg-destructive p-4 text-sm font-black text-white">
              {isVietnamese
                ? "Tài khoản hiện tại không có quyền admin. Hãy đăng nhập bằng tài khoản admin."
                : "The current account is not an admin. Sign in with an admin account."}
            </div>
          )}

          {params?.error === "oauth" && (
            <div className="mb-4 rounded-base border-2 border-border bg-destructive p-4 text-sm font-black text-white">
              {isVietnamese
                ? "Không hoàn tất đăng nhập Google. Hãy thử lại hoặc kiểm tra Google provider trong Supabase Auth."
                : "Google sign-in could not be completed. Try again or check the Google provider in Supabase Auth."}
            </div>
          )}

          {profile && (
            <Card className="mb-4 border-dashed">
              <CardContent>
                <p className="text-sm font-black text-foreground">
                  {isVietnamese
                    ? `Đang đăng nhập learner: ${profile.email ?? profile.fullName}`
                    : `Signed in as learner: ${profile.email ?? profile.fullName}`}
                </p>
              </CardContent>
            </Card>
          )}

          <LoginForm
            adminOnly
            allowSignUp={false}
            className="border-beam-card"
            copy={dict.auth}
            redirectTo="/admin"
          />

          <Button asChild className="mt-5 w-full" variant="outline">
            <Link href="/login">
              {isVietnamese ? "Đăng nhập học viên" : "Learner sign in"}
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
