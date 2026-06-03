import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, ExternalLink, ReceiptText, Search } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { confirmCoursePaymentAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminCoursePayments } from "@/lib/data";
import { formatVnd } from "@/lib/money";
import type { CoursePayment, PaymentStatus } from "@/lib/types";

const statusOptions: Array<PaymentStatus | "all"> = ["all", "pending", "paid", "failed", "expired", "cancelled"];

const statusCopy: Record<PaymentStatus | "all", string> = {
  all: "Tất cả",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
  failed: "Lỗi",
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isStatus(value: string | undefined): value is PaymentStatus {
  return statusOptions.includes(value as PaymentStatus);
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusVariant(status: PaymentStatus) {
  if (status === "paid") {
    return "default";
  }

  if (status === "pending") {
    return "secondary";
  }

  return status === "failed" ? "destructive" : "outline";
}

function getPaymentHaystack(payment: CoursePayment) {
  return [
    payment.orderId,
    payment.userEmail,
    payment.userFullName,
    payment.courseTitle,
    payment.paymentContent,
    payment.providerTransactionId,
    payment.referenceNumber,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterHref(status: PaymentStatus | "all", q: string) {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }
  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/admin/payments?${query}` : "/admin/payments";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const q = (getSearchParam(params?.q)?.trim() ?? "");
  const statusParam = getSearchParam(params?.status);
  const status = isStatus(statusParam) ? statusParam : "all";
  const payments = await getAdminCoursePayments();
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = status === "all" || payment.status === status;
    const matchesQuery = !q || getPaymentHaystack(payment).includes(q.toLowerCase());

    return matchesStatus && matchesQuery;
  });
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");
  const failedPayments = payments.filter((payment) => ["failed", "expired", "cancelled"].includes(payment.status));
  const revenue = paidPayments.reduce((total, payment) => total + payment.amountVnd, 0);
  const pendingAmount = pendingPayments.reduce((total, payment) => total + payment.amountVnd, 0);
  const paidRate = payments.length ? Math.round((paidPayments.length / payments.length) * 100) : 0;
  const statusCounts = statusOptions.reduce<Record<string, number>>((acc, option) => {
    acc[option] = option === "all" ? payments.length : payments.filter((payment) => payment.status === option).length;
    return acc;
  }, {});

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-heading uppercase text-primary">Payment operations</p>
          <h1 className="mt-2 text-3xl font-heading text-foreground">Quản lý đơn hàng</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Theo dõi lịch sử thanh toán khóa học, trạng thái IPN SePay, mã giao dịch và các đơn đang chờ đối soát.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/courses">
              <CreditCard className="size-4" />
              Khóa học có phí
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/payments">
              <ReceiptText className="size-4" />
              Làm mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card className="shadow-none">
          <CardContent>
            <p className="text-xs font-heading uppercase text-muted-foreground">Doanh thu đã nhận</p>
            <p className="mt-2 text-2xl font-heading text-primary">{formatVnd(revenue)}</p>
            <p className="mt-2 text-xs font-bold text-muted-foreground">{paidPayments.length} giao dịch paid</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent>
            <p className="text-xs font-heading uppercase text-muted-foreground">Đang chờ</p>
            <p className="mt-2 text-2xl font-heading text-foreground">{pendingPayments.length}</p>
            <p className="mt-2 text-xs font-bold text-muted-foreground">{formatVnd(pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent>
            <p className="text-xs font-heading uppercase text-muted-foreground">Cần kiểm tra</p>
            <p className="mt-2 text-2xl font-heading text-foreground">{failedPayments.length}</p>
            <p className="mt-2 text-xs font-bold text-muted-foreground">failed / expired / cancelled</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent>
            <p className="text-xs font-heading uppercase text-muted-foreground">Tỉ lệ paid</p>
            <p className="mt-2 text-2xl font-heading text-primary">{paidRate}%</p>
            <p className="mt-2 text-xs font-bold text-muted-foreground">{payments.length} tổng đơn</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 shadow-none">
        <CardHeader className="border-b-2 border-border">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle className="text-2xl">Lịch sử thanh toán</CardTitle>
              <p className="mt-2 text-sm font-bold text-muted-foreground">
                Hiển thị {filteredPayments.length}/{payments.length} đơn gần nhất.
              </p>
            </div>
            <form className="grid gap-2 sm:grid-cols-[minmax(0,280px)_160px_auto]" method="get">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-base border-2 border-border bg-secondary-background pl-9 pr-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={q}
                  name="q"
                  placeholder="Mã đơn, email, khóa học..."
                />
              </label>
              <select
                className="h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={status}
                name="status"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusCopy[option]} ({statusCounts[option] ?? 0})
                  </option>
                ))}
              </select>
              <Button type="submit">Lọc</Button>
            </form>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                asChild
                className="h-9 px-3 text-xs"
                key={option}
                variant={status === option ? "secondary" : "outline"}
              >
                <Link href={filterHref(option, q)}>
                  {statusCopy[option]}
                  <span className="ml-1 text-muted-foreground">({statusCounts[option] ?? 0})</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>SePay</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="min-w-52 whitespace-normal">
                      <div className="flex items-start gap-2">
                        {payment.status === "paid" ? (
                          <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                        ) : payment.status === "pending" ? (
                          <Clock3 className="mt-0.5 size-4 text-primary" />
                        ) : (
                          <AlertTriangle className="mt-0.5 size-4 text-destructive" />
                        )}
                        <div className="min-w-0">
                          <p className="break-all font-mono text-sm font-black text-foreground">{payment.orderId}</p>
                          <p className="mt-1 break-all text-xs font-bold text-muted-foreground">{payment.paymentContent}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56 whitespace-normal">
                      <p className="font-black text-foreground">{payment.userFullName ?? "Chưa có tên"}</p>
                      <p className="mt-1 break-all text-xs font-bold text-muted-foreground">{payment.userEmail ?? payment.userId}</p>
                    </TableCell>
                    <TableCell className="min-w-64 whitespace-normal">
                      <Link className="font-black text-foreground hover:text-primary" href={`/admin/courses/${payment.courseId}`}>
                        {payment.courseTitle ?? payment.courseId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        <p className="font-heading text-primary">{formatVnd(payment.amountVnd)}</p>
                        <Badge variant={statusVariant(payment.status)}>{statusCopy[payment.status]}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56 whitespace-normal">
                      <p className="text-sm font-black text-foreground">{payment.provider.toUpperCase()}</p>
                      <p className="mt-1 break-all text-xs font-bold text-muted-foreground">
                        {payment.providerTransactionId ?? payment.referenceNumber ?? "Chưa có mã giao dịch"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {payment.qrImageUrl && payment.status === "pending" && (
                          <a
                            className="inline-flex items-center gap-1 text-xs font-heading text-primary hover:underline"
                            href={payment.qrImageUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Mở QR
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        {payment.status !== "paid" && (
                          <form action={confirmCoursePaymentAction}>
                            <input name="orderId" type="hidden" value={payment.orderId} />
                            <input name="returnTo" type="hidden" value={`/admin/payments?status=${status}&q=${encodeURIComponent(q)}`} />
                            <Button className="h-8 px-2 text-xs" type="submit" variant="outline">
                              Xác nhận đã nhận tiền
                            </Button>
                          </form>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-48 whitespace-normal text-xs font-bold text-muted-foreground">
                      <p>Tạo: {formatDate(payment.createdAt)}</p>
                      <p className="mt-1">Hạn: {formatDate(payment.expiresAt)}</p>
                      {payment.paidAt && <p className="mt-1 text-primary">Paid: {formatDate(payment.paidAt)}</p>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-base border-2 border-dashed border-border bg-secondary-background p-8 text-center">
              <ReceiptText className="mx-auto size-10 text-primary" />
              <p className="mt-3 font-heading text-foreground">Không có đơn phù hợp</p>
              <p className="mt-2 text-sm font-bold text-muted-foreground">
                Thử đổi bộ lọc trạng thái hoặc tìm theo mã đơn/email khác.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
