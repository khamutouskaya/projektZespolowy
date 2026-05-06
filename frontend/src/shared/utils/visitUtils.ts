export const MONTHS_FULL = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

export function formatVisitDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTHS_FULL[month - 1]} ${year}`;
}

export function getVisitInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2);
}
