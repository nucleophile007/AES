# WebSocket Chat Setup Guide

This document provides instructions for setting up and troubleshooting the WebSocket chat functionality.

## Setup Steps

Follow these steps in order to properly set up the chat system:

1. **Create Message Table & Users View**:
   ```bash
   # Create both Message table and users_view
   npm run setup:chat
   ```

   If you need to create them separately:
   ```bash
   # Create only the Message table
   npm run db:message
   
   # Create only the users_view
   npm run db:view
   ```

2. **Start Socket Server**:
   ```bash
   npm run socket
   ```

3. **Check Server Status**:
   ```bash
   npm run check:socket
   ```

## Troubleshooting

If you encounter the error `The table 'public.Message' does not exist`, follow these steps:

1. Run the setup:chat script to create both the Message table and users_view:
   ```bash
   npm run setup:chat
   ```

2. If the issue persists, try creating the Message table directly:
   ```bash
   npm run db:message
   ```

3. Check your database connection:
   ```bash
   npm run check:prisma
   ```

## Technical Details

### Message Table Structure

The Message table has the following structure:

```
Message {
  id            String   @id @default(uuid())
  senderId      Int
  senderRole    String   // 'teacher' or 'student'
  recipientId   Int
  recipientRole String   // 'teacher' or 'student'
  content       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isRead        Boolean  @default(false)
  
  // Relations through the users_view
  sender    User @relation("MessageSender", fields: [senderId], references: [id])
  recipient User @relation("MessageRecipient", fields: [recipientId], references: [id])
}
```

### Users View

The users_view combines both students and teachers into a unified view for message relations:

```
User {
  id                 Int
  name               String
  role               String    // 'teacher' or 'student'
  sentMessages       Message[] @relation("MessageSender")
  receivedMessages   Message[] @relation("MessageRecipient")
  
  @@map("users_view")
}
```

### Environment Configuration

Make sure your environment variables include:

```
# Socket Server URL (usually http://localhost:4000)
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Optional: Custom socket port
SOCKET_PORT=4000
```