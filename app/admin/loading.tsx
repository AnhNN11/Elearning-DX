export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r-2 border-border bg-card p-5 shadow-shadow lg:block">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-base bg-secondary" />
          <div className="h-6 w-40 animate-pulse rounded-base bg-secondary" />
        </div>
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="h-11 animate-pulse rounded-base bg-secondary" key={index} />
          ))}
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="border-b-2 border-border bg-card px-4 py-3 shadow-shadow sm:px-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-full max-w-2xl animate-pulse rounded-base bg-secondary" />
            <div className="ml-auto h-11 w-28 animate-pulse rounded-base bg-secondary" />
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <div className="mb-6 h-10 w-64 animate-pulse rounded-base bg-secondary" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-32 animate-pulse rounded-base border-2 border-border bg-card" key={index} />
            ))}
          </div>
          <div className="mt-6 h-96 animate-pulse rounded-base border-2 border-border bg-card" />
        </div>
      </main>
    </div>
  );
}
