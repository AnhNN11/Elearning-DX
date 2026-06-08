import Link from "next/link";
import { Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountSurfaceNav({
  active,
  profileLabel,
  settingsLabel,
}: {
  active: "profile" | "settings";
  profileLabel: string;
  settingsLabel: string;
}) {
  const items = [
    { href: "/profile", icon: UserRound, id: "profile", label: profileLabel },
    { href: "/settings", icon: Settings, id: "settings", label: settingsLabel },
  ] as const;

  return (
    <nav
      className="inline-flex w-full max-w-md rounded-base border-2 border-border bg-card p-1 text-sm font-heading shadow-none sm:w-auto"
      aria-label="Account navigation"
    >
      {items.map((item) => (
        <AccountNavItem
          active={active === item.id}
          href={item.href}
          icon={item.icon}
          key={item.id}
          label={item.label}
        />
      ))}
    </nav>
  );
}

function AccountNavItem({
  active,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: typeof UserRound;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-base border-2 px-4 py-2 transition sm:flex-none",
        active
          ? "border-border bg-main text-main-foreground shadow-shadow"
          : "border-transparent bg-transparent text-foreground hover:border-border hover:bg-secondary-background",
      )}
      href={href}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
