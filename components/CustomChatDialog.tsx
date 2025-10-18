import React, { useState, useEffect, useRef } from 'react';
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
import { Send, User, Wifi, WifiOff } from "lucide-react";
import { useSocket, SocketMessage } from "../hooks/use-socket";

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
  
  // Initialize socket
  const { 
    isConnected, 
    isAuthenticated, 
    sendMessage: sendSocketMessage, 
    subscribeToMessages 
  } = useSocket(userId, userRole);
  
  // Fetch messages
  const fetchMessages = async () => {
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
  };

  // Send message using WebSocket
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !recipientId) return;
    
    try {
      // No sending animation for teachers
      if (userRole !== 'teacher') {
        setIsSending(true);
      }
      
      if (isConnected && isAuthenticated) {
        // Use WebSocket to send message
        const messageData = {
          senderId: userId,
          senderRole: userRole,
          recipientId,
          recipientRole: userRole === 'teacher' ? 'student' as const : 'teacher' as const,
          content: newMessage,
        };
        
        try {
          const sentMessage = await sendSocketMessage(messageData);
          
          // Add the message to the local messages array
          const newMessageObj = {
            ...sentMessage,
            senderName: userName,
          };
          
          setMessages(prevMessages => [...prevMessages, newMessageObj]);
          setNewMessage('');
          
        } catch (socketError) {
          console.error('Socket send error:', socketError);
          fallbackToApiSend();
        }
      } else {
        // Fall back to REST API
        fallbackToApiSend();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Fallback to REST API if WebSocket fails
  const fallbackToApiSend = async () => {
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
          content: newMessage,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        console.error('Failed to send message:', data.error || 'Unknown error');
      }
    } catch (apiError) {
      console.error('REST API send error:', apiError);
    }
  };

  // Subscribe to incoming messages via WebSocket
  useEffect(() => {
    if (!open || !isConnected || !isAuthenticated) return;
    
    // Subscribe to new messages
    const unsubscribe = subscribeToMessages((message: SocketMessage) => {
      // Check if the message is from the current conversation
      if (
        (message.senderId === recipientId && message.recipientId === userId) || 
        (message.senderId === userId && message.recipientId === recipientId)
      ) {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(m => m.id === message.id);
          if (exists) return prevMessages;
          
          // Add sender name based on who sent it
          const newMessage = {
            ...message,
            senderName: message.senderId === userId ? userName : recipientName
          };
          
          return [...prevMessages, newMessage];
        });
      }
    });
    
    return unsubscribe;
  }, [open, isConnected, isAuthenticated, userId, recipientId]);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (open) {
      fetchMessages();
      
      // If WebSockets aren't available, fall back to polling
      if (!isConnected || !isAuthenticated) {
        const intervalId = setInterval(fetchMessages, 5000);
        return () => clearInterval(intervalId);
      }
    }
  }, [open, userId, recipientId, isConnected, isAuthenticated]);

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
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Chat with {recipientName}
            {isConnected ? (
              <Wifi className="h-4 w-4 ml-2 text-green-500" aria-label="Real-time connected" />
            ) : (
              <WifiOff className="h-4 w-4 ml-2 text-orange-500" aria-label="Using fallback mode" />
            )}
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
                          className={`text-xs mt-1 ${
                            isUserMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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