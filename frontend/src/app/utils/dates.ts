/** Local today's date as `YYYY-MM-DD` (minimum selectable date in forms). */
export function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Formats an ISO date string to `DD/MM/YYYY`. */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

/** True when the visit date/time is strictly before now (local timezone). */
export function isVisitSlotInPast(dateStr: string, time: string): boolean {
  if (!dateStr || !time) return false
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const slotStart = new Date(y, m - 1, d, hours, minutes ?? 0, 0, 0)
  return slotStart.getTime() < Date.now()
}
