export function formatAmount(amount, language = "en", zeroLabel) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return zeroLabel ?? (language === "ar" ? "٠ جنيه" : "0 EGP");
  }
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}
