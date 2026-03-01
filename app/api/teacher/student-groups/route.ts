import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');

    if (!teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      select: { id: true, name: true, email: true }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const groups = await prisma.studentGroup.findMany({
      where: { teacherId: teacher.id },
      include: {
        members: {
          include: {
            student: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      members: group.members.map((member) => ({
        id: member.student.id,
        name: member.student.name,
        email: member.student.email,
        grade: member.student.grade,
        program: member.student.program
      }))
    }));

    return NextResponse.json({
      success: true,
      groups: formattedGroups
    });
  } catch (error) {
    console.error('Error fetching student groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { teacherEmail, name, studentIds } = data;

    if (!teacherEmail || !name || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Teacher email, group name, and at least one student are required' },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: 'Group name is required' },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: teacherEmail },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const existingGroup = await prisma.studentGroup.findFirst({
      where: {
        teacherId: teacher.id,
        name: trimmedName
      },
      select: { id: true }
    });

    if (existingGroup) {
      return NextResponse.json(
        { success: false, error: 'A group with this name already exists' },
        { status: 409 }
      );
    }

    const uniqueStudentIds = Array.from(new Set(studentIds.map((id: any) => Number(id)).filter((id: number) => !Number.isNaN(id))));

    if (uniqueStudentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one valid student is required' },
        { status: 400 }
      );
    }

    const mappedStudents = await prisma.teacherStudent.findMany({
      where: {
        teacherId: teacher.id,
        studentId: { in: uniqueStudentIds }
      },
      select: { studentId: true }
    });

    if (mappedStudents.length !== uniqueStudentIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some selected students are not mapped to this teacher' },
        { status: 400 }
      );
    }

    const group = await prisma.studentGroup.create({
      data: {
        name: trimmedName,
        teacherId: teacher.id,
        members: {
          create: uniqueStudentIds.map((studentId) => ({ studentId }))
        }
      },
      include: {
        members: {
          include: {
            student: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        members: group.members.map((member) => ({
          id: member.student.id,
          name: member.student.name,
          email: member.student.email,
          grade: member.student.grade,
          program: member.student.program
        }))
      }
    });
  } catch (error) {
    console.error('Error creating student group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create group' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
