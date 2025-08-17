import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['parentName', 'parentEmail', 'parentPhone', 'studentName', 'studentEmail', 'grade', 'schoolName', 'program', 'preferredDateTime']
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    console.log("📊 Processing booking for:", body.studentName)

    // Prepare booking data with correct field names for Google Sheets
    const bookingData = {
      email: body.studentEmail || body.email,
      parentName: body.parentName,
      parentEmail: body.parentEmail,
      parentContact: body.parentPhone,
      studentName: body.studentName,
      studentGrade: body.grade,
      program: body.program,
      preferredTime: body.preferredDateTime,
      schoolName: body.schoolName,
      submittedAt: body.submittedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
    }

    try {
      // Send to QStash for reliable processing
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/update-sheet`,
        body: bookingData,
        retries: 3, // Retry up to 3 times for reliability
      });
      
      console.log('✅ QStash job queued successfully')
    } catch (qstashError) {
      console.error("❌ QStash Error:", qstashError)
      
      // Fallback to direct Google Sheets submission
      console.log("🔄 Attempting direct Google Sheets fallback...")
      const directResponse = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })
      
      if (!directResponse.ok) {
        const directErrorText = await directResponse.text()
        console.error("❌ Direct Google Sheets Error:", directErrorText)
        throw new Error(`Both QStash and direct submission failed. QStash: ${qstashError}, Direct: ${directErrorText}`)
      }
      
      console.log('✅ Direct Google Sheets submission successful (fallback)')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking request submitted successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error submitting booking:', error)
    return NextResponse.json({ 
      error: 'Failed to submit booking request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Booking API is active. Use POST to submit bookings.' 
  }, { status: 200 })
} 