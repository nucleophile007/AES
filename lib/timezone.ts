/**
 * Timezone Utilities
 * 
 * Best practice: Store all times in UTC, display in user's local timezone
 * - On input: Convert from user's local timezone to UTC
 * - On display: Convert from UTC to viewer's local timezone
 */

/**
 * Get the user's timezone from browser
 * Falls back to UTC if not available
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC';
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Convert a local date/time to UTC
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:MM)
 * @param timezone - Source timezone (e.g., 'America/Los_Angeles', 'Asia/Kolkata')
 * @returns ISO string in UTC
 */
export function localToUTC(date: string, time: string, timezone: string): string {
  // Create a date string with the timezone
  const dateTimeStr = `${date}T${time}:00`;
  
  // Create date in the specified timezone
  const localDate = new Date(dateTimeStr);
  
  // Use Intl to properly convert
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  // Get UTC offset for the timezone
  const parts = formatter.formatToParts(localDate);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  
  // Reconstruct the date with proper timezone handling
  const utcDate = new Date(
    Date.UTC(
      parseInt(getPart('year')),
      parseInt(getPart('month')) - 1,
      parseInt(getPart('day')),
      parseInt(getPart('hour')),
      parseInt(getPart('minute')),
      parseInt(getPart('second'))
    )
  );
  
  // Calculate the offset and adjust
  const targetDate = new Date(`${date}T${time}:00`);
  const offset = getTimezoneOffset(timezone, targetDate);
  
  return new Date(targetDate.getTime() - offset).toISOString();
}

/**
 * Get timezone offset in milliseconds for a specific timezone and date
 */
export function getTimezoneOffset(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return tzDate.getTime() - utcDate.getTime();
}

/**
 * Convert UTC to local datetime in a specific timezone
 * @param utcDateString - ISO string or Date in UTC
 * @param timezone - Target timezone (e.g., 'America/Los_Angeles')
 * @returns Object with formatted date and time strings
 */
export function utcToLocal(
  utcDateString: string | Date,
  timezone: string
): { date: string; time: string; dateTime: Date } {
  const utcDate = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const localDate = formatter.format(utcDate); // Returns YYYY-MM-DD format
  const localTime = timeFormatter.format(utcDate); // Returns HH:MM format
  
  // Create a Date object representing the local time
  const localDateTime = new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
  
  return {
    date: localDate,
    time: localTime,
    dateTime: localDateTime,
  };
}

/**
 * Format a UTC date for display in user's timezone
 * @param utcDateString - ISO string or Date in UTC
 * @param timezone - Target timezone (defaults to browser timezone)
 * @param options - Intl.DateTimeFormat options
 */
export function formatDateTime(
  utcDateString: string | Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone();
  const date = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Format just the date portion
 */
export function formatDate(
  utcDateString: string | Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone();
  const date = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Format just the time portion
 */
export function formatTime(
  utcDateString: string | Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone();
  const date = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Create a full datetime in UTC from date string, time string, and timezone
 * This is the main function to use when saving schedule data
 */
export function createUTCDateTime(date: string, time: string, timezone: string): Date {
  // Parse the local date and time
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create a date object in the local timezone
  const localDateStr = `${date}T${time}:00`;
  
  // Get the offset for the specified timezone at this date/time
  const tempDate = new Date(localDateStr);
  const offset = getTimezoneOffset(timezone, tempDate);
  
  // Create the UTC date by subtracting the offset
  const utcTime = tempDate.getTime() - offset;
  return new Date(utcTime);
}

/**
 * Convert a time string from one timezone to another
 * Useful for displaying times in different timezones
 */
export function convertTime(
  date: string,
  time: string,
  fromTimezone: string,
  toTimezone: string
): { date: string; time: string } {
  const utcDate = createUTCDateTime(date, time, fromTimezone);
  return utcToLocal(utcDate, toTimezone);
}

/**
 * Get a human-readable timezone name
 */
export function getTimezoneName(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Common timezone list for dropdown selection
 */
export const COMMON_TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];
