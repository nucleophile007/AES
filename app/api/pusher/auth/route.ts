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

    // Extract conversation ID from channel name
    // Format: private-conversation-{studentId}-{teacherId}
    const match = channel_name.match(/private-conversation-(\d+)-(\d+)/);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid channel name' },
        { status: 400 }
      );
    }

    const studentId = parseInt(match[1], 10);
    const teacherId = parseInt(match[2], 10);

    if (hasRole(user, 'student')) {
      if (user.id !== studentId) {
        return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
      }
    } else if (hasRole(user, 'teacher')) {
      if (user.id !== teacherId) {
        return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized channel access' }, { status: 403 });
    }

    const link = await prisma.teacherStudent.findFirst({
      where: { teacherId, studentId },
      select: { id: true },
    });

    if (!link) {
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
