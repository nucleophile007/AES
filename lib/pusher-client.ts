import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
  }

  return pusherInstance;
}

// Helper to get conversation channel name
export function getConversationChannelName(studentId: number, teacherId: number): string {
  // Always use smaller ID first for consistency
  const [id1, id2] = [studentId, teacherId].sort((a, b) => a - b);
  return `private-conversation-${id1}-${id2}`;
}
