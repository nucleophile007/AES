'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseMessageNotificationsOptions {
  userId: number;
  userName: string;
  onNewMessage?: (message: any) => void;
}

export function useMessageNotifications({
  userId,
  userName,
  onNewMessage,
}: UseMessageNotificationsOptions) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/unread-count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });
      const data = await response.json();
      if (data.success) {
        // Update unread count
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [fetchUnreadCount]);

  // Show browser notification
  const showNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      if (permission === 'granted' && 'Notification' in window) {
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'message-notification',
        });

        // Play sound
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors
          });
        } catch (error) {
          // Ignore audio errors
        }

        // Close notification after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    },
    [permission]
  );

  // Handle new message from Pusher
  const handleNewMessage = useCallback(
    (message: any) => {
      // Only show notification if message is for this user
      if (message.recipientId === userId) {
        showNotification(
          `New message from ${message.senderName}`,
          message.content.substring(0, 100),
          undefined
        );
        
        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Call optional callback
        if (onNewMessage) {
          onNewMessage(message);
        }
      }
    },
    [userId, showNotification, onNewMessage]
  );

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    permission,
    requestPermission,
    showNotification,
    unreadCount,
    markAsRead,
    handleNewMessage,
    fetchUnreadCount,
  };
}

// Hook for read receipts
interface UseReadReceiptsOptions {
  messageIds: string[];
  isVisible: boolean;
}

export function useReadReceipts({ messageIds, isVisible }: UseReadReceiptsOptions) {
  useEffect(() => {
    if (isVisible && messageIds.length > 0) {
      // Mark messages as read after a small delay
      const timer = setTimeout(async () => {
        try {
          await fetch('/api/messages/mark-read', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messageIds }),
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }, 1000); // 1 second delay before marking as read

      return () => clearTimeout(timer);
    }
  }, [messageIds, isVisible]);
}
