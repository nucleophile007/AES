import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const studentId = parseInt(url.searchParams.get('studentId') || '0');
    const teacherId = parseInt(url.searchParams.get('teacherId') || '0');
    
    // Validate parameters
    if (!studentId || !teacherId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    
    // Verify the authenticated student is requesting their own messages
    if (user.id !== studentId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch messages between student and teacher
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: studentId,
            recipientId: teacherId,
            senderRole: 'student',
            recipientRole: 'teacher'
          },
          {
            senderId: teacherId,
            recipientId: studentId,
            senderRole: 'teacher',
            recipientRole: 'student'
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            name: true
          }
        },
        recipient: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Get the message type directly from the result
    type DbMessage = typeof messages[number];
    
    // Format messages for client
    const formattedMessages = messages.map((msg: DbMessage) => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      timestamp: msg.createdAt,
      senderName: msg.sender.name,
      senderRole: msg.senderRole,
    }));
    
    return NextResponse.json({
      success: true,
      messages: formattedMessages
    });
    
  } catch (error) {
    console.error('Error fetching student messages:', error);
    
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