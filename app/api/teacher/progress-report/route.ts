import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const url = new URL(request.url);
        const studentId = url.searchParams.get('studentId');
        const teacherEmail = url.searchParams.get('teacherEmail');

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        // Verify teacher
        let teacherId = user.id; // Default assumption if user.id is teacher id (may vary based on auth implementation)
        // Actually auth user.id is usually User ID, creating a Teacher lookup is safer:

        let teacher;
        if (teacherEmail) {
            teacher = await prisma.teacher.findUnique({ where: { email: teacherEmail } });
        } else {
            teacher = await prisma.teacher.findUnique({ where: { email: user.email } });
        }

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
        }

        // Fetch reports
        const reports = await prisma.progressReport.findMany({
            where: {
                studentId: parseInt(studentId),
                // teacherId: teacher.id // Optional: if we want to see ALL reports for the student or only this teacher's? Usually all for a student.
            },
            include: {
                teacher: {
                    select: { name: true }
                }
            },
            orderBy: {
                reportDate: 'desc'
            }
        });

        return NextResponse.json({ success: true, reports });

    } catch (error: any) {
        console.error('Error fetching progress reports:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user || !hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const {
            studentId,
            overallProgress,
            milestonesAchieved,
            publications,
            nextSteps,
            teacherEmail
        } = data;

        if (!studentId || !overallProgress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: teacherEmail || user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        const report = await prisma.progressReport.create({
            data: {
                studentId: parseInt(studentId),
                teacherId: teacher.id,
                overallProgress,
                milestonesAchieved: milestonesAchieved ? JSON.stringify(milestonesAchieved) : null,
                publications: publications ? JSON.stringify(publications) : null,
                nextSteps: nextSteps ? JSON.stringify(nextSteps) : null
            }
        });

        return NextResponse.json({ success: true, report });

    } catch (error: any) {
        console.error('Error creating progress report:', error);
        return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
    }
}
