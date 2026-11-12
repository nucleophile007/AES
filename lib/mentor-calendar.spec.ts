import { describe, expect, it } from 'vitest';
import { localDateTimeToUtc, zonedDate, zonedTime } from './mentor-calendar';

describe('mentor calendar timezone conversion', () => {
  it('converts local times using the timezone rules on the selected date', () => {
    const instant = localDateTimeToUtc('2026-02-12T09:30', 'America/Los_Angeles');
    expect(instant?.toISOString()).toBe('2026-02-12T17:30:00.000Z');
    expect(instant && zonedDate(instant, 'America/Los_Angeles')).toBe('2026-02-12');
    expect(instant && zonedTime(instant, 'America/Los_Angeles')).toBe('9:30 AM');
  });

  it('rejects local times skipped by daylight-saving changes', () => {
    expect(localDateTimeToUtc('2026-03-08T02:30', 'America/Los_Angeles')).toBeNull();
  });

  it('rejects repeated local times instead of choosing one occurrence', () => {
    expect(localDateTimeToUtc('2026-11-01T01:30', 'America/Los_Angeles')).toBeNull();
  });

  it('rejects invalid calendar dates and timezones', () => {
    expect(localDateTimeToUtc('2026-02-30T09:30', 'UTC')).toBeNull();
    expect(localDateTimeToUtc('2026-02-12T09:30', 'Invalid/Timezone')).toBeNull();
  });
});
