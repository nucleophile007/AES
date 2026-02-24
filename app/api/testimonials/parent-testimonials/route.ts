import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * School Logo Matcher (shared logic)
 */
const getSchoolLogo = (school: string | null | undefined): string => {
  if (!school || school.toLowerCase() === "null") {
    return "/testimonial-logos/default.png";
  }

  const normalized = school.toLowerCase().trim();

  const cleaned = normalized
    .replace("high school", "")
    .replace("highschool", "")
    .replace("middle school", "")
    .replace("school", "")
    .trim();

  if (cleaned.includes("folsom"))
    return "/testimonial-logos/folsom.png";

  if (cleaned.includes("granite bay"))
    return "/testimonial-logos/GraniteBayHighSchool.png";

  if (cleaned.includes("vista del lago") || cleaned.includes("vdl"))
    return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png";

  if (cleaned.includes("west park"))
    return "/testimonial-logos/WestParkHighSchool.png";

  if (cleaned.includes("raleigh"))
    return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp";

  if (cleaned.includes("rocklin"))
    return "/testimonial-logos/rocklin.jpg";

  return "/testimonial-logos/default.png";
};

export async function GET() {
  try {
    const rows = await prisma.feedback.findMany({
      where: {
        isApproved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const testimonials = rows
      .map((row) => {
        const schoolName = row.school ?? "";

        // Include all three testimonial fields
        const childExperience = row.childExperience?.trim() || "";
        const successStory = row.successStory?.trim() || "";
        const overallExperience = row.overallExperience?.trim() || "";

        // If nothing meaningful to show, skip
        if (!childExperience && !successStory && !overallExperience && !row.studentRating) return null;

        return {
          id: row.id.toString(),
          name: row.studentName
            ? `Parent of ${row.studentName}`
            : "Parent",
          designation: row.grade ?? "",
          school: schoolName,
          childExperience,
          successStory,
          overallExperience,
          rating: row.studentRating ?? null,
          src: getSchoolLogo(schoolName),
          programs: Array.isArray(row.programs) ? row.programs : [],
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Parent Testimonials API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch parent testimonials" },
      { status: 500 }
    );
  }
}
