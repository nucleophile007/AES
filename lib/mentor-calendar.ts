import { sendMail } from '@/lib/mailer';

const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function getZonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function localPartsMatch(date: Date, timezone: string, expected: string): boolean {
  const parts = getZonedParts(date, timezone);
  const key = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
  return key === expected;
}

export function localDateTimeToUtc(value: unknown, timezone: unknown): Date | null {
  if (typeof value !== 'string' || typeof timezone !== 'string') return null;
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw] = match;
  const [year, month, day, hour, minute] = [yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw].map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const normalized = new Date(target);
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day ||
    normalized.getUTCHours() !== hour ||
    normalized.getUTCMinutes() !== minute
  ) return null;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    const offsets = new Set<number>();
    for (let delta = -36; delta <= 36; delta += 3) {
      const instant = target + delta * 60 * 60 * 1000;
      const zoned = getZonedParts(new Date(instant), timezone);
      offsets.add(Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute) - instant);
    }
    const candidates = Array.from(offsets)
      .map((offset) => new Date(target - offset))
      .filter((candidate) => localPartsMatch(candidate, timezone, value));

    // Reject daylight-saving gaps and repeated wall-clock times rather than guessing.
    return candidates.length === 1 ? candidates[0] : null;
  } catch {
    return null;
  }
}

export function zonedTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function zonedDate(date: Date, timezone: string): string {
  const parts = getZonedParts(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function zonedClock(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export async function sendBookingNotification(args: {
  recipients: string[];
  subject: string;
  title: string;
  details: string[];
  replyTo?: string;
}): Promise<string | null> {
  const recipients = Array.from(new Set(args.recipients.map((email) => email.trim().toLowerCase()).filter(Boolean)));
  const results = await Promise.allSettled(recipients.map((email) => sendMail({
    to: email,
    subject: args.subject,
    text: [args.title, ...args.details].join('\n'),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a"><h2>${escapeHtml(args.title)}</h2><ul>${args.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul><p>This update is also available in your AES dashboard.</p></div>`,
    replyTo: args.replyTo,
  })));
  return results.some((result) => result.status === 'rejected')
    ? 'The calendar was updated, but one or more email notifications could not be sent.'
    : null;
}
