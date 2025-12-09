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
    
    // Fetch all active teachers/mentors from database
    const teachers = await prisma.teacher.findMany({
      where: {
        isActivated: true, // Only show activated teachers
      },
      select: {
        id: true,
        name: true,
        email: true,
        programs: true,
      },
      orderBy: {
        name: 'asc', // Sort alphabetically
      },
    });
    
    // Format mentors data for parent chat interface
    const mentors = teachers.map(teacher => ({
      id: `mentor-${teacher.id}`,
      name: teacher.name,
      email: teacher.email,
      programs: teacher.programs,
      // Generate subtitle from programs
      subtitle: teacher.programs.length > 0 
        ? teacher.programs.join(", ") + " Mentor"
        : "Mentor",
    }));
    
    return NextResponse.json({
      success: true,
      mentors
    });
    
  } catch (error) {
    console.error('Error fetching parent mentors:', error);
    
    // Import the error handler dynamically to avoid circular dependencies
    const { handlePrismaError } = await import('../../../../lib/error-handlers');
    
    // Check if it's a Prisma error
    if (error instanceof Error && 
        (error.message.includes('prisma') || error.message.includes('PrismaClient'))) {
      return handlePrismaError(error);
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}

