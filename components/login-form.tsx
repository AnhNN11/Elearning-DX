"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const supabase = createClient();
    if (!supabase) {
      setMessage(copy.supabaseMissing);
      return;
    }

    setLoading(true);
    setMessage("");

    const response =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (response.error) {
      setLoading(false);
      setMessage(response.error.message);
      return;
    }

    const allowed = await verifyAdminAccess();
    if (!allowed) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage("Tài khoản này không có quyền admin.");
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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
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

  async function verifyAdminAccess() {
    if (!adminOnly) {
      return true;
    }

    const profileResponse = await fetch("/api/me/profile", { cache: "no-store" });
    const payload = await profileResponse.json().catch(() => null) as {
      profile?: { role?: string; roles?: string[] };
    } | null;
    const roles = payload?.profile?.roles ?? [];

    return profileResponse.ok && (payload?.profile?.role === "admin" || roles.includes("admin"));
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-5">
        <Tabs onValueChange={(value) => setMode(value as "signin" | "signup")} value={mode}>
          <TabsList className={`grid w-full ${allowSignUp ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="signin">{copy.signIn}</TabsTrigger>
            {allowSignUp && <TabsTrigger value="signup">{copy.signUp}</TabsTrigger>}
          </TabsList>
        </Tabs>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label>{copy.password}</Label>
            <Input
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.passwordPlaceholder}
              type="password"
              value={password}
            />
          </div>
          <Button className="w-full" disabled={loading || !email || !password} onClick={submit} type="button">
            {loading ? copy.loading : mode === "signin" ? copy.signIn : copy.createAccount}
          </Button>
          <Button
            className="w-full"
            disabled={!hasSupabaseEnv || loading}
            onClick={signInWithGoogle}
            type="button"
            variant="outline"
          >
            {copy.google}
          </Button>
        </div>
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
