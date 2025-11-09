import Pusher from 'pusher';

// Singleton instance
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
    senderRole: 'student' | 'teacher';
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
export function getConversationId(studentId: number, teacherId: number): string {
  // Always use smaller ID first for consistency
  const [id1, id2] = [studentId, teacherId].sort((a, b) => a - b);
  return `${id1}-${id2}`;
}
