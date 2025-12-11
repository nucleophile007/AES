import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const parentId = parseInt(url.searchParams.get('parentId') || '0');
    const teacherId = parseInt(url.searchParams.get('teacherId') || '0');
    
    // Validate parameters
    if (!parentId || !teacherId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    
    // Verify the authenticated parent is requesting their own messages
    if (user.id !== parentId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch messages between parent and teacher
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: parentId,
            recipientId: teacherId,
            senderRole: 'parent',
            recipientRole: 'teacher'
          },
          {
            senderId: teacherId,
            recipientId: parentId,
            senderRole: 'teacher',
            recipientRole: 'parent'
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Get parent and teacher names
    const [parent, teacher] = await Promise.all([
      // For now, parent info comes from auth user
      Promise.resolve({ name: user.name }),
      prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { name: true }
      })
    ]);
    
    // Format messages for client
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      senderName: msg.senderRole === 'teacher' ? teacher?.name : parent?.name,
      senderRole: msg.senderRole,
      isRead: msg.isRead,
      readAt: msg.readAt
    }));
    
    return NextResponse.json({
      success: true,
      messages: formattedMessages
    });
    
  } catch (error) {
    console.error('Error fetching parent messages:', error);
    
    // Import the error handler dynamically to avoid circular dependencies
    const { handlePrismaError } = await import('../../../../lib/error-handlers');
    
    // Check if it's a Prisma error
    if (error instanceof Error && 
        (error.message.includes('prisma') || error.message.includes('PrismaClient'))) {
      return handlePrismaError(error);
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

