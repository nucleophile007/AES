import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

// This route will directly query messages in the database
// to help debug why they're not appearing in the UI
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const studentId = parseInt(url.searchParams.get('studentId') || '0');
    const teacherId = parseInt(url.searchParams.get('teacherId') || '0');
    const debug = url.searchParams.get('debug') === 'true';
    
    let responseData: any = {
      success: true
    };
    
    // Get raw messages from the database
    const messages = await prisma.message.findMany({
      take: 100 // Limit to 100 messages for safety
    });
    
    if (debug) {
      responseData.allMessages = messages;
      
      // Check if users_view exists
      try {
        const usersViewCheck = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.views
            WHERE table_name = 'users_view'
          );
        ` as Array<{exists: boolean}>;
        responseData.usersViewExists = usersViewCheck[0]?.exists;
        
        // Sample users from the view
        const usersSample = await prisma.$queryRaw`
          SELECT * FROM users_view LIMIT 5;
        `;
        responseData.usersSample = usersSample;
      } catch (e: any) {
        responseData.usersViewError = e.message || String(e);
      }
    }
    
    // If specific student and teacher IDs were provided, get filtered messages
    if (studentId && teacherId) {
      const filteredMessages = await prisma.message.findMany({
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
        }
      });
      
      responseData.filteredMessages = filteredMessages;
      
      // Also get student and teacher info for verification
      if (debug) {
        try {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { id: true, name: true, email: true }
          });
          
          const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { id: true, name: true, email: true }
          });
          
          responseData.student = student;
          responseData.teacher = teacher;
        } catch (e: any) {
          responseData.userLookupError = e.message || String(e);
        }
      }
    }
    
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || String(error),
        stack: error.stack || 'No stack trace available'
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}