import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// Helper function to generate random colors based on subject
function generateRandomColor(subject: string): string {
  const colors = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#FF6D01', // Orange
    '#46BDC6', // Teal
    '#7F45E5', // Purple
    '#F06292', // Pink
  ];
  
  // Simple hash function to create consistent colors for the same subject
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = ((hash << 5) - hash) + subject.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Extract query parameters
    const url = new URL(request.url);
    const teacherEmail = url.searchParams.get('teacherEmail');
    const studentId = url.searchParams.get('studentId');
    
    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    let teacher;
    if (teacherEmail) {
      // Fetch teacher by email
      teacher = await prisma.teacher.findUnique({
        where: { email: teacherEmail },
        select: { id: true, name: true, email: true }
      });
    } else {
      // Use authenticated user's email
      teacher = await prisma.teacher.findUnique({
        where: { email: user.email },
        select: { id: true, name: true, email: true }
      });
    }

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    
    // Build query filter based on parameters
    const filter: any = {
      teacherId: teacher.id
    };
    
    // Add studentId filter if provided
    if (studentId) {
      filter.studentId = parseInt(studentId);
    }
    
    // Fetch class schedules
    const schedules = await prisma.classSchedule.findMany({
      where: filter,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            program: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
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
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch schedules' 
    }, { status: 500 });
  }
}

// POST endpoint to create or update a class schedule
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const requestData = await request.json();
    const { 
      id,
      title, 
      description,
      studentId, 
      teacherId,
      subject,
      startTime,
      endTime,
      location,
      meetingLink,
      status,
      color
    } = requestData;

    // Validate required fields
    if (!title || !studentId || !subject || !startTime || !endTime) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, studentId, subject, startTime, endTime'
      }, { status: 400 });
    }

    // Determine the teacher ID to use (from request or from user)
    let finalTeacherId = teacherId;
    if (!finalTeacherId) {
      // Get the teacher ID from the authenticated user
      const teacher = await prisma.teacher.findUnique({
        where: { email: user.email },
        select: { id: true }
      });
      
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
      
      finalTeacherId = teacher.id;
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    let schedule;
    
    if (id) {
      // Update existing schedule
      schedule = await prisma.classSchedule.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          subject,
          location,
          date: requestData.date ? new Date(requestData.date) : null,
          startTime, // Just store the time string directly
          endTime,   // Just store the time string directly
          meetingLink: requestData.meetingLink,
          status: requestData.status || "scheduled",
          color: requestData.color || generateRandomColor(subject),
          updatedAt: new Date()
        }
      });
    } else {
      // Create new schedule
      schedule = await prisma.classSchedule.create({
        data: {
          title,
          description,
          studentId: parseInt(studentId),
          teacherId: finalTeacherId,
          subject,
          date: requestData.date ? new Date(requestData.date) : null,
          startTime, // Just store the time string directly
          endTime,   // Just store the time string directly
          location,
          meetingLink: requestData.meetingLink || null,
          status: "scheduled",
          color: generateRandomColor(subject),
          updatedAt: new Date()
        }
      });
    }

    // Format dates for response
    const formattedSchedule = {
      ...schedule,
      date: schedule.date ? new Date(schedule.date).toISOString() : null,
      createdAt: schedule.createdAt ? new Date(schedule.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      schedule: formattedSchedule 
    }, { status: id ? 200 : 201 });
    
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to save schedule' 
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a class schedule
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Extract the schedule ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing schedule ID'
      }, { status: 400 });
    }

    // Verify the schedule belongs to this teacher
    const teacherEmail = user.email;
    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: parseInt(id) }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check if the schedule belongs to this teacher
    if (schedule.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this schedule' }, { status: 403 });
    }

    // Delete the schedule
    await prisma.classSchedule.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Schedule deleted successfully' 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to delete schedule' 
    }, { status: 500 });
  }
}