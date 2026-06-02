export function parseBookingDateTime(dateValue, timeValue) {
  const parsedDate = String(dateValue || "").trim();
  const parsedTime = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) return null;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(parsedTime)) return null;
  const result = new Date(`${parsedDate}T${parsedTime}:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}
