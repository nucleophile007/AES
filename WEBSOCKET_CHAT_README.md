# WebSocket Chat Implementation

This document explains the implementation of real-time chat functionality in the AES platform.

## Overview

The chat system allows students and teachers to communicate in real-time using WebSockets, with a fallback to REST API when WebSockets are not available.

## Database Setup

Before using the chat functionality, you need to set up the required database structures:

1. Run the setup script:
   ```
   npm run setup:chat
   ```

This script will:
- Create the `users_view` that is required for the Message model
- Test the Message table access
- Verify that messages can be created and retrieved

If you encounter database errors when using the chat, try running:
```
npm run db:view
```

This will recreate the users_view that combines teachers and students into a virtual User model.

## Development Setup

To run the project in development mode:

1. Start the Next.js development server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the WebSocket server:
   ```
   npm run socket
   ```

3. Alternatively, run both servers simultaneously:
   ```
   npm run dev:all
   ```

## Implementation Details

### Server-side Implementation

1. **WebSocket Server** (`/lib/socket.ts`)
   - Handles socket connections, authentication, and message routing
   - Integrates with Prisma for message persistence
   - Maintains a connection map of online users

2. **Custom Next.js Server** (`/server.js`)
   - Integrates Next.js with Socket.io
   - Initializes the WebSocket server alongside the HTTP server

3. **Message Schema** (`/prisma/schema.prisma`)
   - `Message` model for storing chat messages
   - Virtual `User` model for unified message relations

### Client-side Implementation

1. **WebSocket Hook** (`/hooks/use-socket.ts`)
   - Manages WebSocket connections and state
   - Provides message sending and receiving functionality
   - Handles connection errors with REST API fallback

2. **Chat Components**
   - `ChatDialog.tsx`: Reusable chat dialog component
   - `StudentMessages.tsx`: Student messaging interface

## How It Works

1. **Connection**
   - When a user loads the chat interface, a WebSocket connection is established
   - The user is authenticated with their ID and role

2. **Sending Messages**
   - Messages are sent via WebSocket if available
   - Falls back to REST API if WebSocket is not available
   - Messages are stored in the database and delivered to recipient in real-time if online

3. **Receiving Messages**
   - Real-time delivery if recipient is online
   - Messages are persisted in database and can be retrieved later

## Usage

### Student Dashboard

Students can chat with their teachers from the Messages section in the student dashboard.

### Teacher Dashboard

Teachers can chat with students from the student details section in the teacher dashboard.

## Environment Variables

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
SOCKET_PORT=4000
```

The NEXT_PUBLIC_SOCKET_URL should point to your WebSocket server URL (in development, this is http://localhost:4000).

## Deployment Considerations

1. **WebSocket Server**
   - Ensure your hosting provider supports WebSockets
   - For Vercel, consider using a separate WebSocket service like Pusher or Socket.io Cloud

2. **Scaling**
   - For production, consider using Redis adapter for Socket.io to support multiple server instances

## Troubleshooting

1. **Connection Issues**
   - Check browser console for connection errors
   - Ensure environment variables are properly set
   - Verify firewall settings aren't blocking WebSocket connections

2. **Message Delivery Problems**
   - Check server logs for message delivery errors
   - Verify user authentication is working properly

## Future Improvements

1. **Read Receipts**
   - Add read status indicators for messages

2. **Typing Indicators**
   - Show when a user is typing

3. **Message History**
   - Implement pagination for large message histories

4. **Push Notifications**
   - Add support for push notifications when offline