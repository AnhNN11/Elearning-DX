export default function Loading() {
  return (
    <main className="min-h-screen bg-secondary-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-16 items-center gap-3 border-b-2 border-border bg-secondary-background pb-4">
          <div className="h-12 w-12 animate-pulse rounded-base border-2 border-border bg-secondary" />
          <div className="h-6 w-44 animate-pulse rounded-base bg-secondary" />
          <div className="ml-auto hidden h-11 w-80 animate-pulse rounded-base bg-secondary lg:block" />
          <div className="h-11 w-24 animate-pulse rounded-base bg-secondary" />
        </div>
        <section className="grid gap-6 py-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <div className="h-5 w-28 animate-pulse rounded-base bg-main/40" />
            <div className="h-16 max-w-3xl animate-pulse rounded-base bg-secondary" />
            <div className="h-6 max-w-2xl animate-pulse rounded-base bg-secondary" />
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="h-40 animate-pulse rounded-base border-2 border-border bg-background" />
              <div className="h-40 animate-pulse rounded-base border-2 border-border bg-background" />
            </div>
          </div>
          <div className="h-72 animate-pulse rounded-base border-2 border-border bg-background" />
        </section>
      </div>
    </main>
  );
}
