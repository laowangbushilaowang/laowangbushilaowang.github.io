export function formatMonth(value: string): string {
  const parts = value.split("-");

  if (parts.length < 2) {
    return value;
  }

  const [year, month] = parts;
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
