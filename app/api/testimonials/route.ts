
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../lib/prisma";

// export async function GET(_req: NextRequest) {
//   try {
//     const rows = await prisma.testimonial.findMany({
//       where: {
//         isVisible: true,
//         OR: [
//           { isApproved: true },
//           { contentApproved: true },
//           { successStoryApproved: true },
//           { beforeAfterApproved: true },
//           { ratingApproved: true },
//         ],
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

//     const testimonials = rows.map(row => {
//       const t: any = {
//         id: row.id,
//         studentName: row.studentName || row.Student?.name,
//         grade: row.grade || row.Student?.grade,
//         school: row.school || row.Student?.schoolName,

//         // ✅ Program is ALWAYS visible
//         programs: row.programs,
//       };

//       // ✅ Section 2: Success Story
//       if (row.successStoryApproved && row.successStory) {
//         t.successStory = row.successStory;
//       }

//       // ✅ Section 3: Before–After
//       if (row.beforeAfterApproved && row.beforeAfterExpectations) {
//         t.beforeAfterExpectations = row.beforeAfterExpectations;
//       }

//       // ✅ Section 4: Content
//       if (row.contentApproved && row.content) {
//         t.content = row.content;
//       }

//       // ✅ Section 5: Rating
//       if (row.ratingApproved && row.rating) {
//         t.rating = row.rating;
//       }

//       // Optional
//       if (row.experienceDescription) {
//         t.experienceDescription = row.experienceDescription;
//       }

//       if (row.videoLink) {
//         t.videoLink = row.videoLink;
//       }

//       return t;
//     });

//     // ❗ Only remove testimonials that have NOTHING approved
//     const visibleTestimonials = testimonials.filter(t =>
//       t.successStory ||
//       t.beforeAfterExpectations ||
//       t.content ||
//       t.rating ||
//       t.experienceDescription
//     );

//     return NextResponse.json({
//       success: true,
//       testimonials: visibleTestimonials,
//     });
//   } catch (err) {
//     console.error("Testimonials API error:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch testimonials" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const rows = await prisma.testimonial.findMany({
      where: {
        OR: [
          { contentApproved: true },
          { successStoryApproved: true },
          { ratingApproved: true },
        ],
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
      const t: any = {
        id: row.id,
        studentName: row.studentName || row.Student?.name,
        grade: row.grade || row.Student?.grade,
        school: row.school || row.Student?.schoolName,
        programs: row.programs,
      };

      // ✅ Include only allowed sections (NO before/after)

      if (row.successStoryApproved && row.successStory) {
        t.successStory = row.successStory;
      }

      if (row.contentApproved && row.content) {
        t.content = row.content;
      }

      if (row.ratingApproved && row.rating) {
        t.rating = row.rating;
      }

      if (row.experienceDescription) {
        t.experienceDescription = row.experienceDescription;
      }

      if (row.videoLink) {
        t.videoLink = row.videoLink;
      }

      return t;
    });

    // Extra safety: remove testimonials that have no approved visible section
    const visibleTestimonials = testimonials.filter(
      (t) =>
        t.successStory ||
        t.content ||
        t.rating
    );

    return NextResponse.json({
      success: true,
      testimonials: visibleTestimonials,
    });
  } catch (err) {
    console.error("Home Testimonials API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
