import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../app/components/ui/dialog";
import { Button } from "../app/components/ui/button";
import { Input } from "../app/components/ui/input";
import { ScrollArea } from "../app/components/ui/scroll-area";
import { Send, User, Wifi, WifiOff, Bell, BellOff } from "lucide-react";
import { useRealtimeMessages } from "../hooks/use-realtime-messages";
import { useMessageNotifications, useReadReceipts } from "../hooks/use-message-notifications";

// Custom class to hide spinners
const NO_SPINNER_CLASS = "no-spinner";

interface Message {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
  isRead?: boolean;
  readAt?: string | null;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'student' | 'teacher';
  userId: number;
  userName: string;
  recipientId: number;
  recipientName: string;
}

export default function CustomChatDialog({
  open,
  onOpenChange,
  userRole,
  userId,
  userName,
  recipientId,
  recipientName
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Get studentId and teacherId based on role
  const studentId = userRole === 'student' ? userId : recipientId;
  const teacherId = userRole === 'teacher' ? userId : recipientId;
  
  // Notification and read receipts
  const { 
    unreadCount, 
    permission, 
    requestPermission 
  } = useMessageNotifications({
    userId,
    userName
  });

  // Mark messages as read when dialog is open
  const unreadMessageIds = messages
    .filter(m => m.recipientId === userId && !m.isRead)
    .map(m => m.id);

  useReadReceipts({
    messageIds: unreadMessageIds,
    isVisible: open
  });
  
  // Real-time message subscription with Pusher
  const { isConnected, error: realtimeError } = useRealtimeMessages({
    studentId,
    teacherId,
    onNewMessage: (message) => {
      // Add new message to the list if it's not already there
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    },
  });
  
  // Fetch messages - wrapped in useCallback to prevent dependency warnings
  const fetchMessages = useCallback(async () => {
    if (!open || !userId || !recipientId) return;
    
    try {
      // Don't set loading state for teachers
      if (userRole !== 'teacher') {
        setIsLoading(true);
      }
      
      const endpoint = userRole === 'teacher' 
        ? `/api/messages/teacher?teacherId=${userId}&studentId=${recipientId}`
        : `/api/messages/student?studentId=${userId}&teacherId=${recipientId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(data.messages);
        setError(null);
      } else {
        if (data.error === "Database operation failed") {
          setError("Database error: The messages couldn't be loaded. Please contact support.");
          
          if (data.details?.includes('users_view')) {
            setError("Database view missing: Please run 'npm run db:view' to create the required database view.");
          }
        } else {
          setError(data.error || "Unknown error occurred while fetching messages");
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [open, userId, recipientId, userRole]); // Add all dependencies

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !recipientId) return;
    
    setIsSending(true);
    setError(null);
    
    // Create optimistic message BEFORE sending
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      senderId: userId,
      recipientId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderName: userName,
      senderRole: userRole
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, optimisticMsg]);
    
    // Clear input immediately
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userId,
          senderRole: userRole,
          recipientId,
          recipientRole: userRole === 'teacher' ? 'student' : 'teacher',
          content: messageContent,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Replace optimistic message with real one from server
        setMessages(prevMessages => 
          prevMessages.map(m => 
            m.id === optimisticId 
              ? { ...m, id: data.messageId }
              : m
          )
        );
      } else {
        // Remove optimistic message on failure
        setMessages(prevMessages => 
          prevMessages.filter(m => m.id !== optimisticId)
        );
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(m => m.id !== optimisticId)
      );
      setError(error instanceof Error ? error.message : 'Failed to send message');
      // Restore the message in input
      setNewMessage(messageContent);
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Fetch messages when dialog opens (one-time fetch, real-time updates via Pusher)
  useEffect(() => {
    if (open) {
      fetchMessages();
      // No more polling! Real-time updates via Pusher
    }
  }, [open, userId, recipientId, fetchMessages]); // Add fetchMessages dependency

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md sm:max-w-lg md:max-w-xl ${NO_SPINNER_CLASS}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Chat with {recipientName}
              {isConnected ? (
                <Wifi className="h-4 w-4 ml-2 text-green-500" aria-label="Real-time connected" />
              ) : (
                <WifiOff className="h-4 w-4 ml-2 text-orange-500" aria-label="Using fallback mode" />
              )}
            </div>
            
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={requestPermission}
              title={permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
            >
              {permission === 'granted' ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[400px]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 text-sm">
              <div className="flex">
                <div className="py-1">
                  <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
          <ScrollArea className="flex-1 p-4 border rounded-md" ref={scrollAreaRef}>
            {/* No loading indicator at all - immediately show empty state */}
            {messages.length === 0 && !error ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUserMessage = message.senderId === userId;
                  
                  return (
                    <div 
                      key={message.id}
                      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isUserMessage 
                            ? 'bg-blue-500 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div 
                          className={`flex items-center gap-1 text-xs mt-1 ${
                            isUserMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isUserMessage && (
                            <span className="flex items-center" title={message.readAt ? 'Read' : 'Sent'}>
                              {message.readAt ? (
                                // Double check for read
                                <span className="font-bold">✓✓</span>
                              ) : (
                                // Single check for sent
                                <span>✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}