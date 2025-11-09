# Real-Time Messaging Setup with Pusher

This guide will help you set up Pusher Channels for real-time messaging in your application.

## Why Pusher?

- ✅ **Perfect for Vercel**: Works seamlessly with serverless functions
- ✅ **Free Tier**: 100 concurrent connections, 200k messages/day
- ✅ **No server management**: Pusher handles WebSocket connections
- ✅ **Global**: Works worldwide with low latency
- ✅ **Reliable**: 99.999% uptime SLA

## Setup Instructions

### 1. Create Pusher Account

1. Go to [https://dashboard.pusher.com/accounts/sign_up](https://dashboard.pusher.com/accounts/sign_up)
2. Sign up for a free account (no credit card required)
3. Verify your email

### 2. Create a Channels App

1. From the dashboard, click "Create app"
2. Choose **Channels** product
3. Name your app (e.g., "AES Messaging")
4. Select a cluster closest to your users (e.g., `us2` for US East)
5. Choose "React" as your frontend and "Node.js" as your backend
6. Click "Create app"

### 3. Get Your Credentials

From your app dashboard, click on "App Keys" tab. You'll see:

- **app_id**: Your application ID
- **key**: Your public key (safe to use in client-side code)
- **secret**: Your secret key (NEVER expose this in client code)
- **cluster**: Your app's cluster (e.g., `us2`)

### 4. Add to Environment Variables

Add these to your `.env.local` file:

```bash
# Pusher Configuration
PUSHER_APP_ID=your_app_id_here
PUSHER_SECRET=your_secret_here
NEXT_PUBLIC_PUSHER_KEY=your_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here
```

**Important:** 
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Keep `PUSHER_SECRET` secret (server-side only)

### 5. Restart Your Development Server

```bash
npm run dev
```

### 6. Test Real-Time Messaging

1. Open your app in **two different browsers** (or incognito + normal)
2. Log in as a student in one browser
3. Log in as a teacher in another browser
4. Navigate to the Messages tab
5. Send a message from one user
6. The message should appear **instantly** in the other browser without refreshing!

## What Changed?

### Before (Polling)
- ❌ Checked for new messages every 5 seconds
- ❌ Wasted API calls and bandwidth
- ❌ 5-second delay for new messages
- ❌ High server load

### After (Real-Time with Pusher)
- ✅ **Instant** message delivery (< 100ms)
- ✅ No polling, no wasted API calls
- ✅ Scalable to thousands of users
- ✅ Works on Vercel's serverless infrastructure

## Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Student   │                    │   Teacher   │
│   Browser   │                    │   Browser   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ Subscribe to                     │ Subscribe to
       │ conversation channel             │ conversation channel
       │                                  │
       └─────────────┬─────────────── ────┘
                     │
              ┌──────▼──────┐
              │   Pusher    │
              │  Channels   │
              └──────▲──────┘
                     │
                     │ Trigger event
                     │
              ┌──────┴──────┐
              │   Vercel    │
              │  API Route  │
              │ /api/messages│
              └──────▲──────┘
                     │
              ┌──────┴──────┐
              │  PostgreSQL │
              │  (Neon DB)  │
              └─────────────┘
```

## Files Added/Modified

### New Files
- `lib/pusher-server.ts` - Server-side Pusher utilities
- `lib/pusher-client.ts` - Client-side Pusher utilities
- `app/api/pusher/auth/route.ts` - Pusher authentication endpoint
- `hooks/use-realtime-messages.ts` - React hook for real-time messaging

### Modified Files
- `app/api/messages/send/route.ts` - Now triggers Pusher events
- `components/student/MentorMessages.tsx` - Uses real-time hook instead of polling

## Troubleshooting

### Messages not appearing in real-time

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Make sure you restarted the dev server after adding env vars
4. Check Pusher dashboard > Debug Console for incoming events

### "Failed to connect" error

1. Verify `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are correct
2. Check if your Pusher app is active (not paused)
3. Make sure you're on the free tier limits (100 concurrent connections)

### Authentication errors

1. Verify `PUSHER_SECRET` is set correctly (server-side)
2. Check `/api/pusher/auth` endpoint is accessible
3. Look for errors in terminal/server logs

## Pusher Dashboard

Monitor your app at [https://dashboard.pusher.com](https://dashboard.pusher.com):

- **Debug Console**: See real-time events as they happen
- **Metrics**: View connection count, message volume
- **Event Creator**: Manually trigger events for testing

## Next Steps

After basic messaging works, you can add:

1. ✅ **Typing indicators** - See when someone is typing
2. ✅ **Read receipts** - Track when messages are read
3. ✅ **Presence** - See who's online
4. ✅ **Message reactions** - Add emoji reactions
5. ✅ **File sharing** - Send images and documents

All of these are possible with Pusher Channels!

## Cost

- **Free Tier**: 
  - 100 concurrent connections
  - 200,000 messages per day
  - Unlimited channels
  - Perfect for development and small-scale production

- **Paid Plans**: Start at $49/month for 500 connections if you exceed free tier

## Support

- Pusher Docs: https://pusher.com/docs/channels/
- Pusher Support: https://support.pusher.com/

## Security Notes

- ✅ Private channels require authentication (implemented)
- ✅ Messages stored in your database (you control the data)
- ✅ Pusher only facilitates real-time delivery
- ✅ HTTPS/TLS encryption for all connections
