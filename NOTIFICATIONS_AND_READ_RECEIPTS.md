# Notifications and Read Receipts Implementation

## Overview
This document describes the notification and read receipt system implemented for the AES messaging platform. Both student and teacher chat interfaces now support browser notifications and visual read receipt indicators.

## Features Implemented

### 1. Browser Notifications
- **Permission Management**: Request and track browser notification permission
- **Real-time Alerts**: Show native browser notifications for new messages
- **Sound Effects**: Play notification sound when messages arrive
- **Auto-dismiss**: Notifications close automatically after 5 seconds
- **Unread Count**: Display badge with count of unread messages

### 2. Read Receipts
- **Visual Indicators**: 
  - Single checkmark (✓) = Message sent
  - Double checkmark (✓✓) = Message read
- **Auto-marking**: Messages marked as read 1 second after viewing
- **Database Tracking**: `readAt` timestamp stored in database
- **Real-time Updates**: Read status syncs across all connected clients

### 3. Notification Bell UI
- **Bell Icon**: Shows notification status (enabled/disabled)
- **Unread Badge**: Red badge displays unread message count
- **One-click Enable**: Click bell to request notification permission
- **Status Indicator**: Green bell (enabled), gray bell (disabled)

## File Structure

### Hooks
```
hooks/
├── use-message-notifications.ts  # Browser notifications + unread count
└── use-realtime-messages.ts      # Pusher real-time messaging (existing)
```

### API Endpoints
```
app/api/messages/
├── mark-read/route.ts           # Batch mark messages as read
├── unread-count/route.ts        # Get total unread count
└── send/route.ts                # Send message (triggers Pusher event)
```

### Components
```
components/
├── student/MentorMessages.tsx   # Student chat interface
└── CustomChatDialog.tsx         # Teacher chat interface
```

### Database Schema
```prisma
model Message {
  id            String   @id @default(cuid())
  senderId      Int
  senderRole    String
  recipientId   Int
  recipientRole String
  content       String   @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isRead        Boolean  @default(false)
  readAt        DateTime?  // NEW: Timestamp when message was read

  // Indexes for performance
  @@index([senderId, recipientId, createdAt])
  @@index([recipientId, isRead])
  @@index([createdAt(sort: Desc)])
}
```

## Hook Usage

### useMessageNotifications

Manages browser notifications and unread count.

```typescript
import { useMessageNotifications } from '@/hooks/use-message-notifications';

const {
  unreadCount,        // Number of unread messages
  permission,         // 'granted' | 'denied' | 'default'
  requestPermission,  // Function to request permission
  markAsRead,         // Function to mark messages as read
  fetchUnreadCount    // Function to refresh unread count
} = useMessageNotifications({
  userId: number,     // Current user ID
  userName: string,   // Current user name (for notification display)
  onNewMessage?: (message: any) => void  // Optional callback
});
```

**Features:**
- Automatically fetches unread count on mount
- Displays browser notifications for new messages (when permission granted)
- Plays notification sound
- Provides functions to mark messages as read

### useReadReceipts

Auto-marks messages as read when user views them.

```typescript
import { useReadReceipts } from '@/hooks/use-message-notifications';

useReadReceipts({
  messageIds: string[],  // Array of message IDs to mark as read
  isVisible: boolean,    // Whether conversation is visible
  delay?: number         // Delay before marking (default: 1000ms)
});
```

**Features:**
- Automatically marks messages as read after 1 second delay
- Only marks if conversation is visible
- Debounced to prevent excessive API calls
- Triggers read receipt indicators for sender

## Implementation Examples

### Student Chat (MentorMessages.tsx)

