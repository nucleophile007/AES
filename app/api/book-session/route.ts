import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, gradeLevel, subjectOfInterest } = await req.json();
    if (!name || !email || !phone || !gradeLevel || !subjectOfInterest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const session = await prisma.freeSession.create({
      data: { name, email, phone, gradeLevel, subjectOfInterest },
    });
    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book session' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = await prisma.freeSession.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
} 