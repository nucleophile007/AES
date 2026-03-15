import { google, calendar_v3 } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google-calendar/callback`
);

// Scopes required for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

/**
 * Generate the URL for Google OAuth consent screen
 */
export function getGoogleAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Create an authenticated Google Calendar API client
 */
export function getCalendarClient(accessToken: string, refreshToken?: string): calendar_v3.Calendar {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Create an event in Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  event: {
    title: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    location?: string;
    meetingLink?: string;
    timezone?: string; // User's timezone
    attendees?: Array<{ email: string; displayName?: string }>;
    reminderMinutes?: number;
  }
): Promise<string | null> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);
    
    // Use provided timezone or default to America/Los_Angeles
    const timeZone = event.timezone || 'America/Los_Angeles';
    
    const calendarEvent: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startTime,
        timeZone,
      },
      end: {
        dateTime: event.endTime,
        timeZone,
      },
      location: event.location || undefined,
      attendees: event.attendees,
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'email',
            minutes: event.reminderMinutes ?? 60,
          },
        ],
      },
    };

    // Add meeting link to description if provided
    if (event.meetingLink) {
      calendarEvent.description = `${calendarEvent.description}\n\nMeeting Link: ${event.meetingLink}`;
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
      sendUpdates: 'all',
    });

    return response.data.id || null;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}

/**
 * Update an existing event in Google Calendar
 */
export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string,
  event: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    meetingLink?: string;
    timezone?: string;
    attendees?: Array<{ email: string; displayName?: string }>;
    reminderMinutes?: number;
  }
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);
    
    const timeZone = event.timezone || 'America/Los_Angeles';
    
    const calendarEvent: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startTime,
        timeZone,
      },
      end: {
        dateTime: event.endTime,
        timeZone,
      },
      location: event.location || undefined,
      attendees: event.attendees,
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'email',
            minutes: event.reminderMinutes ?? 60,
          },
        ],
      },
    };

    if (event.meetingLink) {
      calendarEvent.description = `${calendarEvent.description}\n\nMeeting Link: ${event.meetingLink}`;
    }

    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: calendarEvent,
      sendUpdates: 'all',
    });

    return true;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(accessToken, refreshToken);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiry: Date;
} | null> {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await auth.refreshAccessToken();
    
    if (credentials.access_token && credentials.expiry_date) {
      return {
        accessToken: credentials.access_token,
        expiry: new Date(credentials.expiry_date),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}