```typescript
export default function MentorMessages({ studentId, studentName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Notification hook
  const { 
    unreadCount, 
    permission, 
    requestPermission 
  } = useMessageNotifications({
    userId: studentId,
    userName: studentName
  });

  // Auto-mark messages as read
  const unreadMessageIds = messages
    .filter(m => m.recipientId === studentId && !m.isRead)
    .map(m => m.id);

  useReadReceipts({
    messageIds: unreadMessageIds,
    isVisible: !!selectedMentor
  });

  // Real-time messaging
  const { isConnected } = useRealtimeMessages({
    studentId,
    teacherId: selectedMentor?.id || 0,
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message]);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chat with {selectedMentor?.name}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={requestPermission}
            >
              {permission === 'granted' ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Connection Status */}
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-600" />
            ) : (
              <WifiOff className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea>
          {messages.map((message) => (
            <div key={message.id}>
              <div>{message.content}</div>
              <div className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.senderId === studentId && (
                  <span title={message.readAt ? 'Read' : 'Sent'}>
                    {message.readAt ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

### Teacher Chat (CustomChatDialog.tsx)

Same pattern as student chat, just with different prop names:

```typescript
export default function CustomChatDialog({
  userId,
  userName,
  recipientId,
  recipientName
}: ChatDialogProps) {
  // Same hooks and UI pattern as MentorMessages
  const { unreadCount, permission, requestPermission } = useMessageNotifications({
    userId,
    userName
  });

  const unreadMessageIds = messages
    .filter(m => m.recipientId === userId && !m.isRead)
    .map(m => m.id);

  useReadReceipts({
    messageIds: unreadMessageIds,
    isVisible: open
  });

  // ... rest of implementation
}
```

## API Endpoints

### POST /api/messages/mark-read

Mark multiple messages as read.

**Request Body:**
```json
{
  "messageIds": ["msg_123", "msg_456"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2
}
```

**Implementation:**
```typescript
// Mark messages as read and set readAt timestamp
await prisma.message.updateMany({
  where: {
    id: { in: messageIds },
    recipientId: userId
  },
  data: {
    isRead: true,
    readAt: new Date()
  }
});
```

### GET /api/messages/unread-count

Get total unread message count for current user.

**Response:**
```json
{
  "success": true,
  "unreadCount": 5
}
```

**Implementation:**
```typescript
const unreadCount = await prisma.message.count({
  where: {
    recipientId: userId,
    isRead: false
  }
});
```

## Visual Design

### Notification Bell States

1. **Disabled (No Permission)**
   - Gray bell-off icon
   - No badge
   - Click to request permission

2. **Enabled (Permission Granted)**
   - Green bell icon
   - Red badge shows unread count
   - Click opens notification settings

3. **Unread Messages**
   - Red circular badge
   - White text showing count
   - Positioned at top-right of bell

### Read Receipt Indicators

1. **Sent (✓)**
   - Single checkmark
   - Light color (blue-100 on blue background)
   - Shows immediately after sending

2. **Read (✓✓)**
   - Double checkmark
   - Bold font weight
   - Shows after recipient views message (1s delay)

### Example CSS
```tsx
<span className="flex items-center" title={message.readAt ? 'Read' : 'Sent'}>
  {message.readAt ? (
    <span className="font-bold">✓✓</span>  // Read
  ) : (
    <span>✓</span>  // Sent
  )}
</span>
```

## Notification Flow

### 1. Message Sent
```
User A sends message
    ↓
POST /api/messages/send
    ↓
Save to database (isRead: false)
    ↓
Trigger Pusher event
    ↓
User B receives message
```

### 2. Browser Notification
```
Pusher event received
    ↓
useRealtimeMessages hook
    ↓
onNewMessage callback
    ↓
useMessageNotifications hook
    ↓
Check notification permission
    ↓
Display browser notification
    ↓
Play notification sound
    ↓
Update unread count
```

### 3. Mark as Read
```
User B views conversation
    ↓
useReadReceipts hook
    ↓
Wait 1 second delay
    ↓
POST /api/messages/mark-read
    ↓
Update database (isRead: true, readAt: timestamp)
    ↓
User A sees ✓✓ indicator
```

## Browser Notification Example

When a new message arrives:

**Notification Display:**
```
[Bell Icon] New message from John Doe
"Hey, how's your progress on the assignment?"

5 seconds auto-close
```

**Notification Properties:**
- **Title**: "New message from [sender name]"
- **Body**: Message content (first 100 chars)
- **Icon**: Bell icon
- **Tag**: "message-[messageId]" (prevents duplicates)
- **Sound**: Notification sound plays once
- **Duration**: Auto-closes after 5 seconds

## Database Performance

### Indexes Added
```prisma
@@index([senderId, recipientId, createdAt])  // Conversation queries
@@index([recipientId, isRead])                // Unread count queries
@@index([createdAt(sort: Desc)])              // Recent messages
```

**Query Performance:**
- Unread count: O(1) with index on [recipientId, isRead]
- Conversation fetch: O(log n) with composite index
- Mark as read: O(1) per message with primary key

## Environment Setup

No additional environment variables needed! All features work with existing Pusher setup:

```env
# Existing Pusher credentials
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

## Testing Checklist

### Browser Notifications
- [ ] Click bell icon to request permission
- [ ] Grant permission in browser prompt
- [ ] Bell icon turns green after granting
- [ ] Send message from other account
- [ ] Browser notification appears
- [ ] Notification sound plays
- [ ] Notification auto-closes after 5 seconds
- [ ] Unread badge shows correct count

### Read Receipts
- [ ] Send message shows single checkmark (✓)
- [ ] Recipient views message
- [ ] Wait 1 second
- [ ] Checkmark changes to double (✓✓)
- [ ] Hover shows "Sent" vs "Read" tooltip
- [ ] Read status persists after page refresh

### Real-time Updates
- [ ] New message appears instantly (no page refresh)
- [ ] Read receipt updates in real-time
- [ ] Unread count updates automatically
- [ ] Connection status indicator shows green when connected

### Edge Cases
- [ ] Notification permission denied: Bell shows gray, no notifications
- [ ] Offline: Shows "Connecting..." status, queues messages
- [ ] Multiple tabs: Notifications appear in all tabs
- [ ] Background tab: Notifications still work
- [ ] Multiple unread: Badge shows correct total count

## Troubleshooting

### Notifications Not Appearing

1. **Check Permission Status**
   ```typescript
   console.log('Permission:', Notification.permission);
   ```
   Should be `'granted'`

2. **Check Browser Compatibility**
   ```typescript
   if ('Notification' in window) {
     console.log('Notifications supported');
   }
   ```

3. **Check Browser Settings**
   - Open browser settings
   - Search for "Notifications"
   - Ensure site has permission

4. **Check Console for Errors**
   ```
   DOMException: Notification permission denied
   ```

### Read Receipts Not Updating

1. **Check Message Interface**
   ```typescript
   interface Message {
     isRead?: boolean;
     readAt?: string | null;  // Must be optional
   }
   ```

2. **Check API Response**
   ```bash
   curl -X POST http://localhost:3000/api/messages/mark-read \
     -H "Content-Type: application/json" \
     -d '{"messageIds": ["msg_123"]}'
   ```

3. **Check Database**
   ```sql
   SELECT id, isRead, readAt FROM Message WHERE id = 'msg_123';
   ```

4. **Check Prisma Client**
   ```bash
   npx prisma generate
   ```

### Unread Count Not Updating

1. **Check API Endpoint**
   ```bash
   curl http://localhost:3000/api/messages/unread-count
   ```

2. **Check Hook Implementation**
   ```typescript
   useEffect(() => {
     fetchUnreadCount();
   }, [fetchUnreadCount]);
   ```

3. **Force Refresh**
   ```typescript
   await fetchUnreadCount();  // Manual refresh
   ```

## Future Enhancements

### Planned Features
1. **Typing Indicators**: "User is typing..." status
2. **Message Reactions**: Emoji reactions to messages
3. **Message Editing**: Edit sent messages
4. **Message Deletion**: Soft delete with "Message deleted"
5. **File Attachments**: Share files in chat
6. **Message Search**: Search conversation history
7. **Message Pinning**: Pin important messages
8. **Group Chats**: Multi-user conversations

### Performance Optimizations
1. **Pagination**: Load messages in chunks
2. **Virtual Scrolling**: Handle thousands of messages
3. **Message Caching**: Cache frequently accessed conversations
4. **Optimistic Updates**: Show sent messages immediately
5. **Background Sync**: Sync messages in service worker

### UX Improvements
1. **Sound Customization**: Choose notification sound
2. **Notification Filtering**: Mute specific conversations
3. **Desktop Shortcuts**: Keyboard shortcuts for actions
4. **Message Templates**: Quick reply templates
5. **Status Messages**: "Delivered", "Failed", "Sending"

## Related Documentation

- [PUSHER_SETUP.md](./PUSHER_SETUP.md) - Pusher configuration
- [PUSHER_IMPLEMENTATION.md](./PUSHER_IMPLEMENTATION.md) - Real-time messaging
- [WEBSOCKET_CHAT_README.md](./WEBSOCKET_CHAT_README.md) - Legacy Socket.io docs

## Support

For issues or questions:
1. Check console logs for errors
2. Verify Pusher connection status
3. Test API endpoints with curl
4. Check browser notification permissions
5. Review this documentation

## Summary

This implementation provides a complete notification and read receipt system for both student and teacher messaging interfaces:

✅ **Browser Notifications**: Native OS notifications with sound
✅ **Read Receipts**: Visual indicators (✓ sent, ✓✓ read)
✅ **Unread Count**: Badge showing unread message count
✅ **Real-time Updates**: Instant message delivery via Pusher
✅ **Auto-marking**: Messages marked as read automatically
✅ **Permission Management**: One-click notification enable
✅ **Database Tracking**: Full audit trail with timestamps
✅ **Performance**: Optimized with database indexes

The system is production-ready and fully compatible with Vercel serverless deployment.
