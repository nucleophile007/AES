import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { senderId, senderRole, recipientId, recipientRole, content } = body;
    
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
    const message = await prisma.message.create({
      data: {
        senderId,
        senderRole,
        recipientId,
        recipientRole,
        content,
      }
    });
    
    return NextResponse.json({
      success: true,
      messageId: message.id
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