import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const url = new URL(request.url);
        const studentId = url.searchParams.get('studentId');
        const teacherEmail = url.searchParams.get('teacherEmail');
        const status = url.searchParams.get('status'); // Filter by status
        const reportId = url.searchParams.get('reportId'); // Get single report

        // Get single report by ID
        if (reportId) {
            const report = await prisma.progressReport.findUnique({
                where: { id: parseInt(reportId) },
                include: {
                    teacher: { select: { name: true, email: true } },
                    student: { select: { name: true, email: true, grade: true, program: true } }
                }
            });

            if (!report) {
                return NextResponse.json({ error: 'Report not found' }, { status: 404 });
            }

            const teacher = await prisma.teacher.findUnique({
                where: { email: user.email },
                select: { id: true }
            });

            if (!teacher || report.teacherId !== teacher.id) {
                return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
            }

            return NextResponse.json({ success: true, report });
        }

        if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Verify teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: teacherEmail || user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
        }

        // Build where clause
        const whereClause: any = {
            teacherId: teacher.id,
        };

        // Optionally filter by student
        if (studentId) {
            whereClause.studentId = parseInt(studentId);
        }

        // Optionally filter by status
        if (status) {
            whereClause.status = status;
        }

        // Fetch reports
        const reports = await prisma.progressReport.findMany({
            where: whereClause,
            include: {
                teacher: {
                    select: { name: true, email: true }
                },
                student: {
                    select: { id: true, name: true, email: true, grade: true, program: true }
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
        const user = await getUserFromRequest(request);
        if (!user || !hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const {
            studentId,
            reportPeriod,
            subject,
            overallProgress,
            progressRating,
            attendanceRate,
            milestonesAchieved,
            publications,
            skillsImproved,
            strengthsAreas,
            improvementAreas,
            nextSteps,
            recommendations,
            parentNotes,
            classParticipation,
            homeworkCompletion,
            isVisible = true,
            status = 'draft',
            teacherEmail
        } = data;

        if (!studentId || !overallProgress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (teacherEmail && String(teacherEmail).toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Find teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: teacherEmail || user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Verify teacher has access to this student
        const teacherStudent = await prisma.teacherStudent.findFirst({
            where: {
                teacherId: teacher.id,
                studentId: parseInt(studentId)
            }
        });

        if (!teacherStudent) {
            return NextResponse.json({ error: 'You are not assigned to this student' }, { status: 403 });
        }

        const report = await prisma.progressReport.create({
            data: {
                studentId: parseInt(studentId),
                teacherId: teacher.id,
                reportPeriod,
                subject,
                overallProgress,
                progressRating: progressRating ? parseInt(progressRating) : null,
                attendanceRate: attendanceRate ? parseFloat(attendanceRate) : null,
                milestonesAchieved: milestonesAchieved ? JSON.stringify(milestonesAchieved) : null,
                publications: publications ? JSON.stringify(publications) : null,
                skillsImproved: skillsImproved ? JSON.stringify(skillsImproved) : null,
                strengthsAreas: strengthsAreas ? JSON.stringify(strengthsAreas) : null,
                improvementAreas: improvementAreas ? JSON.stringify(improvementAreas) : null,
                nextSteps: nextSteps ? JSON.stringify(nextSteps) : null,
                recommendations,
                parentNotes,
                classParticipation,
                homeworkCompletion: homeworkCompletion ? parseFloat(homeworkCompletion) : null,
                isVisible,
                status
            },
            include: {
                student: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ success: true, report });

    } catch (error: any) {
        console.error('Error creating progress report:', error);
        return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
    }
}

// UPDATE existing progress report
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || !hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { reportId, ...updateData } = data;

        if (!reportId) {
            return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
        }

        // Find teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Verify ownership
        const existingReport = await prisma.progressReport.findFirst({
            where: {
                id: parseInt(reportId),
                teacherId: teacher.id
            }
        });

        if (!existingReport) {
            return NextResponse.json({ error: 'Report not found or unauthorized' }, { status: 404 });
        }

        // Prepare update data
        const updatePayload: any = {};
        if (updateData.reportPeriod !== undefined) updatePayload.reportPeriod = updateData.reportPeriod;
        if (updateData.subject !== undefined) updatePayload.subject = updateData.subject;
        if (updateData.overallProgress !== undefined) updatePayload.overallProgress = updateData.overallProgress;
        if (updateData.progressRating !== undefined) updatePayload.progressRating = parseInt(updateData.progressRating);
        if (updateData.attendanceRate !== undefined) updatePayload.attendanceRate = parseFloat(updateData.attendanceRate);
        if (updateData.milestonesAchieved !== undefined) updatePayload.milestonesAchieved = JSON.stringify(updateData.milestonesAchieved);
        if (updateData.publications !== undefined) updatePayload.publications = JSON.stringify(updateData.publications);
        if (updateData.skillsImproved !== undefined) updatePayload.skillsImproved = JSON.stringify(updateData.skillsImproved);
        if (updateData.strengthsAreas !== undefined) updatePayload.strengthsAreas = JSON.stringify(updateData.strengthsAreas);
        if (updateData.improvementAreas !== undefined) updatePayload.improvementAreas = JSON.stringify(updateData.improvementAreas);
        if (updateData.nextSteps !== undefined) updatePayload.nextSteps = JSON.stringify(updateData.nextSteps);
        if (updateData.recommendations !== undefined) updatePayload.recommendations = updateData.recommendations;
        if (updateData.parentNotes !== undefined) updatePayload.parentNotes = updateData.parentNotes;
        if (updateData.classParticipation !== undefined) updatePayload.classParticipation = updateData.classParticipation;
        if (updateData.homeworkCompletion !== undefined) updatePayload.homeworkCompletion = parseFloat(updateData.homeworkCompletion);
        if (updateData.isVisible !== undefined) updatePayload.isVisible = updateData.isVisible;
        if (updateData.status !== undefined) updatePayload.status = updateData.status;

        const updatedReport = await prisma.progressReport.update({
            where: { id: parseInt(reportId) },
            data: updatePayload,
            include: {
                student: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ success: true, report: updatedReport });

    } catch (error: any) {
        console.error('Error updating progress report:', error);
        return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
    }
}

// DELETE progress report
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || !hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { reportId } = data;

        if (!reportId) {
            return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
        }

        // Find teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Verify ownership
        const existingReport = await prisma.progressReport.findFirst({
            where: {
                id: parseInt(reportId),
                teacherId: teacher.id
            }
        });

        if (!existingReport) {
            return NextResponse.json({ error: 'Report not found or unauthorized' }, { status: 404 });
        }

        await prisma.progressReport.delete({
            where: { id: parseInt(reportId) }
        });

        return NextResponse.json({ success: true, message: 'Report deleted successfully' });

    } catch (error: any) {
        console.error('Error deleting progress report:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
    }
}

// PATCH - Publish/Unpublish progress report
export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || !hasRole(user, 'teacher')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { reportId, action } = data;

        if (!reportId || !action) {
            return NextResponse.json({ error: 'Report ID and action required' }, { status: 400 });
        }

        // Find teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: user.email }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Verify ownership
        const existingReport = await prisma.progressReport.findFirst({
            where: {
                id: parseInt(reportId),
                teacherId: teacher.id
            }
        });

        if (!existingReport) {
            return NextResponse.json({ error: 'Report not found or unauthorized' }, { status: 404 });
        }

        let updateData: any = {};

        if (action === 'publish') {
            updateData = {
                status: 'published',
                isVisible: true
            };
        } else if (action === 'unpublish') {
            updateData = {
                status: 'draft',
                isVisible: true
            };
        } else {
            return NextResponse.json({ error: 'Invalid action. Use "publish" or "unpublish"' }, { status: 400 });
        }

        const updatedReport = await prisma.progressReport.update({
            where: { id: parseInt(reportId) },
            data: updateData
        });

        return NextResponse.json({ success: true, report: updatedReport });

    } catch (error: any) {
        console.error('Error updating report status:', error);
        return NextResponse.json({ success: false, error: 'Failed to update report status' }, { status: 500 });
    }
}
