import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockAssignments = [
  {
    id: 1,
    title: "Algebra II Problem Set #12",
    subject: "Mathematics",
    description: "Complete problems 1-25 from Chapter 8, focusing on quadratic equations and factoring.",
    dueDate: "2025-09-15",
    totalPoints: 100,
    status: "pending",
    program: "Academic Tutoring",
    grade: "10th Grade",
  },
  {
    id: 2,
    title: "Essay: Impact of Climate Change",
    subject: "Science",
    description: "Write a 3-page essay discussing the effects of climate change on marine ecosystems.",
    dueDate: "2025-09-18",
    totalPoints: 150,
    status: "submitted",
    program: "Academic Tutoring",
    grade: "10th Grade",
  },
  {
    id: 3,
    title: "SAT Practice Test #3",
    subject: "SAT Prep",
    description: "Complete the full-length practice test and submit your answers for review.",
    dueDate: "2025-09-12",
    totalPoints: 200,
    status: "overdue",
    program: "SAT Coaching",
    grade: "10th Grade",
  },
  {
    id: 4,
    title: "Chemistry Lab Report",
    subject: "Science",
    description: "Write a detailed lab report on the chemical reactions observed during the experiment.",
    dueDate: "2025-09-20",
    totalPoints: 120,
    status: "pending",
    program: "Academic Tutoring",
    grade: "10th Grade",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const program = searchParams.get('program');

    // Filter assignments based on query parameters
    let filteredAssignments = mockAssignments;

    if (status) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.status === status);
    }

    if (program) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.program === program);
    }

    return NextResponse.json({
      success: true,
      assignments: filteredAssignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subject,
      description,
      dueDate,
      totalPoints,
      program,
      grade,
    } = body;

    // Validate required fields
    if (!title || !subject || !description || !dueDate || !totalPoints) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new assignment (in real app, save to database)
    const newAssignment = {
      id: mockAssignments.length + 1,
      title,
      subject,
      description,
      dueDate,
      totalPoints: parseInt(totalPoints),
      status: "pending",
      program: program || "Academic Tutoring",
      grade: grade || "10th Grade",
    };

    // In a real application, you would save this to the database
    mockAssignments.push(newAssignment);

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
      message: 'Assignment created successfully',
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Find and update assignment (in real app, update in database)
    const assignmentIndex = mockAssignments.findIndex(assignment => assignment.id === parseInt(id));
    
    if (assignmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    mockAssignments[assignmentIndex] = {
      ...mockAssignments[assignmentIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      assignment: mockAssignments[assignmentIndex],
      message: 'Assignment updated successfully',
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
