"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackFirebasePageView } from "@/lib/firebase/client";

export function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    void trackFirebasePageView(pathname);
  }, [pathname]);

  return null;
}
