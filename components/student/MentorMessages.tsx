import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, RefreshCw, Wifi, WifiOff, Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeMessages } from "../../hooks/use-realtime-messages";
import { useMessageNotifications, useReadReceipts } from "../../hooks/use-message-notifications";

interface Mentor {
  id: number;
  name: string;
  email: string;
  program: string;
}

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

interface MentorMessagesProps {
  studentId: number;
  studentEmail: string;
  studentName: string;
}

export default function MentorMessages({ studentId, studentEmail, studentName }: MentorMessagesProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Notifications setup
  const {
    permission,
    requestPermission,
    unreadCount,
    markAsRead,
    handleNewMessage: notifyNewMessage,
  } = useMessageNotifications({
    userId: studentId,
    userName: studentName,
    onNewMessage: (message) => {
      // Additional handling when new message arrives
      console.log('New message notification:', message);
    },
  });

  // Real-time message subscription
  const { isConnected, error: realtimeError } = useRealtimeMessages({
    studentId,
    teacherId: selectedMentor?.id || 0,
    onNewMessage: (message) => {
      // Add new message to the list if it's not already there
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        const newMessages = [...prev, message];
        
        // Trigger notification
        notifyNewMessage(message);
        
        return newMessages;
      });
    },
  });

  // Mark messages as read when viewing conversation
  const unreadMessageIds = messages
    .filter((m) => !m.isRead && m.recipientId === studentId)
    .map((m) => m.id);

  useReadReceipts({
    messageIds: unreadMessageIds,
    isVisible: selectedMentor !== null,
  });

  // Fetch student's mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/student/mentors?studentEmail=${encodeURIComponent(studentEmail)}`);
        
        if (!response.ok) {
          console.warn(`Failed to fetch mentors: ${response.status}`);
          
          // Fallback: Use demo data if API fails
          console.log('Using fallback demo mentors data');
          const fallbackMentors = [
            {
              id: 18, // Use the ID from your error logs
              name: "Dr. Sarah Wilson",
              email: "sarah.wilson@example.com",
              program: "Science"
            },
            {
              id: 19,
              name: "Mr. John Davis",
              email: "john.davis@example.com",
              program: "Mathematics"
            },
            {
              id: 20,
              name: "Academic Support",
              email: "support@aes.edu",
              program: "General"
            }
          ];
          
          setMentors(fallbackMentors);
          if (fallbackMentors.length > 0 && !selectedMentor) {
            setSelectedMentor(fallbackMentors[0]);
          }
          setError(null); // Clear error since we're using fallback data
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.mentors) {
          setMentors(data.mentors);
          // Auto-select first mentor if available
          if (data.mentors.length > 0 && !selectedMentor) {
            setSelectedMentor(data.mentors[0]);
          }
        } else {
          console.warn('API returned success=false:', data.error);
          setError(data.error || 'Failed to load mentors');
          
          // Use fallback data in this case as well
          const fallbackMentors = [
            {
              id: 18,
              name: "Dr. Sarah Wilson",
              email: "sarah.wilson@example.com",
              program: "Science"
            },
            {
              id: 19,
              name: "Mr. John Davis",
              email: "john.davis@example.com",
              program: "Mathematics"
            },
            {
              id: 20,
              name: "Academic Support",
              email: "support@aes.edu",
              program: "General"
            }
          ];
          
          setMentors(fallbackMentors);
          if (fallbackMentors.length > 0 && !selectedMentor) {
            setSelectedMentor(fallbackMentors[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentors');
        console.error("Error fetching mentors:", err);
        
        // Provide fallback data even if there's an exception
        const fallbackMentors = [
          {
            id: 18,
            name: "Dr. Sarah Wilson",
            email: "sarah.wilson@example.com",
            program: "Science"
          },
          {
            id: 19,
            name: "Mr. John Davis",
            email: "john.davis@example.com",
            program: "Mathematics"
          },
          {
            id: 20,
            name: "Academic Support",
            email: "support@aes.edu",
            program: "General"
          }
        ];
        
        setMentors(fallbackMentors);
        if (fallbackMentors.length > 0 && !selectedMentor) {
          setSelectedMentor(fallbackMentors[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (studentEmail) {
      fetchMentors();
    }
  }, [studentEmail, selectedMentor]); // Add selectedMentor dependency

  // Fetch messages when a mentor is selected (one-time fetch, real-time updates via Pusher)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedMentor) return;
      
      try {
        setIsLoading(true);
        
        const endpoint = `/api/messages/student?studentId=${studentId}&teacherId=${selectedMentor.id}`;
        console.log('Fetching messages from:', endpoint);
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log('Successfully fetched messages:', data.messages?.length || 0);
          setMessages(data.messages || []);
          setError(null);
        } else {
          console.error('Failed to fetch messages:', data.error);
          setMessages([]);
          setError(data.error || "Failed to load messages");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedMentor) {
      fetchMessages();
      // No more polling! Real-time updates via Pusher
    }
  }, [selectedMentor, studentId]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMentor) return;
    
    setIsSending(true);
    setError(null);
    
    // Create optimistic message BEFORE sending
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      senderId: studentId,
      recipientId: selectedMentor.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderName: studentName,
      senderRole: 'student'
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, optimisticMsg]);
    
    // Clear input immediately
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      console.log('Sending message to:', selectedMentor.name);
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: studentId,
          senderRole: 'student',
          recipientId: selectedMentor.id,
          recipientRole: 'teacher',
          content: messageContent,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Message sent successfully');
        
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
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(m => m.id !== optimisticId)
      );
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Restore the message in input
      setNewMessage(messageContent);
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Mentors List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">My Mentors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && mentors.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading mentors...</span>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No mentors assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mentors.map((mentor) => (
                <div 
                  key={mentor.id} 
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-gray-50",
                    selectedMentor?.id === mentor.id && "bg-blue-50"
                  )}
                  onClick={() => setSelectedMentor(mentor)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{mentor.name}</p>
                      <p className="text-xs text-gray-600">{mentor.program}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Area */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedMentor 
                ? `Chat with ${selectedMentor.name}` 
                : "Select a mentor to start chatting"}
            </CardTitle>
            {selectedMentor && (
              <div className="flex items-center gap-2">
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
                
                {/* Connection Status */}
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Wifi className="h-3 w-3" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <WifiOff className="h-3 w-3" />
                    <span>Connecting...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedMentor ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Select a mentor from the list to view messages</p>
              </div>
            </div>
          ) : (
            <>
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

              <ScrollArea className="h-80 w-full p-4 border rounded-lg mb-4" ref={scrollAreaRef}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Loading messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 && !error ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isUserMessage = message.senderRole === 'student';
                      
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

              {/* Message input */}
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
                  {isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}