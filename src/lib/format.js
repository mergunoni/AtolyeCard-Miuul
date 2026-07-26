/** Shared formatters. Currency comes from the product, never hardcoded. */
export const formatPrice = (price, currency = "TRY") =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
