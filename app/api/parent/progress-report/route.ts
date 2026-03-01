import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!hasRole(user, 'parent')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const url = new URL(request.url);
        const studentIdParam = url.searchParams.get('studentId');

        if (!studentIdParam) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        const studentId = parseInt(studentIdParam);

        // Verify this student belongs to this parent
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Check relationship (simplified logic: check if student.parentAccountId matches or email matches)
        const parentAccount = await prisma.parentAccount.findUnique({
            where: { email: user.email }
        });

        if (!parentAccount) {
            return NextResponse.json({ error: 'Parent account not found' }, { status: 404 });
        }

        // Check relationship
        const isParent = student.parentAccountId === parentAccount.id || student.parentEmail === user.email;

        if (!isParent) {
            return NextResponse.json({ error: 'Unauthorized: Student does not belong to this parent' }, { status: 403 });
        }

        // Fetch only published and visible reports
        const reports = await prisma.progressReport.findMany({
            where: {
                studentId: studentId,
                isVisible: true,
                status: 'published'
            },
            include: {
                teacher: {
                    select: { name: true, email: true }
                },
                student: {
                    select: { name: true, email: true, grade: true }
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
