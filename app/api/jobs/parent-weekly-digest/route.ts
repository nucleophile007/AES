import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function handler(req: Request) {
  try {
    let targetParentId: number | undefined;

    try {
      const body = await req.json();
      targetParentId = body.parentId ? Number(body.parentId) : undefined;
    } catch {
      // Allow trigger without body for scheduled cron runs
    }

    const now = new Date();
    const pastSevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch students with parent info
    const students = await prisma.student.findMany({
      where: targetParentId
        ? { parentAccountId: targetParentId }
        : {
            OR: [
              { parentAccountId: { not: null } },
              { parentEmail: { not: '' } },
            ],
          },
      include: {
        parentAccount: {
          select: { id: true, name: true, email: true },
        },
        submissions: {
          where: {
            updatedAt: { gte: pastSevenDays },
          },
          include: {
            assignment: { select: { title: true, totalPoints: true, subject: true } },
          },
        },
        assignedAssignments: {
          where: {
            dueDate: { gte: now, lte: nextSevenDays },
            isActive: true,
          },
          select: { title: true, dueDate: true, subject: true },
        },
        classSchedules: {
          where: {
            date: { gte: pastSevenDays, lte: nextSevenDays },
          },
          select: { title: true, date: true, startTime: true, endTime: true, subject: true, status: true },
        },
        progressReports: {
          where: {
            status: 'published',
            isVisible: true,
            reportDate: { gte: pastSevenDays },
          },
          take: 1,
          orderBy: { reportDate: 'desc' },
          select: { reportPeriod: true, overallProgress: true, subject: true },
        },
      },
    });

    let digestsSent = 0;
    let digestsAttempted = 0;

    for (const student of students) {
      const parentEmail = student.parentAccount?.email || student.parentEmail;
      const parentName = student.parentAccount?.name || student.parentName || 'Parent';

      if (!parentEmail || !parentEmail.includes('@')) continue;

      // Submissions summary
      const graded = student.submissions.filter((s) => s.grade !== null);
      const totalPointsEarned = graded.reduce((acc, s) => acc + (s.grade || 0), 0);
      const totalPointsPossible = graded.reduce((acc, s) => acc + (s.assignment.totalPoints || 100), 0);
      const avgScore = totalPointsPossible > 0 ? Math.round((totalPointsEarned / totalPointsPossible) * 100) : null;

      const recentGradedSummary = graded.length > 0
        ? `${graded.length} graded (${avgScore !== null ? `${avgScore}% avg` : ''}) - Latest: ${graded[0].assignment.title}${graded[0].feedback ? ` ("${graded[0].feedback}")` : ''}`
        : student.submissions.length > 0
        ? `${student.submissions.length} submitted, awaiting grading`
        : 'No assignments submitted this week';

      // Upcoming assignments
      const upcomingAssCount = student.assignedAssignments.length;
      const upcomingAssSummary = upcomingAssCount > 0
        ? `${upcomingAssCount} upcoming - ${student.assignedAssignments.map((a) => a.title).slice(0, 2).join(', ')}`
        : 'All caught up! No assignments due this week';

      // Schedules summary
      const upcomingClasses = student.classSchedules.filter((c) => new Date(c.date) >= now);
      const classesSummary = upcomingClasses.length > 0
        ? `${upcomingClasses.length} session(s) scheduled - Next: ${upcomingClasses[0].title} (${upcomingClasses[0].startTime})`
        : 'No upcoming live sessions scheduled';

      // Latest progress report
      const latestReport = student.progressReports[0];

      const details = [
        { label: 'Student', value: `${student.name} (Grade: ${student.grade || 'N/A'})` },
        { label: 'Weekly Assignment Activity', value: recentGradedSummary },
        { label: 'Upcoming Deadlines', value: upcomingAssSummary },
        { label: 'Classes & Sessions', value: classesSummary },
        ...(latestReport ? [{ label: 'Latest Progress Report', value: `${latestReport.reportPeriod || latestReport.subject}: ${latestReport.overallProgress}` }] : []),
      ];

      const notif = await sendAcademicNotification({
        recipients: [{ email: parentEmail, name: parentName }],
        subject: `Weekly Academic Progress Digest: ${student.name} | ACHARYA`,
        heading: `Weekly Academic Digest: ${student.name}`,
        message: `Here is the weekly learning summary for ${student.name}. You can review graded work, test performance, and upcoming schedules directly in your parent dashboard.`,
        details,
        actionLabel: 'Open Parent Dashboard',
        actionUrl: getApplicationUrl('/parent-dashboard'),
      });

      digestsAttempted += notif.attempted;
      digestsSent += notif.sent;
    }

    return NextResponse.json({
      success: true,
      processedStudents: students.length,
      digests: {
        attempted: digestsAttempted,
        sent: digestsSent,
      },
    });
  } catch (error) {
    console.error('Error generating weekly parent digest:', error);
    return NextResponse.json({ error: 'Failed to generate weekly parent digest' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
