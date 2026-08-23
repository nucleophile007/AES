import { describe, expect, it } from 'vitest';
import {
  getGoogleMeetingLink,
  isEligibleGoogleMeeting,
  normalizeEmail,
  validateMinutesText,
  zonedDayBounds,
} from './meeting-minutes';

describe('meeting minutes domain helpers', () => {
  it('normalizes attendee email addresses', () => {
    expect(normalizeEmail(' Student@Example.COM ')).toBe('student@example.com');
  });

  it('calculates timezone day bounds including DST transitions', () => {
    const normal = zonedDayBounds('2026-08-22', 'Asia/Kolkata');
    expect(normal.end.getTime() - normal.start.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(normal.start.toISOString()).toBe('2026-08-21T18:30:00.000Z');

    const springForward = zonedDayBounds('2026-03-08', 'America/Los_Angeles');
    expect(springForward.end.getTime() - springForward.start.getTime()).toBe(23 * 60 * 60 * 1000);
  });

  it('only accepts completed teacher-organized timed meetings', () => {
    const event = {
      id: 'event-1', status: 'confirmed', organizer: { self: true },
      start: { dateTime: '2026-08-22T09:00:00Z' }, end: { dateTime: '2026-08-22T10:00:00Z' },
    };
    expect(isEligibleGoogleMeeting(event, new Date('2026-08-22T10:00:00Z'))).toBe(true);
    expect(isEligibleGoogleMeeting({ ...event, organizer: { self: false } }, new Date('2026-08-22T11:00:00Z'))).toBe(false);
    expect(isEligibleGoogleMeeting({ ...event, start: { date: '2026-08-22' } }, new Date('2026-08-23T11:00:00Z'))).toBe(false);
  });

  it('extracts a video conference link', () => {
    expect(getGoogleMeetingLink({ conferenceData: { entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc' }] } })).toBe('https://meet.google.com/abc');
  });

  it('validates non-empty bounded minutes text', () => {
    expect(validateMinutesText('  Decisions and actions  ')).toBe('Decisions and actions');
    expect(() => validateMinutesText('   ')).toThrow('required');
    expect(() => validateMinutesText('x'.repeat(20_001))).toThrow('cannot exceed');
  });
});
