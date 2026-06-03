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

const sepayBankCodeAliases: Record<string, string> = {
  icb: "vietinbank",
  viettinbank: "vietinbank",
  viettintbank: "vietinbank",
};

export function normalizeSepayBankCode(bankCode: string) {
  const normalized = bankCode.trim();
  const alias = sepayBankCodeAliases[normalized.toLowerCase()];

  return alias ?? normalized;
}

function readSepayConfig(): SepayConfig {
  const env = process.env.SEPAY_ENV === "production" ? "production" : "sandbox";

  return {
    bankAccount: process.env.SEPAY_BANK_ACCOUNT ?? process.env.SEPAY_BANK_ACCOUNT_NUMBER ?? "",
    bankAccountName: process.env.SEPAY_BANK_ACCOUNT_NAME ?? "",
    bankCode: normalizeSepayBankCode(process.env.SEPAY_BANK_CODE ?? process.env.SEPAY_BANK_SHORT_NAME ?? ""),
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

  return `DXL${time}${random}`;
}

function getRequiredMemoPrefix(bankCode?: string) {
  const normalizedBankCode = normalizeSepayBankCode(bankCode ?? "").toLowerCase();

  if (normalizedBankCode === "vietinbank") {
    return "SEVQR";
  }

  return "";
}

export function createSepayPaymentContent(orderId: string, bankCode?: string) {
  const configuredPrefix = process.env.SEPAY_PAYMENT_CONTENT_PREFIX?.trim();
  const prefix = configuredPrefix || getRequiredMemoPrefix(bankCode);
  const content = [prefix, orderId].filter(Boolean).join(" ");

  return content.slice(0, 64);
}

export function getSepayExpiresAt(minutes: number) {
  return new Date(Date.now() + Math.max(minutes, 5) * 60 * 1000);
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function getNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    return Number(normalized || 0);
  }

  return Number(value ?? 0);
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
  const bankCode = normalizeSepayBankCode(input.bankCode);

  url.searchParams.set("acc", input.bankAccount);
  url.searchParams.set("bank", bankCode);
  url.searchParams.set("amount", String(input.amountVnd));
  url.searchParams.set("des", input.paymentContent);
  url.searchParams.set("template", input.qrTemplate || "compact");

  return url.toString();
}

function findOrderIdInText(value: string | undefined) {
  return value?.match(/\bDXL(?:-[A-Z0-9]+-[A-Z0-9]+|[A-Z0-9]{1,30})\b/i)?.[0]?.toUpperCase();
}

export function verifySepayIpn(headers: Headers, body: unknown): SepayIpnPayload {
  const config = getSepayConfig();
  const authorization = headers.get("authorization") ?? "";
  const receivedSecret = headers.get("x-secret-key") ?? authorization.replace(/^Apikey\s+/i, "");

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
  const transferAmount = getNumber(envelope.transferAmount ?? envelope.amount);
  const transferType = getString(envelope, "transferType") ?? getString(envelope, "transfer_type");
  const code = getString(envelope, "code") ?? getString(envelope, "payment_code");
  const content = getString(envelope, "content") ?? getString(envelope, "description");

  if (!orderId) {
    orderId = findOrderIdInText(code) ?? findOrderIdInText(content) ?? findOrderIdInText(getString(envelope, "description"));
  }

  if (!orderId) {
    throw new ApiError("IPN SePay thiếu mã đơn hàng.", 400);
  }

  const isCheckoutPaid = notificationType === "ORDER_PAID" && orderStatus === "CAPTURED" && transactionStatus === "APPROVED";
  const isBankTransferPaid = (transferType === "in" || transferType === "credit") && transferAmount > 0;
  const isCancelled = notificationType === "TRANSACTION_VOID";
  const amount = getNumber(transaction.transaction_amount ?? order.order_amount) || transferAmount;

  return {
    amount,
    currency: getString(transaction, "transaction_currency") ?? getString(order, "order_currency") ?? "VND",
    orderId,
    raw: body,
    referenceNumber: getString(transaction, "id") ?? getString(envelope, "referenceCode") ?? getString(envelope, "reference_code"),
    status: isCheckoutPaid || isBankTransferPaid ? "paid" : isCancelled ? "cancelled" : "pending",
    transactionId:
      getString(transaction, "transaction_id") ??
      getString(transaction, "id") ??
      getString(envelope, "transaction_id") ??
      getString(envelope, "id") ??
      "",
  };
}
