import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!hasRole(user, 'student')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const url = new URL(request.url);
        const reportId = url.searchParams.get('reportId');

        // Find student
        const student = await prisma.student.findUnique({
            where: { email: user.email }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }

        // Get single report by ID
        if (reportId) {
            const report = await prisma.progressReport.findFirst({
                where: {
                    id: parseInt(reportId),
                    studentId: student.id,
                    isVisible: true,
                    status: 'published'
                },
                include: {
                    teacher: {
                        select: { name: true, email: true }
                    }
                }
            });

            if (!report) {
                return NextResponse.json({ error: 'Report not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, report });
        }

        // Fetch all published and visible reports for this student
        const reports = await prisma.progressReport.findMany({
            where: {
                studentId: student.id,
                isVisible: true,
                status: 'published'
            },
            include: {
                teacher: {
                    select: { name: true, email: true }
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
