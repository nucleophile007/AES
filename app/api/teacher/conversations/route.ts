import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const teacherId = user.id;

    const allMessages = await prisma.$queryRaw<Array<{
      senderId: number;
      senderRole: string;
      recipientId: number;
      recipientRole: string;
      content: string;
      createdAt: Date;
    }>>`
      SELECT "senderId", "senderRole", "recipientId", "recipientRole", "content", "createdAt"
      FROM "Message"
      WHERE ("senderId" = ${teacherId} AND "senderRole" = 'teacher')
         OR ("recipientId" = ${teacherId} AND "recipientRole" = 'teacher')
      ORDER BY "createdAt" DESC
    `;

    const unreadRows = await prisma.$queryRaw<Array<{
      senderId: number;
      senderRole: string;
      count: number;
    }>>`
      SELECT "senderId", "senderRole", COUNT(*)::int AS "count"
      FROM "Message"
      WHERE "recipientId" = ${teacherId}
        AND "recipientRole" = 'teacher'
        AND "isRead" = false
      GROUP BY "senderId", "senderRole"
    `;

    const unreadMap = new Map<string, number>(
      unreadRows.map((row) => [`${row.senderRole}-${row.senderId}`, Number(row.count || 0)])
    );

    const conversationMap = new Map<string, {
      recipientId: number;
      recipientRole: 'student' | 'parent';
      recipientName: string;
      lastMessage: string;
      lastMessageTime: Date;
      unreadCount: number;
    }>();

    const studentIds = new Set<number>();
    const parentIds = new Set<number>();

    for (const msg of allMessages) {
      const isSender = msg.senderId === teacherId;
      const recipientId = isSender ? msg.recipientId : msg.senderId;
      const recipientRole = (isSender ? msg.recipientRole : msg.senderRole) as string;

      if (recipientRole !== 'student' && recipientRole !== 'parent') {
        continue;
      }

      const role = recipientRole as 'student' | 'parent';
      if (role === 'student') {
        studentIds.add(recipientId);
      } else {
        parentIds.add(recipientId);
      }

      const key = `${role}-${recipientId}`;
      if (conversationMap.has(key)) {
        continue;
      }

      const messageText = String(msg.content || '');
      conversationMap.set(key, {
        recipientId,
        recipientRole: role,
        recipientName: role === 'student' ? 'Unknown Student' : 'Parent',
        lastMessage: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
        lastMessageTime: msg.createdAt,
        unreadCount: unreadMap.get(key) || 0,
      });
    }

    const [students, parents] = await Promise.all([
      studentIds.size > 0
        ? prisma.student.findMany({
            where: { id: { in: Array.from(studentIds) } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      parentIds.size > 0
        ? prisma.parentAccount.findMany({
            where: { id: { in: Array.from(parentIds) } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const studentNameById = new Map(students.map((student) => [student.id, student.name]));
    const parentNameById = new Map(parents.map((parent) => [parent.id, parent.name]));

    const conversations = Array.from(conversationMap.values())
      .map((conversation) => ({
        ...conversation,
        recipientName:
          conversation.recipientRole === 'student'
            ? studentNameById.get(conversation.recipientId) || 'Unknown Student'
            : parentNameById.get(conversation.recipientId) || 'Parent',
      }))
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    return NextResponse.json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error('Error fetching teacher conversations:', error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch conversations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

