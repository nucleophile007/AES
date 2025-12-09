import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parentEmail = user.email;

    // Find all students with this parent email
    const students = await prisma.student.findMany({
      where: { 
        parentEmail: parentEmail,
        isActivated: true 
      },
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        schoolName: true,
        program: true,
        parentName: true,
        parentEmail: true,
        parentPhone: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}