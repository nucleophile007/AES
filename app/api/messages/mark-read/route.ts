import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messageIds } = body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messageIds array is required' },
        { status: 400 }
      );
    }

    // Mark messages as read
    const result = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        recipientId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
