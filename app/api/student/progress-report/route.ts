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

        // Students can only see their own reports
        const studentId = user.id;

        const reports = await prisma.progressReport.findMany({
            where: {
                studentId: studentId
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
