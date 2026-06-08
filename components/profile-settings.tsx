import { linkGoogleAccountAction, updateProfileAction } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { AccountIdentity, Profile } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DX"
  );
}

export function ProfileSettings({
  copy,
  dateLocale,
  identities,
  profile,
  returnTo = "/profile",
  saved,
}: {
  copy: Dictionary["profile"];
  dateLocale: string;
  identities: AccountIdentity[];
  profile: Profile;
  returnTo?: string;
  saved?: boolean;
}) {
  const isVietnamese = dateLocale === "vi-VN";
  const initials = getInitials(profile.fullName);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
      <Card className="overflow-hidden shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-heading uppercase text-primary">
                {isVietnamese ? "Thông tin cá nhân" : "Personal details"}
              </p>
              <CardTitle className="mt-2 text-2xl">{copy.editTitle}</CardTitle>
            </div>
            <span
              aria-hidden
              className="grid size-16 place-items-center rounded-base border-2 border-border bg-main bg-cover bg-center text-xl font-heading text-main-foreground shadow-shadow"
              style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
            >
              {!profile.avatarUrl && initials}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            <input name="returnTo" type="hidden" value={returnTo} />
            <div className="space-y-2">
              <Label htmlFor="fullName">{copy.fullName}</Label>
              <Input className="h-12" id="fullName" name="fullName" required defaultValue={profile.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">{copy.avatarUrl}</Label>
              <Input
                className="h-12"
                id="avatarUrl"
                name="avatarUrl"
                placeholder="https://..."
                defaultValue={profile.avatarUrl ?? ""}
              />
            </div>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Button className="h-11" type="submit">{copy.save}</Button>
              {saved && (
                <p className="rounded-base border-2 border-border bg-secondary px-4 py-2 text-sm font-heading">
                  {copy.saved}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <p className="text-xs font-heading uppercase text-primary">
            {isVietnamese ? "Đăng nhập & provider" : "Sign-in providers"}
          </p>
          <CardTitle className="mt-2 text-2xl">{copy.accountTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{copy.accountDescription}</p>
          <div className="mt-5 space-y-3">
            {identities.length ? (
              identities.map((identity) => (
                <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={identity.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading text-foreground">{identity.provider}</p>
                      {identity.email && <p className="break-all text-sm text-muted-foreground">{identity.email}</p>}
                    </div>
                    <Badge variant="outline">{copy.provider}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs font-bold text-muted-foreground sm:grid-cols-2">
                    {identity.createdAt && (
                      <span>{copy.createdAt}: {new Date(identity.createdAt).toLocaleDateString(dateLocale)}</span>
                    )}
                    {identity.lastSignInAt && (
                      <span>{copy.lastSignIn}: {new Date(identity.lastSignInAt).toLocaleDateString(dateLocale)}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-base border-2 border-dashed border-border p-3 text-sm font-heading">
                {copy.noLinkedAccounts}
              </p>
            )}
          </div>
          <form action={linkGoogleAccountAction} className="mt-5">
            <input name="returnTo" type="hidden" value={returnTo} />
            <Button className="h-11 w-full" type="submit" variant="outline">
              {copy.linkGoogle}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
