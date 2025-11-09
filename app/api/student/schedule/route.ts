import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  console.log('Student Schedule API called');
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Extract query parameters
    const url = new URL(request.url);
    const studentEmail = url.searchParams.get('studentEmail');
    
    // Check if user is authorized (either a student or a teacher)
    // Teachers can view student schedules too
    if (!hasRole(user, 'student') && !hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    console.log('Student email from query:', studentEmail);
    console.log('User email from auth:', user.email);

    let student;
    if (studentEmail) {
      // Fetch student by email
      console.log('Searching for student with email:', studentEmail);
      student = await prisma.student.findUnique({
        where: { email: studentEmail },
        select: { id: true, name: true, email: true }
      });
    } else {
      // Use authenticated user's email
      console.log('Using authenticated user email:', user.email);
      student = await prisma.student.findUnique({
        where: { email: user.email },
        select: { id: true, name: true, email: true }
      });
    }
    
    console.log('Found student:', student);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    // Fetch class schedules
    console.log('Fetching schedules for studentId:', student.id);
    const schedules = await prisma.classSchedule.findMany({
      where: {
        studentId: student.id
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Format dates for JSON response
    const formattedSchedules = schedules.map(schedule => {
      // Create a new object to avoid type issues
      return {
        ...schedule,
        date: schedule.date ? new Date(schedule.date).toISOString() : null,
        createdAt: schedule.createdAt ? new Date(schedule.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : new Date().toISOString()
      };
    });

    return NextResponse.json({ 
      success: true, 
      schedules: formattedSchedules
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching student schedules:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch schedules' 
    }, { status: 500 });
  }
}
