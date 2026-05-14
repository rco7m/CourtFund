export function parseLocalDateTime(dateText: string, timeText: string): Date | null {
  const trimmedDate = dateText.trim();
  const trimmedTime = timeText.trim();
  if (!trimmedDate) return null;

  // Prefer ISO date `YYYY-MM-DD`
  const isoMatch = trimmedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const [hh, mm] = (trimmedTime || '00:00').split(':');
    const hour = Number(hh ?? 0);
    const minute = Number(mm ?? 0);
    return new Date(Number(y), Number(m) - 1, Number(d), hour, minute, 0, 0);
  }

  // Try Date.parse for strings like "Saturday, May 17 2026"
  const base = new Date(trimmedDate);
  if (isNaN(base.getTime())) return null;
  if (!trimmedTime) return base;

  const timeMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return base;
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const dt = new Date(base);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

export function minutesFromDurationLabel(label: string): number {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes('30')) return 30;
  if (normalized.includes('90') || normalized.includes('1.5')) return 90;
  if (normalized.includes('120') || normalized.includes('2')) return 120;
  if (normalized.includes('2.5')) return 150;
  if (normalized.includes('3')) return 180;
  if (normalized.includes('hour')) {
    const match = normalized.match(/(\d+(\.\d+)?)/);
    const hours = match ? Number(match[1]) : 1;
    return Math.round(hours * 60);
  }
  return 60;
}

