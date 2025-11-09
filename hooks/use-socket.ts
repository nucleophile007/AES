import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Define message interface
export interface SocketMessage {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  senderRole: 'student' | 'teacher';
}

export const useSocket = (userId: number, role: 'student' | 'teacher') => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    if (!userId) return;
    
    // Initialize socket connection if not already established
    if (!socket) {
      // Connect to WebSocket server
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
      console.log('Connecting to socket server at:', socketUrl);
      
      socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        withCredentials: true
      });
    }
    
    // Handle connection events
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Authenticate the user
      if (socket) {
        socket.emit('authenticate', { userId, role });
      }
    };
    
    const handleAuthenticated = ({ success }: { success: boolean }) => {
      if (success) {
        setIsAuthenticated(true);
        console.log('Socket authenticated');
      }
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
    };
    
    const handleConnectError = (err: Error) => {
      console.log('Connection error:', err);
      setIsConnected(false);
    };
    
    socket.on('connect', handleConnect);
    socket.on('authenticated', handleAuthenticated);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    
    // Clean up on unmount
    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('authenticated', handleAuthenticated);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
      }
    };
  }, [userId, role]);
  
  // Function to send a message
  const sendMessage = (message: {
    senderId: number;
    senderRole: 'student' | 'teacher';
    recipientId: number;
    recipientRole: 'student' | 'teacher';
    content: string;
  }) => {
    return new Promise<SocketMessage>((resolve, reject) => {
      if (!socket || !isConnected || !isAuthenticated) {
        reject(new Error('Socket not connected or authenticated'));
        return;
      }
      
      // Set up a one-time listener for message confirmation
      socket.once('message_sent', (sentMessage: SocketMessage) => {
        resolve(sentMessage);
      });
      
      socket.once('message_error', (error: { error: string }) => {
        reject(new Error(error.error || 'Failed to send message'));
      });
      
      // Send the message
      socket.emit('new_message', message);
    });
  };
  
  // Function to mark a message as read
  const markAsRead = (messageId: string) => {
    if (!socket || !isConnected || !isAuthenticated) return;
    socket.emit('mark_as_read', { messageId });
  };
  
  // Subscribe to incoming messages
  const subscribeToMessages = (callback: (message: SocketMessage) => void) => {
    if (!socket) return () => {};
    
    socket.on('message_received', callback);
    
    return () => {
      if (socket) {
        socket.off('message_received', callback);
      }
    };
  };
  
  return {
    isConnected,
    isAuthenticated,
    sendMessage,
    markAsRead,
    subscribeToMessages,
    socket
  };
};