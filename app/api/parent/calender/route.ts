import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // STEP 1 — Authenticate parent
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "parent") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const parentEmail = user.email;

    // STEP 2 — Fetch all children of this parent
    const children = await prisma.student.findMany({
      where: { parentEmail, isActivated: true },
      select: { id: true, name: true, email: true },
    });

    if (children.length === 0) {
      return NextResponse.json({ success: true, schedules: [] });
    }

    const childIds = children.map((c) => c.id);

    // STEP 3 — Fetch all schedules for these students (EXACT same logic as student API)
    const schedules = await prisma.classSchedule.findMany({
      where: {
        studentId: { in: childIds },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: "asc",
      },
    });

    // STEP 4 — Format EXACTLY like student endpoint (ISO datetime)
    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      date: schedule.date
        ? new Date(schedule.date).toISOString()
        : null,
      createdAt: schedule.createdAt
        ? new Date(schedule.createdAt).toISOString()
        : null,
      updatedAt: schedule.updatedAt
        ? new Date(schedule.updatedAt).toISOString()
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        schedules: formattedSchedules,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Parent Schedule Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch schedules",
      },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from "next/server";
// import { getUserFromRequest } from "../../../../lib/auth";
// import { prisma } from "../../../../lib/prisma";

// export async function GET(request: NextRequest) {
//   try {
//     // STEP 1 — Authenticate parent
//     const user = await getUserFromRequest(request);
//     if (!user || user.role !== "parent") {
//       console.log("❌ Unauthorized access. User:", user);
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const parentEmail = user.email;
//     console.log("\n==============================");
//     console.log("👨‍👩‍👧 Parent Logged In:", parentEmail);
//     console.log("==============================\n");

//     // STEP 2 — Fetch all children
//     const children = await prisma.student.findMany({
//       where: { parentEmail: parentEmail, isActivated: true },
//       select: { id: true, name: true, email: true },
//     });

//     console.log("🔍 Checking children mapped to parent...");
//     console.log("Total children found:", children.length);

//     if (children.length === 0) {
//       console.log("⚠️ No children found for parent:", parentEmail);
//       return NextResponse.json({
//         success: true,
//         schedules: [],
//         message: "No children mapped to this parent.",
//       });
//     }

//     // PRINT CHILDREN DETAILS
//     children.forEach((child, index) => {
//       console.log(
//         `   → Child ${index + 1}: ID=${child.id}, Name=${child.name}, Email=${child.email}`
//       );
//     });

//     const childIds = children.map((c) => c.id);

//     // STEP 3 — Fetch all schedules for these students
//     console.log("\n📅 Fetching schedules for children IDs:", childIds);

//     const schedules = await prisma.classSchedule.findMany({
//       where: {
//         studentId: { in: childIds },
//       },
//       include: {
//         teacher: { select: { id: true, name: true, email: true } },
//         student: { select: { id: true, name: true, email: true } },
//       },
//       orderBy: {
//         date: "asc",
//       },
//     });

//     console.log("📌 Total schedule records found:", schedules.length);

//     if (schedules.length === 0) {
//       console.log("⚠️ No schedules found for children.");
//     }

//     // Log each schedule's child name
//     schedules.forEach((sch, i) => {
//       console.log(
//         `   → Schedule ${i + 1}: Title=${sch.title}, Date=${sch.date}, Student=${sch.student?.name}`
//       );
//     });

//     // STEP 4 — Format exactly like student API
//     const formattedSchedules = schedules.map((schedule) => ({
//       ...schedule,
//       date: schedule.date ? new Date(schedule.date).toISOString() : null,
//       createdAt: schedule.createdAt
//         ? new Date(schedule.createdAt).toISOString()
//         : null,
//       updatedAt: schedule.updatedAt
//         ? new Date(schedule.updatedAt).toISOString()
//         : null,
//     }));

//     console.log("\n✅ Returning schedules to parent dashboard...\n");

//     return NextResponse.json(
//       {
//         success: true,
//         schedules: formattedSchedules,
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("❌ Parent Calendar API Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Failed to fetch calendar schedules",
//       },
//       { status: 500 }
//     );
//   }
// }
