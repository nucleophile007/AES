import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { triggerNewMessage, getConversationId } from "../../../../lib/pusher-server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Verify authentication
    console.log('[Send Message] Starting authentication...');
    const authStart = Date.now();
    const user = await getUserFromRequest(request);
    console.log(`[Send Message] Auth completed in ${Date.now() - authStart}ms`);
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    console.log('[Send Message] Parsing request body...');
    const parseStart = Date.now();
    const body = await request.json();
    const { senderId, senderRole, recipientId, recipientRole, content } = body;
    console.log(`[Send Message] Body parsed in ${Date.now() - parseStart}ms`);
    
    // Validate request data
    if (!senderId || !senderRole || !recipientId || !recipientRole || !content) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    // Verify the authenticated user is the sender
    if (user.id !== senderId || user.role !== senderRole) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Create the message
    console.log('[Send Message] Creating message in database...');
    const dbStart = Date.now();
    const message = await prisma.message.create({
      data: {
        senderId,
        senderRole,
        recipientId,
        recipientRole,
        content,
      }
    });
    console.log(`[Send Message] Message created in ${Date.now() - dbStart}ms`);
    
    // Trigger Pusher event for real-time delivery (don't await - fire and forget)
    const conversationId = getConversationId(
      senderRole === 'student' ? senderId : recipientId,
      senderRole === 'teacher' ? senderId : recipientId
    );
    
    // Fire and forget - don't wait for Pusher to respond
    triggerNewMessage(conversationId, {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      senderName: user.name,
      senderRole: message.senderRole as 'student' | 'teacher',
    });
    
    console.log(`[Send Message] Total request time: ${Date.now() - startTime}ms`);
    
    // Return immediately without waiting for Pusher
    return NextResponse.json({
      success: true,
      messageId: message.id,
      message: {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        senderName: user.name,
        senderRole: message.senderRole,
      }
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Import the error handler dynamically to avoid circular dependencies
    const { handlePrismaError } = await import('../../../../lib/error-handlers');
    
    // Check if it's a Prisma error
    if (error instanceof Error && 
        (error.message.includes('prisma') || error.message.includes('PrismaClient'))) {
      return handlePrismaError(error);
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}