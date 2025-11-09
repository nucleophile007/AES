import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    
    // Get all messages with related user info
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100, // Limit to 100 most recent messages
    });
    
    // Count total messages
    const totalCount = await prisma.message.count();
    
    // If JSON format is requested, return JSON
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        totalCount,
        messages
      });
    }
    
    // Otherwise, return HTML viewer
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Message Viewer - Debug Tool</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .stats {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .message-list {
          border: 1px solid #ddd;
          border-radius: 5px;
          overflow: hidden;
        }
        .message {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .message:last-child {
          border-bottom: none;
        }
        .message:nth-child(odd) {
          background-color: #f9f9f9;
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .message-content {
          padding: 10px;
          background-color: #fff;
          border-radius: 5px;
          border: 1px solid #eee;
        }
        .message-meta {
          color: #777;
          font-size: 0.9em;
          margin-top: 8px;
        }
        .message-direction {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          display: inline-block;
        }
        .teacher-to-student {
          background-color: #e3f2fd;
          color: #0d47a1;
        }
        .student-to-teacher {
          background-color: #e8f5e9;
          color: #1b5e20;
        }
        .tools {
          margin: 20px 0;
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
        #createMessage {
          background-color: #2196F3;
        }
        #createMessage:hover {
          background-color: #0b7dda;
        }
        #refreshBtn {
          background-color: #ff9800;
        }
        #refreshBtn:hover {
          background-color: #e68a00;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Message Viewer - Debug Tool</h1>
        
        <div class="stats">
          <p>Total Messages in Database: <strong>${totalCount}</strong></p>
          <p>Showing latest ${messages.length} messages</p>
        </div>
        
        <div class="tools">
          <button id="refreshBtn" onclick="location.reload()">Refresh Data</button>
          <button id="createMessage" onclick="location.href='/api/debug/create-message'">Create Test Message</button>
          <button onclick="downloadJSON()">Download Messages as JSON</button>
        </div>
        
        <div class="message-list">
          ${messages.map(message => `
            <div class="message">
              <div class="message-header">
                <div>
                  <span class="message-direction ${message.senderRole}-to-${message.recipientRole}">
                    ${message.senderRole} → ${message.recipientRole}
                  </span>
                </div>
                <div>ID: ${message.id}</div>
              </div>
              <div class="message-content">${escapeHtml(message.content)}</div>
              <div class="message-meta">
                <div>From: ${message.senderRole} #${message.senderId} → To: ${message.recipientRole} #${message.recipientId}</div>
                <div>Created: ${new Date(message.createdAt).toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <script>
        function downloadJSON() {
          fetch('/api/debug/view-messages?format=json')
            .then(response => response.json())
            .then(data => {
              const dataStr = JSON.stringify(data, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              
              const exportElem = document.createElement('a');
              exportElem.setAttribute('href', dataUri);
              exportElem.setAttribute('download', 'messages-' + new Date().toISOString() + '.json');
              document.body.appendChild(exportElem);
              exportElem.click();
              document.body.removeChild(exportElem);
            });
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