import { Prisma } from '@/generated/prisma';
import { localDateTimeToUtc, zonedDate } from '@/lib/mentor-calendar';

const LEGACY_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function getLegacyScheduleRange(
  date: Date,
  startTime: string,
  endTime: string,
  timezone: string
): { startsAt: Date; endsAt: Date } | null {
  if (!LEGACY_TIME_PATTERN.test(startTime) || !LEGACY_TIME_PATTERN.test(endTime)) return null;
  const dateKey = date.toISOString().slice(0, 10);
  const startsAt = localDateTimeToUtc(`${dateKey}T${startTime}`, timezone);
  let endDateKey = dateKey;
  if (endTime <= startTime) {
    const nextDay = new Date(`${dateKey}T12:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    endDateKey = nextDay.toISOString().slice(0, 10);
  }
  const endsAt = localDateTimeToUtc(`${endDateKey}T${endTime}`, timezone);
  return startsAt && endsAt ? { startsAt, endsAt } : null;
}

export async function hasTeacherScheduleConflict(
  db: Prisma.TransactionClient,
  teacherId: number,
  startsAt: Date,
  endsAt: Date,
  timezone: string,
  ignoreSlotId?: number
): Promise<boolean> {
  const overlappingSlot = await db.mentorAvailabilitySlot.findFirst({
    where: {
      teacherId,
      ...(ignoreSlotId ? { id: { not: ignoreSlotId } } : {}),
      status: { in: ['OPEN', 'BOOKED'] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true },
  });
  if (overlappingSlot) return true;

  const searchStart = new Date(startsAt.getTime() - 36 * 60 * 60 * 1000);
  const searchEnd = new Date(endsAt.getTime() + 36 * 60 * 60 * 1000);
  const schedules = await db.classSchedule.findMany({
    where: {
      teacherId,
      date: { gte: searchStart, lte: searchEnd },
      status: { not: 'cancelled' },
    },
    select: {
      startDateTime: true,
      endDateTime: true,
      date: true,
      startTime: true,
      endTime: true,
      timezone: true,
    },
  });

  return schedules.some((schedule) => {
    const range = schedule.startDateTime && schedule.endDateTime
      ? { startsAt: schedule.startDateTime, endsAt: schedule.endDateTime }
      : getLegacyScheduleRange(
          schedule.date,
          schedule.startTime,
          schedule.endTime,
          schedule.timezone || timezone
        );
    return Boolean(range && range.startsAt < endsAt && range.endsAt > startsAt);
  });
}

export function calendarScheduleTimes(startsAt: Date, endsAt: Date, timezone: string) {
  return {
    date: new Date(`${zonedDate(startsAt, timezone)}T12:00:00.000Z`),
    startTime: new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(startsAt),
    endTime: new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(endsAt),
  };
}
