import { PrismaClient } from '../../../generated/prisma';
import { qstash } from '@/lib/qstash';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Save to database FIRST - this is the most important part
    const registration = await prisma.webinarRegistration.create({
      data: {
        email: body.studentEmail,
        parentName: body.parentName,
        parentEmail: body.parentEmail,
        parentPhone: body.parentPhone,
        studentName: body.studentName,
        grade: body.grade,
        schoolName: body.schoolName || 'N/A',
        program: body.program,
        preferredTime: body.preferredDateTime,
      },
    });

    console.log("✅ Registration saved:", registration.id);

    // 2. Publish Google Sheets job - independent, no retries to avoid duplicates
    try {
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/update-sheet`,
        body: {
          ...body,
          bookingId: registration.id,
        },
        retries: 0, // No retries for sheets to avoid duplicates
      });
      console.log("✅ Google Sheets job queued");
    } catch (sheetError) {
      console.error("❌ Failed to queue Google Sheets job:", sheetError);
      // Don't fail the whole request - continue
    }

    // 3. Publish email job - independent, with retries
    try {
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/send-emails`,
        body: {
          ...body,
          bookingId: registration.id,
        },
        retries: 3, // Allow retries for emails
      });
      console.log("✅ Email job queued");
    } catch (emailError) {
      console.error("❌ Failed to queue email job:", emailError);
      // Don't fail the whole request - continue
    }

    return Response.json({ 
      success: true,
      message: 'Registration successful',
      bookingId: registration.id 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ API Error:", error);
    return Response.json({ 
      success: false, 
      error: 'Failed to save registration' 
    }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
} 