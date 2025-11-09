import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '../../../../lib/pusher-server';

export async function POST(req: NextRequest) {
  try {
    // Pusher sends data as form data, not JSON
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const socket_id = params.get('socket_id');
    const channel_name = params.get('channel_name');
    
    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Extract conversation ID from channel name
    // Format: private-conversation-{studentId}-{teacherId}
    const match = channel_name.match(/private-conversation-(\d+)-(\d+)/);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid channel name' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // Verify that the user is part of this conversation
    // For now, we'll allow all authenticated requests
    
    const pusher = getPusherServer();
    const authResponse = pusher.authorizeChannel(socket_id, channel_name);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
