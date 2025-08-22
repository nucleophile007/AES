import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handler(req: Request) {
  try {
    const {
      studentEmail,
      email,
      parentName,
      parentEmail,
      parentPhone,
      studentName,
      grade,
      program,
      preferredDateTime,
      schoolName,
      submittedAt,
      bookingId,
    } = await req.json();

    console.log("📊 Processing Google Sheets update for booking:", bookingId);

    // Prepare booking data with correct field names for Google Sheets
    const bookingData = {
      email: studentEmail || email,
      parentName: parentName,
      parentEmail: parentEmail,
      parentContact: parentPhone,
      studentName: studentName,
      studentGrade: grade,
      program: program,
      preferredTime: preferredDateTime,
      schoolName: schoolName,
      submittedAt: submittedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      bookingId: bookingId,
    };

    // Try direct Google Sheets submission first
    try {
      const directResponse = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      if (directResponse.ok) {
        console.log('✅ Direct Google Sheets submission successful');
        return Response.json({ success: true });
      } else {
        const directErrorText = await directResponse.text();
        console.error("❌ Direct Google Sheets Error:", directErrorText);
        throw new Error(`Direct submission failed: ${directErrorText}`);
      }
    } catch (directError) {
      console.error("❌ Direct Google Sheets failed:", directError);
      
      // Fallback to QStash webhook if direct fails
      try {
        const response = await fetch(`${process.env.QSTASH_URL}/v2/publish/${encodeURIComponent(process.env.QSTASH_WEBHOOK_URL!)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        if (response.ok) {
          console.log("✅ Google Sheets updated via QStash webhook");
          return Response.json({ success: true });
        } else {
          console.error("❌ QStash webhook failed:", response.status);
          throw new Error(`QStash webhook failed: ${response.status}`);
        }
      } catch (webhookError) {
        console.error("❌ Both Google Sheets methods failed:", webhookError);
        return Response.json({ error: 'All Google Sheets methods failed' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error("❌ Google Sheets job error:", error);
    return Response.json({ error: 'Sheets job failed' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
