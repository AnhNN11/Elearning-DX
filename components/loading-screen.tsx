export function LoadingScreen({ label = "Dang tai..." }: { label?: string }) {
  return (
    <main
      aria-live="polite"
      className="fixed inset-0 z-[9997] grid place-items-center bg-background/35 px-4 text-foreground backdrop-blur-md"
      role="status"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-base border-2 border-border bg-background/80 p-6 text-center shadow-shadow">
        <div className="loading-mark grid size-16 place-items-center rounded-base border-2 border-border bg-main text-xl font-heading text-main-foreground shadow-shadow">
          DX
        </div>
        <div className="w-full">
          <p className="text-sm font-heading uppercase tracking-wide text-primary">DolphinX Learn</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">{label}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-base border-2 border-border bg-background">
            <span className="loading-page-bar block h-full w-1/2 bg-main" />
          </div>
        </div>
      </div>
    </main>
  );
}
