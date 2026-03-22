type ScheduleReminderResult = {
  messageId: string | null;
  scheduledFor: Date | null;
};

function getBaseUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/$/, '');
}

function getQstashConfig() {
  const qstashUrl = process.env.QSTASH_URL?.replace(/\/$/, '');
  const qstashToken = process.env.QSTASH_TOKEN;
  const baseUrl = getBaseUrl();

  if (!qstashUrl || !qstashToken || !baseUrl) {
    return null;
  }

  return { qstashUrl, qstashToken, baseUrl };
}

export async function scheduleReminderForClass(args: {
  scheduleId: number;
  classStartUtc: Date;
  leadMinutes?: number;
}): Promise<ScheduleReminderResult> {
  const config = getQstashConfig();
  if (!config) {
    return { messageId: null, scheduledFor: null };
  }

  const leadMinutes = args.leadMinutes ?? Number(process.env.SCHEDULE_REMINDER_LEAD_MINUTES || '60');
  const scheduledFor = new Date(args.classStartUtc.getTime() - leadMinutes * 60 * 1000);

  const delayMs = scheduledFor.getTime() - Date.now();
  if (delayMs <= 0) {
    return { messageId: null, scheduledFor: null };
  }

  const delaySeconds = Math.ceil(delayMs / 1000);
  const destinationUrl = `${config.baseUrl}/api/jobs/schedule-reminders`;

  const response = await fetch(`${config.qstashUrl}/v2/publish/${encodeURIComponent(destinationUrl)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.qstashToken}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delaySeconds}s`,
    },
    body: JSON.stringify({ scheduleId: args.scheduleId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to schedule reminder job: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { messageId?: string };
  return {
    messageId: data.messageId || null,
    scheduledFor,
  };
}

export async function cancelReminderForClass(messageId?: string | null): Promise<void> {
  if (!messageId) return;

  const config = getQstashConfig();
  if (!config) return;

  const response = await fetch(`${config.qstashUrl}/v2/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.qstashToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Failed to cancel reminder job ${messageId}: ${response.status} ${errorText}`);
  }
}
