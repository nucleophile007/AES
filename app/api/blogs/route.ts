import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const blogs = await prisma.blog.findMany({
            where: {
                published: true,
                isApproved: true,
            },
            include: {
                Student: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        schoolName: true,
                    },
                },
            },
            orderBy: [
                {
                    publicationYear: 'desc',
                },
                {
                    publicationMonth: 'desc',
                },
            ],
        });

        return NextResponse.json(
            {
                success: true,
                blogs,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch blogs", blogs: [] },
            { status: 500 }
        );
    }
}
