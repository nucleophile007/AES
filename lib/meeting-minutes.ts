import type { calendar_v3 } from 'googleapis';

export const MEETING_MINUTES_MAX_LENGTH = 20_000;

export function normalizeEmail(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function zonedDayBounds(dateKey: string, timeZone: string): { start: Date; end: Date } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !isValidTimeZone(timeZone)) {
    throw new Error('Invalid date or timezone');
  }
  const [year, month, day] = dateKey.split('-').map(Number);
  const toUtc = (y: number, m: number, d: number) => {
    const guess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(guess);
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value || 0);
    const represented = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return new Date(guess.getTime() - (represented - guess.getTime()));
  };
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + 1);
  return { start: toUtc(year, month, day), end: toUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()) };
}

export function googleEventDateTimes(event: calendar_v3.Schema$Event): { start: Date; end: Date } | null {
  if (!event.start?.dateTime || !event.end?.dateTime) return null;
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  return Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ? null : { start, end };
}

export function isEligibleGoogleMeeting(event: calendar_v3.Schema$Event, now = new Date()): boolean {
  const times = googleEventDateTimes(event);
  return Boolean(
    event.id && event.status !== 'cancelled' && event.organizer?.self === true && times && times.end <= now
  );
}

export function getGoogleMeetingLink(event: calendar_v3.Schema$Event): string | null {
  if (event.hangoutLink) return event.hangoutLink;
  return event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri || null;
}

export function validateMinutesText(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Meeting minutes are required');
  const text = value.trim();
  if (!text) throw new Error('Meeting minutes are required');
  if (text.length > MEETING_MINUTES_MAX_LENGTH) throw new Error(`Meeting minutes cannot exceed ${MEETING_MINUTES_MAX_LENGTH} characters`);
  return text;
}
