import Pusher from 'pusher';

// Singleton instance
//hhh
let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  
  return pusherInstance;
}

// Helper to trigger new message event (fire and forget)
export function triggerNewMessage(
  conversationId: string,
  message: {
    id: string;
    senderId: number;
    recipientId: number;
    content: string;
    timestamp: string;
    senderName: string;
    senderRole: 'student' | 'teacher' | 'parent';
  }
) {
  const pusher = getPusherServer();
  
  // Fire and forget - don't wait for Pusher response
  pusher.trigger(
    `private-conversation-${conversationId}`,
    'new-message',
    message
  )
    .then(() => {
      console.log(`Message triggered for conversation ${conversationId}`);
    })
    .catch((error) => {
      console.error('Error triggering Pusher event:', error);
    });
  
  // Return immediately
  return { success: true };
}

// Helper to trigger typing indicator
export async function triggerTypingIndicator(
  conversationId: string,
  userId: number,
  userName: string,
  isTyping: boolean
) {
  const pusher = getPusherServer();
  
  try {
    await pusher.trigger(
      `private-conversation-${conversationId}`,
      'typing',
      {
        userId,
        userName,
        isTyping,
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error triggering typing indicator:', error);
    return { success: false, error };
  }
}

// Helper to get conversation ID (consistent format)
// Works for any role combination: student-teacher, parent-teacher, etc.
export function getConversationId(
  participant1Id: number, 
  participant2Id: number
): string {
  // Always use smaller ID first for consistency
  const [id1, id2] = [participant1Id, participant2Id].sort((a, b) => a - b);
  return `${id1}-${id2}`;
}

// Legacy function for backward compatibility
export function getStudentTeacherConversationId(studentId: number, teacherId: number): string {
  return getConversationId(studentId, teacherId);
}
