export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-secondary-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <aside className="h-96 animate-pulse rounded-base border-2 border-border bg-background" />
          <section className="space-y-6">
            <div className="h-56 animate-pulse rounded-base border-2 border-border bg-background" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-28 animate-pulse rounded-base border-2 border-border bg-background" key={index} />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-base border-2 border-border bg-background" />
          </section>
        </div>
      </div>
    </main>
  );
}
