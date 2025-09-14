import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockStudents = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    grade: "10th Grade",
    schoolName: "Granite Bay High School",
    parentName: "Michael Johnson",
    parentEmail: "michael.johnson@email.com",
    parentPhone: "(555) 123-4567",
    program: "Academic Tutoring",
    gpa: 3.8,
    overallGrade: "A-",
    createdAt: "2025-08-15T10:00:00Z",
    updatedAt: "2025-09-09T15:30:00Z",
  },
];

const mockEvents = [
  {
    id: 1,
    studentId: 1,
    title: "Math Tutoring Session",
    date: "2025-09-10",
    time: "3:00 PM",
    type: "tutoring",
    description: "Weekly algebra tutoring session",
    location: "Online",
  },
  {
    id: 2,
    studentId: 1,
    title: "SAT Practice Test",
    date: "2025-09-12",
    time: "9:00 AM",
    type: "test",
    description: "Full-length SAT practice test",
    location: "Testing Center",
  },
  {
    id: 3,
    studentId: 1,
    title: "Science Fair Project Review",
    date: "2025-09-15",
    time: "2:00 PM",
    type: "review",
    description: "Review progress on climate change project",
    location: "Online",
  },
];

const mockProgress = [
  {
    id: 1,
    studentId: 1,
    subject: "Mathematics",
    currentGrade: "A-",
    percentage: 92,
    assignmentsCompleted: 5,
    totalAssignments: 6,
    lastUpdated: "2025-09-09T12:00:00Z",
  },
  {
    id: 2,
    studentId: 1,
    subject: "Science",
    currentGrade: "A",
    percentage: 95,
    assignmentsCompleted: 3,
    totalAssignments: 3,
    lastUpdated: "2025-09-08T14:30:00Z",
  },
  {
    id: 3,
    studentId: 1,
    subject: "SAT Prep",
    currentGrade: "B+",
    percentage: 88,
    assignmentsCompleted: 4,
    totalAssignments: 5,
    lastUpdated: "2025-09-07T16:45:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const dataType = searchParams.get('type'); // 'profile', 'events', 'progress', 'all'

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const student = mockStudents.find(s => s.id === parseInt(studentId));
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const response: any = {
      success: true,
      student,
    };

    if (!dataType || dataType === 'events' || dataType === 'all') {
      response.events = mockEvents.filter(event => event.studentId === parseInt(studentId));
    }

    if (!dataType || dataType === 'progress' || dataType === 'all') {
      response.progress = mockProgress.filter(progress => progress.studentId === parseInt(studentId));
    }

    // Calculate dashboard statistics
    if (!dataType || dataType === 'stats' || dataType === 'all') {
      const totalAssignments = mockProgress.reduce((sum, p) => sum + p.totalAssignments, 0);
      const completedAssignments = mockProgress.reduce((sum, p) => sum + p.assignmentsCompleted, 0);
      const averagePercentage = mockProgress.reduce((sum, p) => sum + p.percentage, 0) / mockProgress.length;
      
      response.stats = {
        totalAssignments,
        completedAssignments,
        pendingAssignments: totalAssignments - completedAssignments,
        averageGrade: Math.round(averagePercentage),
        completionRate: Math.round((completedAssignments / totalAssignments) * 100),
        studyStreak: 12, // Mock data
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, ...updates } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Find and update student (in real app, update in database)
    const studentIndex = mockStudents.findIndex(student => student.id === parseInt(studentId));
    
    if (studentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    mockStudents[studentIndex] = {
      ...mockStudents[studentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      student: mockStudents[studentIndex],
      message: 'Student profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update student profile' },
      { status: 500 }
    );
  }
}
