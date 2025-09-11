import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockSubmissions = [
  {
    id: 1,
    studentId: 1,
    assignmentId: 2,
    assignmentTitle: "Essay: Impact of Climate Change",
    content: "Climate change has profound effects on marine ecosystems...",
    fileUrl: null,
    submittedAt: "2025-09-08T14:30:00Z",
    grade: 142,
    totalPoints: 150,
    feedback: "Excellent work! Your analysis of marine ecosystem impacts was thorough and well-researched. Consider adding more specific examples in future essays.",
    status: "graded",
    teacherName: "Dr. Sarah Wilson",
  },
  {
    id: 2,
    studentId: 1,
    assignmentId: 5,
    assignmentTitle: "Geometry Proofs Worksheet",
    content: "Proof 1: Given triangle ABC...",
    fileUrl: null,
    submittedAt: "2025-09-05T16:45:00Z",
    grade: 88,
    totalPoints: 100,
    feedback: "Good understanding of geometric principles. Work on clarity in your proof explanations.",
    status: "graded",
    teacherName: "Mr. John Davis",
  },
  {
    id: 3,
    studentId: 1,
    assignmentId: 1,
    assignmentTitle: "Algebra II Problem Set #12",
    content: "Problem 1: x² + 5x + 6 = 0...",
    fileUrl: "/uploads/algebra_solutions.pdf",
    submittedAt: "2025-09-09T10:15:00Z",
    grade: null,
    totalPoints: 100,
    feedback: null,
    status: "submitted",
    teacherName: "Mr. John Davis",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const assignmentId = searchParams.get('assignmentId');
    const status = searchParams.get('status');

    // Filter submissions based on query parameters
    let filteredSubmissions = mockSubmissions;

    if (studentId) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.studentId === parseInt(studentId)
      );
    }

    if (assignmentId) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.assignmentId === parseInt(assignmentId)
      );
    }

    if (status) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.status === status
      );
    }

    return NextResponse.json({
      success: true,
      submissions: filteredSubmissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      assignmentId,
      assignmentTitle,
      content,
      fileUrl,
    } = body;

    // Validate required fields
    if (!studentId || !assignmentId || !assignmentTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!content && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Either content or file must be provided' },
        { status: 400 }
      );
    }

    // Check if submission already exists
    const existingSubmission = mockSubmissions.find(submission => 
      submission.studentId === parseInt(studentId) && 
      submission.assignmentId === parseInt(assignmentId)
    );

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Assignment already submitted' },
        { status: 409 }
      );
    }

    // Create new submission (in real app, save to database)
    const newSubmission = {
      id: mockSubmissions.length + 1,
      studentId: parseInt(studentId),
      assignmentId: parseInt(assignmentId),
      assignmentTitle,
      content: content || null,
      fileUrl: fileUrl || null,
      submittedAt: new Date().toISOString(),
      grade: null,
      totalPoints: 100, // This would come from the assignment
      feedback: null,
      status: "submitted",
      teacherName: "Teacher", // This would be assigned based on the assignment
    };

    // In a real application, you would save this to the database
    mockSubmissions.push(newSubmission);

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      message: 'Assignment submitted successfully',
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
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
        { success: false, error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Find and update submission (in real app, update in database)
    const submissionIndex = mockSubmissions.findIndex(submission => submission.id === parseInt(id));
    
    if (submissionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    mockSubmissions[submissionIndex] = {
      ...mockSubmissions[submissionIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      submission: mockSubmissions[submissionIndex],
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
