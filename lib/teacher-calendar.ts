import { prisma } from '@/lib/prisma';
import { refreshAccessToken } from '@/lib/google-calendar';

export async function getTeacherCalendarCredentials(email: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      googleCalendarConnected: true,
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!teacher) return { teacher: null, accessToken: null, needsReconnect: false };
  if (!teacher.googleCalendarConnected || !teacher.googleAccessToken) {
    return { teacher, accessToken: null, needsReconnect: false };
  }

  const expired = teacher.googleTokenExpiry
    ? teacher.googleTokenExpiry.getTime() <= Date.now() + 30_000
    : false;
  if (!expired) return { teacher, accessToken: teacher.googleAccessToken, needsReconnect: false };

  if (teacher.googleRefreshToken) {
    const refreshed = await refreshAccessToken(teacher.googleRefreshToken);
    if (refreshed) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: { googleAccessToken: refreshed.accessToken, googleTokenExpiry: refreshed.expiry },
      });
      return { teacher, accessToken: refreshed.accessToken, needsReconnect: false };
    }
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      googleCalendarConnected: false,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
    },
  });
  return { teacher, accessToken: null, needsReconnect: true };
}
