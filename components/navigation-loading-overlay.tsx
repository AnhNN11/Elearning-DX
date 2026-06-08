"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const NAVIGATION_LOADING_EVENT = "dx:navigation-loading";
const NAVIGATION_LOADING_DELAY_MS = 400;
const NAVIGATION_LOADING_TIMEOUT_MS = 5000;

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function shouldTrackLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(anchor.href);
  const current = new URL(window.location.href);

  if (url.origin !== current.origin) {
    return false;
  }

  if (url.pathname === current.pathname && url.search === current.search && url.hash) {
    return false;
  }

  return `${url.pathname}${url.search}${url.hash}` !== `${current.pathname}${current.search}${current.hash}`;
}

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(() => `${pathname}?${searchParams.toString()}`, [pathname, searchParams]);
  const [startedRouteKey, setStartedRouteKey] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pending = startedRouteKey === routeKey;

  useEffect(() => {
    if (!pending) {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      return;
    }

    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = window.setTimeout(() => setVisible(true), NAVIGATION_LOADING_DELAY_MS);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setStartedRouteKey(null);
      setVisible(false);
    }, NAVIGATION_LOADING_TIMEOUT_MS);

    return () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pending]);

  useEffect(() => {
    function start() {
      setVisible(false);
      setStartedRouteKey(routeKey);
    }

    function onClick(event: MouseEvent) {
      if (!isPlainLeftClick(event) || event.defaultPrevented) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");

      if (anchor instanceof HTMLAnchorElement && shouldTrackLink(anchor)) {
        start();
      }
    }

    function onSubmit(event: SubmitEvent) {
      if (!event.defaultPrevented) {
        start();
      }
    }

    function onManualStart() {
      start();
    }

    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit, true);
    window.addEventListener(NAVIGATION_LOADING_EVENT, onManualStart);

    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit, true);
      window.removeEventListener(NAVIGATION_LOADING_EVENT, onManualStart);
    };
  }, [routeKey]);

  if (!pending || !visible) {
    return null;
  }

  return (
    <div
      aria-label="Đang tải trang"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-1.5 overflow-hidden bg-main/20"
      role="status"
    >
      <span className="navigation-loading-bar block h-full w-1/2 bg-main shadow-shadow" />
    </div>
  );
}
