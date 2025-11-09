import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Count unread messages for this user
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
