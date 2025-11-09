'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPusherClient, getConversationChannelName } from '../lib/pusher-client';

interface Message {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
}

interface UseRealtimeMessagesOptions {
  studentId: number;
  teacherId: number;
  onNewMessage?: (message: Message) => void;
}

export function useRealtimeMessages({
  studentId,
  teacherId,
  onNewMessage,
}: UseRealtimeMessagesOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !teacherId) {
      return;
    }

    let pusher: ReturnType<typeof getPusherClient>;
    let channel: any = null;

    try {
      // Initialize Pusher
      pusher = getPusherClient();
      
      // Subscribe to the conversation channel
      const channelName = getConversationChannelName(studentId, teacherId);
      channel = pusher.subscribe(channelName);

      // Handle connection success
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`Successfully subscribed to ${channelName}`);
        setIsConnected(true);
        setError(null);
      });

      // Handle connection error
      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('Subscription error:', err);
        setError('Failed to connect to messaging service');
        setIsConnected(false);
      });

      // Listen for new messages
      channel.bind('new-message', (message: Message) => {
        console.log('Received new message:', message);
        if (onNewMessage) {
          onNewMessage(message);
        }
      });

      // Cleanup function
      return () => {
        if (channel) {
          channel.unbind_all();
          channel.unsubscribe();
        }
      };
    } catch (err) {
      console.error('Error setting up Pusher:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    }
  }, [studentId, teacherId, onNewMessage]);

  return { isConnected, error };
}

// Hook for typing indicators
interface UseTypingIndicatorOptions {
  studentId: number;
  teacherId: number;
  onTyping?: (userId: number, userName: string, isTyping: boolean) => void;
}

export function useTypingIndicator({
  studentId,
  teacherId,
  onTyping,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!studentId || !teacherId) {
      return;
    }

    const pusher = getPusherClient();
    const channelName = getConversationChannelName(studentId, teacherId);
    const channel = pusher.subscribe(channelName);

    channel.bind('typing', (data: { userId: number; userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });

      if (onTyping) {
        onTyping(data.userId, data.userName, data.isTyping);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [studentId, teacherId, onTyping]);

  return { typingUsers };
}

// Hook to trigger typing indicator
export function useSendTypingIndicator(studentId: number, teacherId: number) {
  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      try {
        await fetch('/api/pusher/typing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            teacherId,
            isTyping,
          }),
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    },
    [studentId, teacherId]
  );

  return sendTyping;
}
