export function formatVnd(amount: number) {
  if (amount <= 0) {
    return "Miễn phí";
  }

  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}
