// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     const rows = await prisma.testimonial.findMany({
//       where: {
//         isApproved: true, // Only fully approved testimonials
//       },
//       include: {
//         Student: {
//           select: {
//             name: true,
//             grade: true,
//             schoolName: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const testimonials = rows.map((row) => ({
//       id: row.id.toString(),
//       name: row.studentName || row.Student?.name || "Student",
//       designation: row.grade || row.Student?.grade || "",
//       school: row.school || row.Student?.schoolName || "",
//       quote:
//         row.content ||
//         row.successStory ||
//         row.beforeAfterExpectations ||
//         "",
//       src: "/testimonial-logos/default.png", // ✅ default image only
//       rating: row.rating ?? 5,
//       programs: row.programs ?? [],
//     }));

//     return NextResponse.json({
//       success: true,
//       testimonials,
//     });
//   } catch (error) {
//     console.error("Full Testimonials API error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch testimonials" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Robust School Logo Matcher
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
    const rows = await prisma.testimonial.findMany({
      where: {
        isApproved: true,
      },
      include: {
        Student: {
          select: {
            name: true,
            grade: true,
            schoolName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const testimonials = rows.map((row) => {
      const schoolName =
        row.school || row.Student?.schoolName || "";

      return {
        id: row.id.toString(),
        name: row.studentName || row.Student?.name || "Student",
        designation: row.grade || row.Student?.grade || "",
        school: schoolName,
        content: row.content ?? "",
        successStory: row.successStory ?? "",
        rating: row.rating ?? 5,
        src: getSchoolLogo(schoolName),
        programs: Array.isArray(row.programs) ? row.programs : [],
      };
    });

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Full Testimonials API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
