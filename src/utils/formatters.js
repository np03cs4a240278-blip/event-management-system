// formatters.js — Utility functions for displaying dates and prices

export function formatDate(value) {
  if (!value) return "TBA";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Free";
  return `Rs. ${amount.toFixed(2)}`;
}
