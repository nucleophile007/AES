import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const teacherId = user.id;
    
    // Get all messages for this teacher to identify unique conversations
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: teacherId, senderRole: 'teacher' },
          { recipientId: teacherId, recipientRole: 'teacher' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Group by recipient to get unique conversations
    const conversationMap = new Map<string, any>();
    
    for (const msg of allMessages) {
      const isSender = msg.senderId === teacherId;
      const recipientId = isSender ? msg.recipientId : msg.senderId;
      const recipientRole = isSender ? msg.recipientRole : msg.senderRole;
      
      const key = `${recipientRole}-${recipientId}`;
      
      // Only process if we haven't seen this conversation yet
      if (!conversationMap.has(key)) {
        // Get recipient name
        let recipientName = 'Unknown';
        if (recipientRole === 'student') {
          const student = await prisma.student.findUnique({
            where: { id: recipientId },
            select: { name: true }
          });
          recipientName = student?.name || 'Unknown Student';
        } else if (recipientRole === 'parent') {
          // For parent, we'll get the name from the message senderName when available
          // For now, use a generic name - actual name will show in individual messages
          recipientName = 'Parent';
        }
        
        // Use current message as last message (since we ordered by desc)
        conversationMap.set(key, {
          recipientId,
          recipientRole,
          recipientName,
          lastMessage: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
          lastMessageTime: msg.createdAt,
          unreadCount: 0 // Will calculate below
        });
      }
    }
    
    // Calculate unread counts for each conversation
    const conversations = await Promise.all(
      Array.from(conversationMap.values()).map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            senderId: conv.recipientId,
            recipientId: teacherId,
            senderRole: conv.recipientRole,
            recipientRole: 'teacher',
            isRead: false
          }
        });
        return { ...conv, unreadCount };
      })
    );
    
    return NextResponse.json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error('Error fetching teacher conversations:', error);
    
    const { handlePrismaError } = await import('../../../../lib/error-handlers');
    
    if (error instanceof Error && 
        (error.message.includes('prisma') || error.message.includes('PrismaClient'))) {
      return handlePrismaError(error);
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

