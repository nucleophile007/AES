import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

// The following export makes Next.js recognize this as a Route handler
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const teacherId = parseInt(url.searchParams.get('teacherId') || '0');
    const studentIdParam = url.searchParams.get('studentId');
    const parentIdParam = url.searchParams.get('parentId');
    const recipientRoleParam = url.searchParams.get('recipientRole');
    
    // Determine recipient ID and role
    let recipientId = 0;
    let recipientRole: 'student' | 'parent' = 'student';
    
    if (recipientRoleParam) {
      // If recipientRole is explicitly provided, use it
      recipientRole = recipientRoleParam as 'student' | 'parent';
      recipientId = recipientRole === 'parent' 
        ? parseInt(parentIdParam || '0')
        : parseInt(studentIdParam || '0');
    } else if (studentIdParam) {
      // If studentId is provided, it's a student
      recipientRole = 'student';
      recipientId = parseInt(studentIdParam);
    } else if (parentIdParam) {
      // If parentId is provided, it's a parent
      recipientRole = 'parent';
      recipientId = parseInt(parentIdParam);
    }
    
    // Validate parameters
    if (!teacherId || !recipientId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }
    
    // Verify the authenticated teacher is requesting their own messages
    if (user.id !== teacherId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch messages between teacher and recipient (student or parent)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: teacherId,
            recipientId: recipientId,
            senderRole: 'teacher',
            recipientRole: recipientRole
          },
          {
            senderId: recipientId,
            recipientId: teacherId,
            senderRole: recipientRole,
            recipientRole: 'teacher'
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Get teacher and recipient names
    const [teacher, recipient] = await Promise.all([
      prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { name: true }
      }),
      recipientRole === 'student'
        ? prisma.student.findUnique({
            where: { id: recipientId },
            select: { name: true }
          })
        : Promise.resolve({ name: 'Parent' }) // Placeholder until Parent table is created
    ]);
    
    // Format messages for client
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      timestamp: msg.createdAt,
      senderName: msg.senderRole === 'teacher' 
        ? teacher?.name 
        : (recipientRole === 'student' 
            ? (recipient as any)?.name 
            : (recipient as any)?.name || 'Parent'),
      senderRole: msg.senderRole,
      isRead: msg.isRead,
      readAt: msg.readAt
    }));
    
    return NextResponse.json({
      success: true,
      messages: formattedMessages
    });
    
  } catch (error) {
    console.error('Error fetching teacher messages:', error);
    
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