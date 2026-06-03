"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type PaymentStatusPayload = {
  courseSlug?: string;
  paid?: boolean;
  status?: string;
};

export function CheckoutStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const response = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as PaymentStatusPayload;

        if (cancelled) {
          return;
        }

        if (payload.status) {
          setStatus(payload.status);
        }

        if (response.ok && payload.paid) {
          setStatus("paid");
          router.refresh();
          return;
        }
      } catch {
        if (!cancelled) {
          setStatus("checking");
        }
      }

      timeoutId = setTimeout(poll, 4000);
    }

    timeoutId = setTimeout(poll, 1500);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [orderId, router]);

  const isPaid = status === "paid";

  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-bold text-muted-foreground">
      {isPaid ? (
        <CheckCircle2 className="size-4 text-primary" />
      ) : (
        <Loader2 className="size-4 animate-spin text-primary" />
      )}
      {isPaid ? "Đã xác nhận thanh toán" : "Đang tự kiểm tra thanh toán"}
    </div>
  );
}
