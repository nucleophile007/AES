import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockConversations = [
  {
    id: 1,
    studentId: 1,
    teacherId: 1,
    teacherName: "Dr. Sarah Wilson",
    teacherSubject: "Science",
    lastMessage: "Great work on your essay!",
    lastMessageTime: "2025-09-09T16:30:00Z",
    unreadCount: 1,
  },
  {
    id: 2,
    studentId: 1,
    teacherId: 2,
    teacherName: "Mr. John Davis",
    teacherSubject: "Mathematics",
    lastMessage: "Let's review the geometry proofs",
    lastMessageTime: "2025-09-08T14:20:00Z",
    unreadCount: 0,
  },
  {
    id: 3,
    studentId: 1,
    teacherId: 3,
    teacherName: "Academic Support",
    teacherSubject: "General",
    lastMessage: "Study group this Friday",
    lastMessageTime: "2025-09-07T10:15:00Z",
    unreadCount: 2,
  },
];

const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 1, // teacher
    senderName: "Dr. Sarah Wilson",
    senderType: "teacher",
    content: "Hi Alex! I've reviewed your climate change essay. Excellent work on the research and analysis!",
    timestamp: "2025-09-09T16:30:00Z",
    isRead: true,
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 1, // student
    senderName: "Alex Johnson",
    senderType: "student",
    content: "Thank you so much! I really enjoyed researching this topic. Do you have any suggestions for my next assignment?",
    timestamp: "2025-09-09T17:45:00Z",
    isRead: false,
  },
  {
    id: 3,
    conversationId: 2,
    senderId: 2, // teacher
    senderName: "Mr. John Davis",
    senderType: "teacher",
    content: "Good morning Alex! I noticed you had some difficulty with the geometry proofs in your last submission. Would you like to schedule a review session?",
    timestamp: "2025-09-08T14:20:00Z",
    isRead: true,
  },
  {
    id: 4,
    conversationId: 3,
    senderId: 3, // academic support
    senderName: "Academic Support",
    senderType: "teacher",
    content: "Reminder: Study group session this Friday at 3 PM. We'll be reviewing SAT math strategies.",
    timestamp: "2025-09-07T10:15:00Z",
    isRead: true,
  },
  {
    id: 5,
    conversationId: 3,
    senderId: 3, // academic support
    senderName: "Academic Support",
    senderType: "teacher",
    content: "Please bring your practice test results and any questions you have.",
    timestamp: "2025-09-07T10:16:00Z",
    isRead: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const conversationId = searchParams.get('conversationId');
    const type = searchParams.get('type'); // 'conversations' or 'messages'

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (type === 'conversations' || !conversationId) {
      // Return all conversations for the student
      const conversations = mockConversations.filter(conv => 
        conv.studentId === parseInt(studentId)
      );

      return NextResponse.json({
        success: true,
        conversations,
      });
    }

    // Return messages for a specific conversation
    const messages = mockMessages.filter(msg => 
      msg.conversationId === parseInt(conversationId)
    );

    const conversation = mockConversations.find(conv => 
      conv.id === parseInt(conversationId) && conv.studentId === parseInt(studentId)
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      conversationId,
      content,
      recipientId,
      recipientName,
      recipientSubject,
    } = body;

    if (!studentId || !content) {
      return NextResponse.json(
        { success: false, error: 'Student ID and content are required' },
        { status: 400 }
      );
    }

    let targetConversationId = conversationId;

    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      if (!recipientId || !recipientName) {
        return NextResponse.json(
          { success: false, error: 'Recipient information is required for new conversations' },
          { status: 400 }
        );
      }

      const newConversation = {
        id: mockConversations.length + 1,
        studentId: parseInt(studentId),
        teacherId: parseInt(recipientId),
        teacherName: recipientName,
        teacherSubject: recipientSubject || "General",
        lastMessage: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };

      mockConversations.push(newConversation);
      targetConversationId = newConversation.id.toString();
    }

    // Create the new message
    const newMessage = {
      id: mockMessages.length + 1,
      conversationId: parseInt(targetConversationId),
      senderId: parseInt(studentId),
      senderName: "Alex Johnson", // In real app, get from student data
      senderType: "student",
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    mockMessages.push(newMessage);

    // Update the conversation's last message
    const conversationIndex = mockConversations.findIndex(conv => 
      conv.id === parseInt(targetConversationId)
    );
    
    if (conversationIndex !== -1) {
      mockConversations[conversationIndex].lastMessage = content.substring(0, 50) + (content.length > 50 ? "..." : "");
      mockConversations[conversationIndex].lastMessageTime = newMessage.timestamp;
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationId: targetConversationId,
      response: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, studentId, markAsRead } = body;

    if (!conversationId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and Student ID are required' },
        { status: 400 }
      );
    }

    if (markAsRead) {
      // Mark all messages in the conversation as read for the student
      const conversationIndex = mockConversations.findIndex(conv => 
        conv.id === parseInt(conversationId) && conv.studentId === parseInt(studentId)
      );
      
      if (conversationIndex !== -1) {
        mockConversations[conversationIndex].unreadCount = 0;
      }

      // Mark individual messages as read
      mockMessages.forEach(message => {
        if (message.conversationId === parseInt(conversationId) && 
            message.senderType === "teacher") {
          message.isRead = true;
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Messages marked as read',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}
