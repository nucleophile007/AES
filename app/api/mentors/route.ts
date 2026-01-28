import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const mentors = await prisma.mentor.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                displayOrder: 'asc',
            },
        });

        return NextResponse.json(
            {
                success: true,
                mentors,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error) {
        console.error("Error fetching mentors:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch mentors" },
            { status: 500 }
        );
    }
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: "Method not allowed. Use the admin site for updates." },
        { status: 405 }
    );
}
