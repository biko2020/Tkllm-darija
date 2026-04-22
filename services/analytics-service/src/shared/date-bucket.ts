/**
 * Utility for time-binning logic (hourly, daily, weekly).
 */

export function bucketByHour(date: Date): string {
  return date.toISOString().slice(0, 13) + ":00:00Z";
}

export function bucketByDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function bucketByWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(d.setUTCDate(diff));
  return monday.toISOString().slice(0, 10);
}
