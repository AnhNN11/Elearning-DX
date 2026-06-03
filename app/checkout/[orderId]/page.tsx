import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, QrCode, RefreshCw } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CheckoutStatusPoller } from "@/components/checkout-status-poller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatVnd } from "@/lib/money";
import { createOrm } from "@/lib/orm";
import { createSepayQrImageUrlForBank, getSepayConfig, normalizeSepayBankCode } from "@/lib/sepay";

async function getServerNow() {
  return Date.now();
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const profile = await requireUser();
  const orm = await createOrm();
  const initialPayment = await orm?.payments.findByOrderIdForUser(orderId, profile.id);

  if (!initialPayment) {
    notFound();
  }

  const payment = initialPayment;
  const now = await getServerNow();
  const expiresAt = new Date(payment.expiresAt);
  const isExpired = payment.status === "pending" && expiresAt.getTime() < now;
  const isPaid = payment.status === "paid";
  const sepayConfig = getSepayConfig();
  const rawBankCode = payment.bankCode ?? sepayConfig.bankCode;
  const normalizedBankCode = rawBankCode ? normalizeSepayBankCode(rawBankCode) : "";
  const qrBankAccount = payment.bankAccount ?? sepayConfig.bankAccount;
  const qrBankAccountName = payment.bankAccountName ?? sepayConfig.bankAccountName;
  const shouldRebuildQrImageUrl = Boolean(
    normalizedBankCode &&
      qrBankAccount &&
      (!payment.qrImageUrl || (payment.bankCode && normalizedBankCode !== payment.bankCode)),
  );
  const rebuiltQrImageUrl =
    shouldRebuildQrImageUrl
      ? createSepayQrImageUrlForBank({
          amountVnd: payment.amountVnd,
          bankAccount: qrBankAccount,
          bankCode: normalizedBankCode,
          paymentContent: payment.paymentContent,
          qrTemplate: sepayConfig.qrTemplate,
        })
      : undefined;
  const qrImageUrl = rebuiltQrImageUrl ?? payment.qrImageUrl;
  const bankCode = normalizedBankCode || undefined;
  const bankAccount = qrBankAccount || undefined;
  const bankAccountName = qrBankAccountName || undefined;
  const hasQrImage = Boolean(qrImageUrl);
  const statusLabel = isPaid ? "Đã thanh toán" : isExpired ? "Hết hạn" : "Chờ chuyển khoản";

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_430px]">
        <div>
          <p className="text-sm font-heading uppercase text-primary">SePay checkout</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-heading uppercase leading-tight text-foreground md:text-5xl">
            Thanh toán khóa học
          </h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-muted-foreground">
            Quét QR chuyển khoản ngay trên trang này. Khi SePay IPN xác nhận thành công, hệ thống
            sẽ tự động mở quyền học cho tài khoản của bạn.
          </p>

          <Card className="mt-8 shadow-none">
            <CardHeader className="border-b-2 border-border">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-2xl font-black text-foreground">
                  {payment.courseTitle ?? "Khóa học"}
                </CardTitle>
                <Badge variant={isPaid ? "default" : isExpired ? "outline" : "secondary"}>
                  {statusLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-heading uppercase text-muted-foreground">Số tiền</p>
                <p className="mt-2 text-3xl font-heading text-primary">{formatVnd(payment.amountVnd)}</p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-heading uppercase text-muted-foreground">Mã đơn</p>
                <p className="mt-2 font-mono text-2xl font-black text-foreground">{payment.orderId}</p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-heading uppercase text-muted-foreground">Nội dung chuyển khoản</p>
                <p className="mt-2 font-mono text-2xl font-black text-foreground">{payment.paymentContent}</p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-4">
                <p className="text-xs font-heading uppercase text-muted-foreground">Hạn thanh toán</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-black text-foreground">
                  <Clock3 className="size-5 text-primary" />
                  {expiresAt.toLocaleString("vi-VN")}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-wrap gap-3">
            {isPaid && payment.courseSlug ? (
              <Button asChild>
                <Link href={`/learn/${payment.courseSlug}`}>
                  <CheckCircle2 className="size-4" />
                  Vào học ngay
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link href={`/checkout/${payment.orderId}`}>
                  <RefreshCw className="size-4" />
                  Kiểm tra lại trạng thái
                </Link>
              </Button>
            )}
            {qrImageUrl && !isPaid && (
              <Button asChild variant="outline">
                <a href={qrImageUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Mở ảnh QR
                </a>
              </Button>
            )}
            {!isPaid && <CheckoutStatusPoller orderId={payment.orderId} />}
          </div>

          {!isPaid && !hasQrImage && (
            <div className="mt-6 rounded-base border-2 border-destructive bg-card p-4 text-sm font-bold leading-6 text-muted-foreground">
              <p className="flex items-center gap-2 font-heading text-destructive">
                <AlertTriangle className="size-4" />
                Chưa có QR cho đơn này
              </p>
              <p className="mt-2">
                Đơn này thiếu thông tin QR hoặc tài khoản ngân hàng. Hãy cấu hình SePay bank account rồi tạo
                lại đơn thanh toán mới.
              </p>
            </div>
          )}

          {!isPaid && (
            <div className="mt-6 rounded-base border-2 border-border bg-card p-4 text-sm font-bold leading-6 text-muted-foreground">
              <p className="flex items-center gap-2 font-heading text-foreground">
                <AlertTriangle className="size-4 text-primary" />
                Lưu ý đối soát
              </p>
              <p className="mt-2">
                Vui lòng không sửa nội dung chuyển khoản. Nếu ngân hàng hiển thị chậm, hãy đợi vài giây rồi bấm
                kiểm tra lại trạng thái.
              </p>
            </div>
          )}
        </div>

        <Card className="h-fit overflow-hidden shadow-none lg:sticky lg:top-24">
          <CardHeader className="border-b-2 border-border bg-secondary">
            <p className="flex items-center gap-2 text-sm font-heading uppercase text-primary">
              <QrCode className="size-5" />
              Thanh toán SePay
            </p>
            <CardTitle className="text-2xl font-black text-foreground">{formatVnd(payment.amountVnd)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid min-h-64 place-items-center rounded-base border-2 border-border bg-secondary-background p-6 text-center">
              {isPaid ? (
                <div>
                  <CheckCircle2 className="mx-auto size-16 text-primary" />
                  <p className="mt-4 text-xl font-heading text-foreground">Thanh toán đã xác nhận</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">
                    Quyền học đã được mở cho tài khoản của bạn.
                  </p>
                </div>
              ) : qrImageUrl ? (
                <div className="w-full">
                  <div className="mx-auto max-w-80 rounded-base border-2 border-border bg-background p-3">
                    <Image
                      alt={`QR thanh toán ${payment.orderId}`}
                      className="h-auto w-full rounded-base"
                      height={360}
                      priority
                      src={qrImageUrl}
                      unoptimized
                      width={360}
                    />
                  </div>
                  <p className="mt-4 text-xl font-heading text-foreground">Quét QR chuyển khoản</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">
                    QR đã chứa số tiền và nội dung chuyển khoản chính xác. Không sửa nội dung khi thanh toán.
                  </p>
                </div>
              ) : (
                <div>
                  <QrCode className="mx-auto size-16 text-primary" />
                  <p className="mt-4 text-xl font-heading text-foreground">Chưa có QR thanh toán</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-muted-foreground">
                    Đơn này chưa có ảnh QR. Hãy tạo lại đơn sau khi cấu hình tài khoản ngân hàng SePay.
                  </p>
                </div>
              )}
            </div>
            {payment.qrCode && (
              <details className="mt-4 rounded-base border-2 border-border bg-secondary-background p-3 text-xs font-bold text-muted-foreground">
                <summary className="cursor-pointer font-heading text-foreground">QR payload từ SePay</summary>
                <p className="mt-2 break-all font-mono">{payment.qrCode}</p>
              </details>
            )}
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-base border-2 border-border bg-secondary-background px-3 py-2">
                <span className="font-heading text-muted-foreground">Ngân hàng</span>
                <span className="font-black text-foreground">{bankCode ?? "Chưa cấu hình"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-base border-2 border-border bg-secondary-background px-3 py-2">
                <span className="font-heading text-muted-foreground">Tài khoản</span>
                <span className="font-mono font-black text-foreground">{bankAccount ?? "-"}</span>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background px-3 py-2">
                <span className="font-heading text-muted-foreground">Chủ tài khoản</span>
                <span className="mt-1 block font-black text-foreground">{bankAccountName ?? "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
