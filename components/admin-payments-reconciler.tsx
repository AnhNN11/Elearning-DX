"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminPaymentsReconciler() {
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    async function reconcile() {
      try {
        const response = await fetch("/api/admin/payments/reconcile", {
          cache: "no-store",
          method: "POST",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as { updatedCount?: number };

        if (response.ok && payload.updatedCount && payload.updatedCount > 0) {
          router.refresh();
        }
      } catch {
        // Background reconciliation must not block the admin payments page.
      }
    }

    reconcile();

    return () => {
      controller.abort();
    };
  }, [router]);

  return null;
}
