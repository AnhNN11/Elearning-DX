import { linkGoogleAccountAction, updateProfileAction } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { AccountIdentity, Profile } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ProfileSettings({
  copy,
  dateLocale,
  identities,
  profile,
  saved,
}: {
  copy: Dictionary["profile"];
  dateLocale: string;
  identities: AccountIdentity[];
  profile: Profile;
  saved?: boolean;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{copy.editTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{copy.fullName}</Label>
              <Input id="fullName" name="fullName" required defaultValue={profile.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">{copy.avatarUrl}</Label>
              <Input id="avatarUrl" name="avatarUrl" placeholder="https://..." defaultValue={profile.avatarUrl ?? ""} />
            </div>
            <Button type="submit">{copy.save}</Button>
            {saved && <p className="rounded-base border-2 border-border bg-secondary p-3 text-sm font-heading">{copy.saved}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{copy.accountTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{copy.accountDescription}</p>
          <div className="mt-5 space-y-3">
            {identities.length ? (
              identities.map((identity) => (
                <div className="rounded-base border-2 border-border bg-secondary-background p-3" key={identity.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-foreground">{identity.provider}</p>
                      {identity.email && <p className="text-sm text-muted-foreground">{identity.email}</p>}
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
            <Button className="w-full" type="submit" variant="outline">
              {copy.linkGoogle}
            </Button>
          </form>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{copy.demoAccountNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}
