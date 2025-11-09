import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

// This route allows creating test messages to help debug the chat functionality
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Parse request body
    const body = await request.json();
    const { studentId, teacherId, content, direction } = body;
    
    if (!studentId || !teacherId || !content) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: studentId, teacherId, content" 
      }, { status: 400 });
    }
    
    // Determine sender and recipient based on direction
    let senderId: number, recipientId: number, senderRole: string, recipientRole: string;
    
    if (direction === 'teacher-to-student') {
      senderId = teacherId;
      recipientId = studentId;
      senderRole = 'teacher';
      recipientRole = 'student';
    } else {
      // Default is student-to-teacher
      senderId = studentId;
      recipientId = teacherId;
      senderRole = 'student';
      recipientRole = 'teacher';
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        senderRole,
        recipientId,
        recipientRole,
        content,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        createdAt: message.createdAt,
        senderRole: message.senderRole,
        recipientRole: message.recipientRole
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || String(error),
        stack: error.stack || 'No stack trace available'
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to show the form for creating messages
export async function GET(request: NextRequest) {
  try {
    const prisma = new PrismaClient();
    
    // Get a list of teachers and students for the form
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, email: true },
      take: 10
    });
    
    const students = await prisma.student.findMany({
      select: { id: true, name: true, email: true },
      take: 10
    });
    
    await prisma.$disconnect();
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Create Test Message</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        h1 {
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        select, textarea, button {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }
        button:hover {
          background-color: #45a049;
        }
        #result {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Create Test Message</h1>
        <p>Use this form to create test messages between students and teachers for debugging.</p>
        
        <div class="form-group">
          <label for="teacher">Select Teacher:</label>
          <select id="teacher">
            ${teachers.map(t => `<option value="${t.id}">${t.name} (${t.email})</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="student">Select Student:</label>
          <select id="student">
            ${students.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="direction">Message Direction:</label>
          <select id="direction">
            <option value="student-to-teacher">Student to Teacher</option>
            <option value="teacher-to-student">Teacher to Student</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="content">Message Content:</label>
          <textarea id="content" rows="4" placeholder="Type your message here..."></textarea>
        </div>
        
        <button onclick="sendMessage()">Create Message</button>
        
        <div id="result"></div>
      </div>
      
      <script>
        async function sendMessage() {
          const teacherId = document.getElementById('teacher').value;
          const studentId = document.getElementById('student').value;
          const direction = document.getElementById('direction').value;
          const content = document.getElementById('content').value;
          
          if (!teacherId || !studentId || !content) {
            alert('Please fill out all fields');
            return;
          }
          
          try {
            const response = await fetch('/api/debug/create-message', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                teacherId: parseInt(teacherId),
                studentId: parseInt(studentId),
                direction,
                content
              })
            });
            
            const data = await response.json();
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<h3>' + (data.success ? 'Success!' : 'Error!') + '</h3>' + 
                                  '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            resultDiv.style.display = 'block';
            resultDiv.style.backgroundColor = data.success ? '#e7f7e7' : '#f7e7e7';
            
          } catch (error) {
            console.error('Error:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<h3>Error!</h3><p>' + error.message + '</p>';
            resultDiv.style.display = 'block';
            resultDiv.style.backgroundColor = '#f7e7e7';
          }
        }
      </script>
    </body>
    </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || String(error) }, 
      { status: 500 }
    );
  }
}