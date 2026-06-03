import { ApiError } from "@/lib/api/auth";

export type SepayIpnPayload = {
  amount: number;
  currency: string;
  orderId: string;
  raw: unknown;
  referenceNumber?: string;
  status: "cancelled" | "paid" | "pending";
  transactionId?: string;
};

type SepayConfig = {
  bankAccount: string;
  bankAccountName: string;
  bankCode: string;
  env: "production" | "sandbox";
  expiresMinutes: number;
  qrTemplate: string;
  requireIpnSecret: boolean;
  webhookSecretKey: string;
};

function readSepayConfig(): SepayConfig {
  const env = process.env.SEPAY_ENV === "production" ? "production" : "sandbox";

  return {
    bankAccount: process.env.SEPAY_BANK_ACCOUNT ?? process.env.SEPAY_BANK_ACCOUNT_NUMBER ?? "",
    bankAccountName: process.env.SEPAY_BANK_ACCOUNT_NAME ?? "",
    bankCode: process.env.SEPAY_BANK_CODE ?? process.env.SEPAY_BANK_SHORT_NAME ?? "",
    env,
    expiresMinutes: Number(process.env.SEPAY_PAYMENT_EXPIRES_MINUTES || 30),
    qrTemplate: process.env.SEPAY_QR_TEMPLATE || "compact",
    requireIpnSecret: process.env.SEPAY_IPN_REQUIRE_SECRET === "true",
    webhookSecretKey: process.env.SEPAY_IPN_SECRET_KEY ?? process.env.SEPAY_SECRET_KEY ?? "",
  };
}

export function getSepayConfig() {
  const config = readSepayConfig();
  const missing = [
    ["SEPAY_BANK_ACCOUNT", config.bankAccount],
    ["SEPAY_BANK_CODE", config.bankCode],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    ...config,
    isConfigured: missing.length === 0,
    missing,
  };
}

export function requireSepayConfig() {
  const config = getSepayConfig();

  if (!config.isConfigured) {
    throw new ApiError(`Thiếu cấu hình SePay: ${config.missing.join(", ")}.`, 503);
  }

  return config;
}

export function createSepayOrderId() {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0");

  return `DXL-${time}-${random}`;
}

export function createSepayPaymentContent(orderId: string) {
  return orderId.slice(0, 64);
}

export function getSepayExpiresAt(minutes: number) {
  return new Date(Date.now() + Math.max(minutes, 5) * 60 * 1000);
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export function createSepayQrImageUrl(input: {
  amountVnd: number;
  paymentContent: string;
}) {
  const config = requireSepayConfig();

  return createSepayQrImageUrlForBank({
    ...input,
    bankAccount: config.bankAccount,
    bankCode: config.bankCode,
    qrTemplate: config.qrTemplate,
  });
}

export function createSepayQrImageUrlForBank(input: {
  amountVnd: number;
  bankAccount: string;
  bankCode: string;
  paymentContent: string;
  qrTemplate?: string;
}) {
  const url = new URL("https://qr.sepay.vn/img");

  url.searchParams.set("acc", input.bankAccount);
  url.searchParams.set("bank", input.bankCode);
  url.searchParams.set("amount", String(input.amountVnd));
  url.searchParams.set("des", input.paymentContent);
  url.searchParams.set("template", input.qrTemplate || "compact");

  return url.toString();
}

function findOrderIdInText(value: string | undefined) {
  return value?.match(/\bDXL-[A-Z0-9]+-[A-Z0-9]+\b/i)?.[0]?.toUpperCase();
}

export function verifySepayIpn(headers: Headers, body: unknown): SepayIpnPayload {
  const config = getSepayConfig();
  const receivedSecret = headers.get("x-secret-key");

  if (config.webhookSecretKey && receivedSecret && receivedSecret !== config.webhookSecretKey) {
    throw new ApiError("IPN SePay không hợp lệ.", 401);
  }

  if (config.requireIpnSecret && (!config.webhookSecretKey || receivedSecret !== config.webhookSecretKey)) {
    throw new ApiError("IPN SePay không hợp lệ.", 401);
  }

  const envelope = getRecord(body);
  const order = getRecord(envelope.order);
  const transaction = getRecord(envelope.transaction);
  const notificationType = getString(envelope, "notification_type");
  const orderStatus = getString(order, "order_status");
  const transactionStatus = getString(transaction, "transaction_status");
  let orderId = getString(order, "order_invoice_number");
  const transferAmount = getNumber(envelope.transferAmount);
  const transferType = getString(envelope, "transferType");
  const code = getString(envelope, "code");
  const content = getString(envelope, "content") ?? getString(envelope, "description");

  if (!orderId) {
    orderId = findOrderIdInText(code) ?? findOrderIdInText(content);
  }

  if (!orderId) {
    throw new ApiError("IPN SePay thiếu mã đơn hàng.", 400);
  }

  const isCheckoutPaid = notificationType === "ORDER_PAID" && orderStatus === "CAPTURED" && transactionStatus === "APPROVED";
  const isBankTransferPaid = transferType === "in" && transferAmount > 0;
  const isCancelled = notificationType === "TRANSACTION_VOID";
  const amount = getNumber(transaction.transaction_amount ?? order.order_amount) || transferAmount;

  return {
    amount,
    currency: getString(transaction, "transaction_currency") ?? getString(order, "order_currency") ?? "VND",
    orderId,
    raw: body,
    referenceNumber: getString(transaction, "id") ?? getString(envelope, "referenceCode"),
    status: isCheckoutPaid || isBankTransferPaid ? "paid" : isCancelled ? "cancelled" : "pending",
    transactionId: getString(transaction, "transaction_id") ?? getString(transaction, "id") ?? String(envelope.id ?? ""),
  };
}
