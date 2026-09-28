import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '../../../../lib/pusher-server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Pusher sends data as form data, not JSON
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const socket_id = params.get('socket_id');
    const channel_name = params.get('channel_name');
    
    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Extract participant IDs from channel name
    // Format: private-conversation-{id1}-{id2} (where IDs are numerically sorted)
    const match = channel_name.match(/private-conversation-(\d+)-(\d+)/);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid channel name' },
        { status: 400 }
      );
    }

    const id1 = parseInt(match[1], 10);
    const id2 = parseInt(match[2], 10);

    // Verify current authenticated user is one of the participants
    if (hasRole(user, 'student')) {
      if (user.id !== id1 && user.id !== id2) {
        return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
      }

      const studentId = user.id;
      const teacherId = user.id === id1 ? id2 : id1;

      // Check if student is assigned to this teacher or if teacher exists
      const link = await prisma.teacherStudent.findFirst({
        where: { teacherId, studentId },
        select: { id: true },
      });

      if (!link) {
        const teacherExists = await prisma.teacher.findUnique({
          where: { id: teacherId },
          select: { id: true },
        });

        if (!teacherExists) {
          return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
        }
      }
    } else if (hasRole(user, 'teacher')) {
      if (user.id !== id1 && user.id !== id2) {
        return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
      }

      const teacherId = user.id;
      const studentId = user.id === id1 ? id2 : id1;

      const link = await prisma.teacherStudent.findFirst({
        where: { teacherId, studentId },
        select: { id: true },
      });

      if (!link) {
        const studentExists = await prisma.student.findUnique({
          where: { id: studentId },
          select: { id: true },
        });

        if (!studentExists) {
          return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
        }
      }
    } else if (hasRole(user, 'parent')) {
      const parentStudents = await prisma.student.findMany({
        where: { parentAccountId: user.id },
        select: { id: true },
      });
      const studentIds = parentStudents.map((s) => s.id);
      if (!studentIds.includes(id1) && !studentIds.includes(id2)) {
        return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
    }
    
    const pusher = getPusherServer();
    const authResponse = pusher.authorizeChannel(socket_id, channel_name);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
