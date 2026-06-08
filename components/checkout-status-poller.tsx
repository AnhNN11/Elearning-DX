"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type PaymentStatusPayload = {
  courseSlug?: string;
  matched?: boolean;
  paid?: boolean;
  status?: string;
};

type PollPhase = "checking" | "paid" | "reconciling" | "waiting";

export function CheckoutStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [phase, setPhase] = useState<PollPhase>("checking");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let reconcileTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let hasRefreshed = false;
    const controllers = new Set<AbortController>();

    function createController() {
      const controller = new AbortController();
      controllers.add(controller);

      return controller;
    }

    function markPaid() {
      if (cancelled) {
        return;
      }

      setStatus("paid");
      setPhase("paid");

      if (!hasRefreshed) {
        hasRefreshed = true;
        router.refresh();
      }
    }

    function scheduleStatusPoll(delay = 3000) {
      if (!cancelled && !hasRefreshed) {
        timeoutId = setTimeout(pollStatus, delay);
      }
    }

    function scheduleReconcile(delay = 10000) {
      if (!cancelled && !hasRefreshed) {
        reconcileTimeoutId = setTimeout(reconcilePayment, delay);
      }
    }

    async function pollStatus() {
      const controller = createController();

      try {
        const params = new URLSearchParams({
          orderId,
        });

        setPhase((current) => (current === "paid" || current === "reconciling" ? current : "checking"));

        const response = await fetch(`/api/payments/status?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as PaymentStatusPayload;

        if (cancelled) {
          return;
        }

        if (payload.status) {
          setStatus(payload.status);
        }

        if (response.ok && payload.paid) {
          markPaid();
          return;
        }
      } catch {
        if (!cancelled) {
          setPhase("waiting");
        }
      } finally {
        controllers.delete(controller);
      }

      scheduleStatusPoll();
    }

    async function reconcilePayment() {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        scheduleReconcile(15000);
        return;
      }

      const controller = createController();

      try {
        setPhase((current) => (current === "paid" ? current : "reconciling"));

        const response = await fetch("/api/payments/reconcile", {
          body: JSON.stringify({ orderId }),
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as PaymentStatusPayload;

        if (cancelled) {
          return;
        }

        if (payload.status) {
          setStatus(payload.status);
        }

        if (response.ok && payload.paid) {
          markPaid();
          return;
        }

        setPhase("waiting");
      } catch {
        if (!cancelled) {
          setPhase("waiting");
        }
      } finally {
        controllers.delete(controller);
      }

      scheduleReconcile();
    }

    scheduleStatusPoll(500);
    scheduleReconcile(2500);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (reconcileTimeoutId) {
        clearTimeout(reconcileTimeoutId);
      }
      controllers.forEach((controller) => {
        controller.abort();
      });
    };
  }, [orderId, router]);

  const isPaid = status === "paid";
  const label = isPaid
    ? "Đã xác nhận thanh toán"
    : phase === "reconciling"
      ? "Đang đối soát SePay"
      : "Đang chờ xác nhận";

  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-bold text-muted-foreground">
      {isPaid ? (
        <CheckCircle2 className="size-4 text-primary" />
      ) : (
        <Loader2 className="size-4 animate-spin text-primary" />
      )}
      {label}
    </div>
  );
}
