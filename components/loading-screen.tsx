"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";

const NAVIGATION_SNAPSHOT_KEY = "dx:last-screen-snapshot";

type NavigationSnapshot = {
  html: string;
  scrollY: number;
};

function subscribeToSnapshot() {
  return () => {};
}

function getSnapshotValue() {
  try {
    return window.sessionStorage.getItem(NAVIGATION_SNAPSHOT_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshotValue() {
  return "";
}

function parseSnapshot(rawSnapshot: string): NavigationSnapshot | null {
  if (!rawSnapshot) {
    return null;
  }

  try {
    const parsedSnapshot = JSON.parse(rawSnapshot) as Partial<NavigationSnapshot>;
    if (typeof parsedSnapshot.html !== "string" || !parsedSnapshot.html) {
      return null;
    }

    return {
      html: parsedSnapshot.html,
      scrollY: typeof parsedSnapshot.scrollY === "number" ? parsedSnapshot.scrollY : 0,
    };
  } catch {
    return null;
  }
}

export function LoadingScreen({ label = "Dang tai..." }: { label?: string }) {
  const rawSnapshot = useSyncExternalStore(subscribeToSnapshot, getSnapshotValue, getServerSnapshotValue);
  const snapshot = useMemo(() => parseSnapshot(rawSnapshot), [rawSnapshot]);

  return (
    <main className="min-h-[100dvh] flex-1">
      <div
        aria-label={label}
        aria-live="polite"
        className="pointer-events-none fixed inset-0 z-[9997] grid place-items-center overflow-hidden"
        role="status"
      >
        {snapshot?.html && (
          <div className="absolute inset-0 overflow-hidden bg-background" aria-hidden>
            <div
              dangerouslySetInnerHTML={{ __html: snapshot.html }}
              style={{ transform: `translateY(-${snapshot.scrollY}px)` }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-background/10 backdrop-blur-md" aria-hidden />
        <span
          aria-hidden
          className="loading-fish-spin relative z-10 grid size-36 place-items-center drop-shadow-[0_18px_34px_rgba(7,91,187,0.26)] sm:size-40"
        >
          <Image
            alt=""
            className="size-full object-contain"
            height={582}
            priority
            src="/brand/dolphinx-fish-transparent.png"
            width={582}
          />
        </span>
      </div>
    </main>
  );
}
