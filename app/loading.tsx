import Image from "next/image";

export default function Loading() {
  return (
    <main
      aria-label="Loading DolphinX Learn"
      aria-live="polite"
      className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-12 text-foreground"
    >
      <div className="loading-board-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_20%,rgba(19,188,231,0.22),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(255,79,94,0.18),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#e9f8ff_100%)]"
        aria-hidden="true"
      />

      <Image
        alt="DolphinX Learn logo"
        className="loading-logo-spin h-36 w-36 object-contain sm:h-48 sm:w-48"
        height={746}
        priority
        src="/brand/dolphinx-fish-mark.png"
        width={649}
      />
    </main>
  );
}
