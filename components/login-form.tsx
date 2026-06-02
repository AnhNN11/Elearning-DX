"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function LoginForm({
  adminOnly = false,
  allowSignUp = true,
  className,
  copy,
  redirectTo = "/learn",
}: {
  adminOnly?: boolean;
  allowSignUp?: boolean;
  className?: string;
  copy: Dictionary["auth"];
  redirectTo?: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "signup";
  const canSubmit = isSignUp
    ? Boolean(fullName.trim() && phone.trim() && email.trim() && password && confirmPassword)
    : Boolean(email.trim() && password);

  async function submit() {
    const supabase = createClient();
    if (!supabase) {
      setMessage(copy.supabaseMissing);
      return;
    }

    setLoading(true);
    setMessage("");

    if (isSignUp && password !== confirmPassword) {
      setLoading(false);
      setMessage(copy.passwordMismatch);
      return;
    }

    const response =
      !isSignUp
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                phone: phone.trim(),
              },
            },
          });

    if (response.error) {
      setLoading(false);
      setMessage(response.error.message);
      return;
    }

    const allowed = await verifyAdminAccess(supabase);
    if (!allowed) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage(copy.adminDenied);
      return;
    }

    setLoading(false);
    router.push(redirectTo);
    router.refresh();
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) {
      setMessage(copy.oauthMissing);
      return;
    }

    setLoading(true);
    setMessage("");

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectTo.startsWith("/") ? redirectTo : "/learn");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  async function verifyAdminAccess(supabase: NonNullable<ReturnType<typeof createClient>>) {
    if (!adminOnly) {
      return true;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("roles(slug)").eq("user_id", user.id),
    ]);

    const roles =
      roleRows?.flatMap((row) => {
        const relatedRoles = row.roles;
        const roleList = Array.isArray(relatedRoles) ? relatedRoles : relatedRoles ? [relatedRoles] : [];

        return roleList.map((role) => role.slug).filter(Boolean);
      }) ?? [];

    return profile?.role === "admin" || roles.includes("admin");
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm font-heading uppercase text-primary">
            {adminOnly ? "Admin access" : copy.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-foreground">
            {mode === "signin" ? copy.signIn : copy.createAccount}
          </h2>
        </div>
        <Tabs onValueChange={(value) => setMode(value as "signin" | "signup")} value={mode}>
          <TabsList className={`grid w-full ${allowSignUp ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="signin">{copy.signIn}</TabsTrigger>
            {allowSignUp && <TabsTrigger value="signup">{copy.signUp}</TabsTrigger>}
          </TabsList>
        </Tabs>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Button
            className="h-12 w-full justify-center bg-secondary-background text-foreground"
            disabled={!hasSupabaseEnv || loading}
            onClick={signInWithGoogle}
            type="button"
            variant="outline"
          >
            <span className="grid size-6 place-items-center rounded-full border-2 border-border bg-card text-sm font-black text-primary">
              G
            </span>
            {copy.google}
          </Button>
          <div className="flex items-center gap-3 text-xs font-black uppercase text-muted-foreground">
            <span className="h-0.5 flex-1 bg-border/40" />
          Email
          <span className="h-0.5 flex-1 bg-border/40" />
        </div>
          {isSignUp && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2">
                  <UserRound className="size-4 text-primary" />
                  {copy.fullName}
                </Label>
                <Input
                  autoComplete="name"
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={copy.fullNamePlaceholder}
                  type="text"
                  value={fullName}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {copy.phone}
                </Label>
                <Input
                  autoComplete="tel"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={copy.phonePlaceholder}
                  type="tel"
                  value={phone}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              Email
            </Label>
            <Input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-primary" />
              {copy.password}
            </Label>
            <Input
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.passwordPlaceholder}
              type="password"
              value={password}
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                {copy.confirmPassword}
              </Label>
              <Input
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={copy.confirmPasswordPlaceholder}
                type="password"
                value={confirmPassword}
              />
            </div>
          )}
          <Button className="w-full" disabled={loading || !canSubmit} type="submit">
            {loading ? copy.loading : mode === "signin" ? copy.signIn : copy.createAccount}
          </Button>
        </form>
        {message && <p className="bg-secondary text-secondary-foreground mt-4 rounded-md p-3 text-sm">{message}</p>}
        {!hasSupabaseEnv && (
          <p className="text-muted-foreground mt-4 text-xs leading-5">
            {copy.supabaseMissing}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
