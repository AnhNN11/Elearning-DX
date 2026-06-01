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

export function LoginForm({ className, copy }: { className?: string; copy: Dictionary["auth"] }) {
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
    const response =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    router.push("/learn");
    router.refresh();
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) {
      setMessage(copy.oauthMissing);
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-5">
        <Tabs onValueChange={(value) => setMode(value as "signin" | "signup")} value={mode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{copy.signIn}</TabsTrigger>
            <TabsTrigger value="signup">{copy.signUp}</TabsTrigger>
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
            disabled={!hasSupabaseEnv}
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
            {copy.demoMode}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
