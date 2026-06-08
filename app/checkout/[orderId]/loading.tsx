export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-secondary-background px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_26rem]">
        <section className="space-y-5">
          <div className="h-5 w-36 animate-pulse rounded-base bg-main/40" />
          <div className="h-16 max-w-3xl animate-pulse rounded-base bg-secondary" />
          <div className="h-6 max-w-2xl animate-pulse rounded-base bg-secondary" />
          <div className="h-72 animate-pulse rounded-base border-2 border-border bg-background" />
          <div className="h-28 animate-pulse rounded-base border-2 border-border bg-background" />
        </section>
        <aside className="h-[34rem] animate-pulse rounded-base border-2 border-border bg-background" />
      </div>
    </main>
  );
}
