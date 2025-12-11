import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../app/components/ui/dialog";
import { Button } from "../app/components/ui/button";
import { Input } from "../app/components/ui/input";
import { ScrollArea } from "../app/components/ui/scroll-area";
import { Send, User, Wifi, WifiOff, Bell, BellOff, Clock, Check, CheckCheck, RefreshCw, AlertCircle, MessageCircle } from "lucide-react";
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
  senderRole: 'student' | 'teacher' | 'parent';
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
  recipientRole?: 'student' | 'parent'; // Optional, defaults to 'student' for backward compatibility
}

export default function CustomChatDialog({
  open,
  onOpenChange,
  userRole,
  userId,
  userName,
  recipientId,
  recipientName,
  recipientRole = 'student' // Default to 'student' for backward compatibility
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Get participant IDs based on role
  // For student-teacher: studentId and teacherId
  // For parent-teacher: parentId (passed as studentId to hook) and teacherId
  // The useRealtimeMessages hook just needs two IDs and will sort them for the channel name
  const participant1Id = userRole === 'student' ? userId : recipientId; // studentId or parentId
  const participant2Id = userRole === 'teacher' ? userId : recipientId; // teacherId
  
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
  // For parent-teacher conversations, we pass parentId as studentId to the hook
  // The hook parameter names are studentId/teacherId but it works with any two IDs
  const { isConnected, error: realtimeError } = useRealtimeMessages({
    studentId: participant1Id,
    teacherId: participant2Id,
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
        ? recipientRole === 'parent'
          ? `/api/messages/teacher?teacherId=${userId}&parentId=${recipientId}&recipientRole=parent`
          : `/api/messages/teacher?teacherId=${userId}&studentId=${recipientId}`
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
  }, [open, userId, recipientId, userRole, recipientRole]); // Add recipientRole dependency

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
          recipientRole: userRole === 'teacher' 
            ? (recipientRole || 'student')  // Use recipientRole prop if provided, else default to 'student'
            : 'teacher',
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
      <DialogContent className={`max-w-2xl w-full h-[600px] flex flex-col p-0 ${NO_SPINNER_CLASS}`}>
        <DialogHeader className="sr-only">
          <DialogTitle>Chat with {recipientName}</DialogTitle>
        </DialogHeader>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{recipientName}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {isConnected ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={requestPermission}
              title={permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
              className="h-9 w-9"
            >
              {permission === 'granted' ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 mx-4 mt-4 rounded text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {messages.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">No messages yet</p>
                <p className="text-sm mt-1">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isUserMessage = message.senderId === userId;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  const messageDate = new Date(message.timestamp);
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].timestamp).toDateString() !== messageDate.toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                            {messageDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex items-end gap-2 ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isUserMessage && showAvatar && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {message.senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isUserMessage && !showAvatar && <div className="w-8"></div>}
                        
                        <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {!isUserMessage && showAvatar && (
                            <span className="text-xs text-gray-600 mb-1 px-2">{message.senderName}</span>
                          )}
                          <div 
                            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isUserMessage 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm' 
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div 
                              className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                                isUserMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {messageDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isUserMessage && (
                                <span className="flex items-center" title={message.readAt ? 'Read' : 'Sent'}>
                                  {message.readAt ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-blue-200" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isUserMessage && showAvatar && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {!isUserMessage && !showAvatar && <div className="w-8"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
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
                  className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full"
                />
                {isSending && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Button 
                onClick={sendMessage}
                disabled={isSending || !newMessage.trim()}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}