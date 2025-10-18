import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get counts for different entities
    const messageCount = await prisma.message.count();
    const teacherCount = await prisma.teacher.count();
    const studentCount = await prisma.student.count();
    
    // Recent messages (just a few for the summary)
    const recentMessages = await prisma.message.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AES Messaging Debug Console</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fc;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background-color: #2c3e50;
          color: white;
          padding: 20px;
          margin-bottom: 30px;
        }
        h1 {
          margin: 0;
        }
        .subtitle {
          color: #ecf0f1;
          font-weight: normal;
        }
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .card-header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .stat {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
          color: #3498db;
        }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .tool-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        .tool-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .tool-icon {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .tool-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .tool-description {
          color: #7f8c8d;
          flex-grow: 1;
          margin-bottom: 15px;
        }
        .btn {
          display: inline-block;
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
          cursor: pointer;
          text-align: center;
        }
        .btn:hover {
          background-color: #2980b9;
        }
        .btn-secondary {
          background-color: #95a5a6;
        }
        .btn-secondary:hover {
          background-color: #7f8c8d;
        }
        .btn-success {
          background-color: #2ecc71;
        }
        .btn-success:hover {
          background-color: #27ae60;
        }
        .messages-preview {
          margin-top: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
        }
        .message-item {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .message-item:last-child {
          border-bottom: none;
        }
        .message-sender {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .message-content {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
        }
        .message-time {
          color: #95a5a6;
          font-size: 0.9em;
          margin-top: 5px;
          text-align: right;
        }
        .direction-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          margin-left: 10px;
        }
        .teacher-to-student {
          background-color: #e3f2fd;
          color: #0d47a1;
        }
        .student-to-teacher {
          background-color: #e8f5e9;
          color: #1b5e20;
        }
        footer {
          margin-top: 30px;
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9em;
          padding: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <h1>AES Messaging Debug Console</h1>
          <p class="subtitle">Diagnostic tools for troubleshooting the messaging system</p>
        </div>
      </header>
      
      <div class="container">
        <div class="dashboard">
          <div class="card">
            <div class="card-header">Messages</div>
            <div class="stat">${messageCount}</div>
            <p>Total messages in database</p>
          </div>
          
          <div class="card">
            <div class="card-header">Teachers</div>
            <div class="stat">${teacherCount}</div>
            <p>Registered teachers</p>
          </div>
          
          <div class="card">
            <div class="card-header">Students</div>
            <div class="stat">${studentCount}</div>
            <p>Registered students</p>
          </div>
        </div>
        
        <h2>Diagnostic Tools</h2>
        
        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-icon">📝</div>
            <div class="tool-title">Create Test Message</div>
            <div class="tool-description">Create test messages between students and teachers to simulate conversations.</div>
            <a href="/api/debug/create-message" class="btn">Open Tool</a>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">👁️</div>
            <div class="tool-title">View All Messages</div>
            <div class="tool-description">Browse all messages in the system, with filtering and search capabilities.</div>
            <a href="/api/debug/view-messages" class="btn">Open Tool</a>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">🔍</div>
            <div class="tool-title">Database Query Tool</div>
            <div class="tool-description">Query messages directly from the database for specific users or content.</div>
            <a href="/api/debug/messages" class="btn">Open Tool</a>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">🧪</div>
            <div class="tool-title">Message Test Page</div>
            <div class="tool-description">Test the messaging interface for both student and teacher views.</div>
            <a href="/api/debug/test-messages" class="btn btn-secondary">Coming Soon</a>
          </div>
        </div>
        
        <h2>Recent Messages</h2>
        <p>Showing the ${recentMessages.length} most recent messages in the system:</p>
        
        <div class="messages-preview">
          ${recentMessages.length > 0 ? recentMessages.map(msg => `
            <div class="message-item">
              <div class="message-sender">
                ${msg.senderRole.charAt(0).toUpperCase() + msg.senderRole.slice(1)} #${msg.senderId}
                <span class="direction-badge ${msg.senderRole}-to-${msg.recipientRole}">
                  → ${msg.recipientRole.charAt(0).toUpperCase() + msg.recipientRole.slice(1)} #${msg.recipientId}
                </span>
              </div>
              <div class="message-content">${escapeHtml(msg.content)}</div>
              <div class="message-time">${new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          `).join('') : `
            <div class="message-item">
              <p>No messages found in the database.</p>
            </div>
          `}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="/api/debug/view-messages" class="btn btn-success">View All Messages</a>
        </div>
      </div>
      
      <footer>
        <div class="container">
          AES Messaging Debug Console - For development and troubleshooting only
        </div>
      </footer>
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
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}