import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma";
import { getUserFromRequest, hasRole } from "../../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!hasRole(user, "teacher")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const url = new URL(request.url);
    const studentIdParam = url.searchParams.get("studentId");
    if (!studentIdParam) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const studentId = Number(studentIdParam);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findFirst({
      where: { email: user.email },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const memberships = await prisma.studentGroupMember.findMany({
      where: {
        studentId,
        group: {
          teacherId: teacher.id,
        },
      },
      select: {
        groupId: true,
      },
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    const isTeacherAssigned = await prisma.teacherStudent.findFirst({
      where: {
        studentId,
        teacherId: teacher.id,
      },
    });

    if (!isTeacherAssigned && groupIds.length === 0) {
      return NextResponse.json({ error: "You are not assigned to this student" }, { status: 403 });
    }

    const now = new Date();

    let meetings = await prisma.classSchedule.findMany({
      where: {
        teacherId: teacher.id,
        OR: [
          { studentId },
          ...(groupIds.length ? [{ groupId: { in: groupIds } }] : []),
        ],
      },
      orderBy: [
        { date: "desc" },
        { startDateTime: "desc" },
      ],
      include: {
        teacher: { select: { name: true, email: true } },
        group: { select: { name: true } },
      },
    });

    if (
      meetings.length > 0 &&
      !Object.prototype.hasOwnProperty.call(meetings[0], "meetingMinutes")
    ) {
      const ids = meetings.map((meeting) => meeting.id);
      const rows = await prisma.$queryRaw<Array<{ id: number; meetingMinutes: string | null }>>`
        SELECT id, "meetingMinutes"
        FROM "ClassSchedule"
        WHERE id = ANY(ARRAY[${Prisma.join(ids)}]::int[])
      `;
      const minutesMap = new Map(rows.map((row) => [row.id, row.meetingMinutes]));
      meetings = meetings.map((meeting) => ({
        ...meeting,
        meetingMinutes: minutesMap.get(meeting.id) ?? null,
      }));
    }

    const pastMeetings = meetings.filter((meeting) => {
      const comparisonTime = meeting.endDateTime ?? meeting.startDateTime ?? meeting.date;
      return comparisonTime < now;
    });

    const formatted = pastMeetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      subject: meeting.subject,
      description: meeting.description,
      meetingMinutes: meeting.meetingMinutes ?? null,
      meetingLink: meeting.meetingLink ?? null,
      location: meeting.location ?? null,
      status: meeting.status,
      startTime: meeting.startTime ?? null,
      endTime: meeting.endTime ?? null,
      date: meeting.date.toISOString(),
      startDateTime: meeting.startDateTime ? meeting.startDateTime.toISOString() : null,
      endDateTime: meeting.endDateTime ? meeting.endDateTime.toISOString() : null,
      groupName: meeting.group?.name ?? null,
      teacherName: meeting.teacher?.name ?? null,
      teacherEmail: meeting.teacher?.email ?? null,
    }));

    return NextResponse.json({ success: true, meetings: formatted });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error("Error fetching meeting notes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch meeting notes",
        details: process.env.NODE_ENV === "production" ? undefined : details,
      },
      { status: 500 }
    );
  }
}
