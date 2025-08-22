import nodemailer from 'nodemailer';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

async function handler(req: Request) {
  try {
    const {
      studentEmail,
      parentName,
      parentEmail,
      parentPhone,
      studentName,
      grade,
      program,
      preferredDateTime,
      schoolName,
      bookingId,
    } = await req.json();

    console.log("📧 Processing email job for booking:", bookingId);

    // Admin Email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `New Session Registration - ${studentName}`,
      html: `
        <h2>New Session Registration</h2>
        <p><strong>Booking ID:</strong> #${bookingId}</p>
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Student Email:</strong> ${studentEmail}</p>
        <p><strong>Grade:</strong> ${grade}</p>
        <p><strong>School:</strong> ${schoolName || 'N/A'}</p>
        <p><strong>Parent:</strong> ${parentName} (${parentPhone})</p>
        <p><strong>Parent Email:</strong> ${parentEmail}</p>
        <p><strong>Program:</strong> ${program}</p>
        <p><strong>Preferred Time:</strong> ${preferredDateTime}</p>
        <hr>
        <p><em>Please review and confirm the session details with the family.</em></p>
      `,
      replyTo: parentEmail,
    });

    // Parent Confirmation Email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: parentEmail,
      subject: `🎉 Session Registration Confirmation - ${studentName} | ACHARYA`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px 20px; }
        .booking-details { background-color: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: bold; color: #475569; }
        .detail-value { color: #1e293b; }
        .next-steps { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
        .footer { background-color: #1e293b; color: white; padding: 20px; text-align: center; }
        .button { display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Session Registration Confirmation</h1>
            <p style="color: white; margin: 10px 0; opacity: 0.9;">ACHARYA Educational Services</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e293b;">Dear ${parentName},</h2>
            
            <p>Thank you for registering for a FREE discovery session with ACHARYA Educational Services! We're excited to help ${studentName} achieve academic excellence.</p>
            
            <div class="booking-details">
                <h3 style="color: #1e293b; margin-top: 0;">📋 Registration Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
                    <span class="detail-value">${studentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Student Email:</span>
                    <span class="detail-value">${studentEmail}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Grade:</span>
                    <span class="detail-value">${grade}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">School:</span>
                    <span class="detail-value">${schoolName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Program:</span>
                    <span class="detail-value">${program}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Date & Time:</span>
                    <span class="detail-value">${preferredDateTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">#${bookingId}</span>
                </div>
            </div>
            
            <div class="next-steps">
                <h3 style="color: #065f46; margin-top: 0;">✅ What Happens Next?</h3>
                <ul style="color: #047857; margin: 0; padding-left: 20px;">
                    <li><strong>Review Period:</strong> We'll review your request within 24 hours</li>
                    <li><strong>Confirmation Call:</strong> Our team will contact you at ${parentPhone}</li>
                    <li><strong>Session Setup:</strong> We'll confirm the exact time and provide meeting details</li>
                    <li><strong>Preparation:</strong> Any prep materials will be sent before the session</li>
                </ul>
            </div>
            
            <p>🎯 <strong>This session is completely FREE</strong> with no commitment required. Our expert mentors will assess ${studentName}'s academic needs and create a personalized learning plan.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://acharyaes.com" class="button">Visit Our Website</a>
            </div>
            
            <p>If you have any questions or need to reschedule, please don't hesitate to contact us:</p>
            <ul>
                <li>📞 Phone: <strong>(209) 920-7147</strong></li>
                <li>📧 Email: <strong>acharya.folsom@gmail.com</strong></li>
                <li>🌐 Website: <strong>acharyaes.com</strong></li>
            </ul>
            
            <p>Thank you for choosing ACHARYA Educational Services!</p>
            
            <p style="color: #64748b;">Best regards,<br>
            <strong>The ACHARYA Team</strong><br>
            Your Partners in Academic Excellence</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>ACHARYA Educational Services</strong></p>
            <p style="margin: 5px 0; opacity: 0.8;">Empowering Students • Building Futures</p>
            <p style="margin: 5px 0; opacity: 0.6;">© 2025 ACHARYA Educational Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    });

    console.log("✅ Emails sent successfully to admin and parent");
    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Email job failed:", error);
    return Response.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
