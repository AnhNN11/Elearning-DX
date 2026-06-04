import { createOrm } from "@/lib/orm";
import { listSepayTransactions, findSepayOrderIdInText, type SepayTransaction } from "@/lib/sepay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CoursePayment } from "@/lib/types";

type Orm = NonNullable<Awaited<ReturnType<typeof createOrm>>>;

type ReconciliationResult = {
  checked: boolean;
  error?: string;
  matched: boolean;
  payment: CoursePayment;
};

const reconciliationThrottle = new Map<string, number>();
const reconciliationThrottleMs = 12000;

function normalizeComparable(value?: string) {
  return value?.replace(/\s+/g, " ").trim().toUpperCase() ?? "";
}

function normalizeAccountNumber(value?: string) {
  return value?.replace(/\D/g, "") ?? "";
}

function transactionMatchesPayment(transaction: SepayTransaction, payment: CoursePayment) {
  const orderId = normalizeComparable(payment.orderId);
  const paymentContentOrderId = normalizeComparable(findSepayOrderIdInText(payment.paymentContent));
  const content = normalizeComparable(
    [transaction.code, transaction.transactionContent, transaction.referenceNumber].filter(Boolean).join(" "),
  );
  const accountNumber = normalizeAccountNumber(transaction.accountNumber);
  const paymentAccountNumber = normalizeAccountNumber(payment.bankAccount);
  const matchesOrder =
    Boolean(orderId && content.includes(orderId)) ||
    Boolean(paymentContentOrderId && content.includes(paymentContentOrderId));
  const matchesAccount = !paymentAccountNumber || !accountNumber || paymentAccountNumber === accountNumber;
  const isMoneyIn = !transaction.transferType || transaction.transferType === "in";

  return matchesOrder && matchesAccount && isMoneyIn && transaction.amountIn >= payment.amountVnd;
}

async function getAdminOrm() {
  const adminClient = createAdminClient();

  if (!adminClient) {
    return null;
  }

  return createOrm(adminClient);
}

async function findSepayTransactionForPayment(payment: CoursePayment) {
  const result = await listSepayTransactions({
    amountInMin: payment.amountVnd,
    perPage: 20,
    q: payment.orderId,
    timeoutMs: 4000,
    transferType: "in",
  });

  if (!result.ok) {
    return {
      error: result.error,
      transaction: null,
    };
  }

  return {
    transaction: result.transactions.find((transaction) => transactionMatchesPayment(transaction, payment)) ?? null,
  };
}

export async function reconcileCoursePayment(
  payment: CoursePayment,
  orm?: Orm,
  options: {
    force?: boolean;
  } = {},
): Promise<ReconciliationResult> {
  if (payment.status === "paid" || payment.provider !== "sepay") {
    return {
      checked: false,
      matched: false,
      payment,
    };
  }

  const now = Date.now();
  const lastCheckedAt = reconciliationThrottle.get(payment.orderId) ?? 0;

  if (!options.force && now - lastCheckedAt < reconciliationThrottleMs) {
    return {
      checked: false,
      matched: false,
      payment,
    };
  }

  reconciliationThrottle.set(payment.orderId, now);

  const { error, transaction } = await findSepayTransactionForPayment(payment);

  if (!transaction) {
    return {
      checked: true,
      error,
      matched: false,
      payment,
    };
  }

  const adminOrm = orm ?? (await getAdminOrm());

  if (!adminOrm) {
    return {
      checked: true,
      error: "Thiếu SUPABASE_SERVICE_ROLE_KEY để cập nhật đơn thanh toán.",
      matched: false,
      payment,
    };
  }

  const paidPayment = await adminOrm.payments.markPaid(payment.orderId, {
    raw: {
      reconciledAt: new Date().toISOString(),
      reconciledBy: "sepay_api_v2",
      transaction: transaction.raw,
    },
    referenceNumber: transaction.referenceNumber,
    transactionId: transaction.id,
  });
  await adminOrm.learning.enroll(paidPayment.userId, paidPayment.courseId);

  return {
    checked: true,
    matched: true,
    payment: paidPayment,
  };
}

export async function reconcileCoursePayments(payments: CoursePayment[], limit = 20) {
  const pendingPayments = payments.filter((payment) => payment.status === "pending" && payment.provider === "sepay").slice(0, limit);

  if (!pendingPayments.length) {
    return payments;
  }

  const adminOrm = await getAdminOrm();

  if (!adminOrm) {
    return payments;
  }

  const minAmount = Math.min(...pendingPayments.map((payment) => payment.amountVnd));
  const transactionResult = await listSepayTransactions({
    amountInMin: minAmount,
    perPage: 100,
    timeoutMs: 5000,
    transferType: "in",
  });

  if (!transactionResult.ok) {
    return payments;
  }

  const updatedPayments = new Map<string, CoursePayment>();

  for (const payment of pendingPayments) {
    const transaction = transactionResult.transactions.find((item) => transactionMatchesPayment(item, payment));

    if (transaction) {
      const paidPayment = await adminOrm.payments.markPaid(payment.orderId, {
        raw: {
          reconciledAt: new Date().toISOString(),
          reconciledBy: "sepay_api_v2_batch",
          transaction: transaction.raw,
        },
        referenceNumber: transaction.referenceNumber,
        transactionId: transaction.id,
      });
      await adminOrm.learning.enroll(paidPayment.userId, paidPayment.courseId);
      updatedPayments.set(payment.id, paidPayment);
    }
  }

  if (!updatedPayments.size) {
    return payments;
  }

  return payments.map((payment) => updatedPayments.get(payment.id) ?? payment);
}
