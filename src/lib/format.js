export function formatPrice(price) {
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(price) || 0);
  return `$${amount}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
