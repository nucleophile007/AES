import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket } from "socket.io";
import { prisma } from "./prisma";

// User connection mapping: userId_role -> socket
const connectedUsers = new Map<string, Socket>();

export function initSocketServer(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      // Allow requests from the Next.js dev server
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on("authenticate", ({ userId, role }: { userId: number, role: 'student' | 'teacher' }) => {
      const userKey = `${userId}_${role}`;
      
      // Store the socket connection
      connectedUsers.set(userKey, socket);
      
      console.log(`User authenticated: ${userKey}`);
      
      // Confirm authentication to client
      socket.emit("authenticated", { success: true });
    });
    
    // Handle new message
    socket.on("new_message", async (message: {
      senderId: number,
      senderRole: 'student' | 'teacher',
      recipientId: number,
      recipientRole: 'student' | 'teacher',
      content: string
    }) => {
      try {
        // Store the message in the database
        const newMessage = await prisma.message.create({
          data: {
            senderId: message.senderId,
            senderRole: message.senderRole,
            recipientId: message.recipientId,
            recipientRole: message.recipientRole,
            content: message.content
          }
        });
        
        // Format message for clients
        const messageToSend = {
          id: newMessage.id,
          senderId: newMessage.senderId,
          recipientId: newMessage.recipientId,
          content: newMessage.content,
          timestamp: newMessage.createdAt,
          senderRole: newMessage.senderRole,
        };
        
        // Send to sender for confirmation
        socket.emit("message_sent", messageToSend);
        
        // Check if recipient is online
        const recipientKey = `${message.recipientId}_${message.recipientRole}`;
        const recipientSocket = connectedUsers.get(recipientKey);
        
        if (recipientSocket) {
          // Send message to recipient in real-time
          recipientSocket.emit("message_received", messageToSend);
        }
        
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });
    
    // Handle read status
    socket.on("mark_as_read", async ({ messageId }: { messageId: string }) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true }
        });
        
        socket.emit("message_marked_read", { messageId });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });
    
    // Handle user disconnect
    socket.on("disconnect", () => {
      // Find and remove the user from connected users
      for (const [key, userSocket] of connectedUsers.entries()) {
        if (userSocket === socket) {
          connectedUsers.delete(key);
          console.log(`User disconnected: ${key}`);
          break;
        }
      }
    });
  });

  return io;
}