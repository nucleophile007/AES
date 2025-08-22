import { NextResponse } from 'next/server';

// Note: After updating the schema, you'll need to run:
// 1. npx prisma generate  
// 2. npx prisma db push (to update database)

// Only allow GET requests for availability data
export async function GET(request: Request) {
  let prisma: any;
  
  try {
    // Import Prisma client from the custom output location
    const { PrismaClient } = await import('../../../generated/prisma');
    prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const program = searchParams.get('program');

    // For now, return empty data since the new models aren't generated yet
    // This will work once you run: npx prisma generate && npx prisma db push
    
    try {
      // Fetch ALL availability rows for the program (including multiple rows per date)
      const availabilityData = await prisma.availabilityDay.findMany({
        where: program ? { program } : {},
        select: {
          id: true,
          date: true,
          times: true,
          program: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' } // Order by creation time to handle multiple entries per date
        ]
      });

      console.log('Query params:', { program });
      console.log('Found availability rows:', availabilityData.length);

      // Aggregate multiple rows for the same date by combining their time slots
      const aggregatedData = availabilityData.reduce((acc: any[], row: any) => {
        const existingDateIndex = acc.findIndex(item => item.date === row.date);
        
        if (existingDateIndex >= 0) {
          // Date already exists, merge the time slots
          const existingTimes = Array.isArray(acc[existingDateIndex].times) 
            ? acc[existingDateIndex].times 
            : [];
          const newTimes = Array.isArray(row.times) ? row.times : [];
          
          // Combine and deduplicate time slots
          const combinedTimes = [...new Set([...existingTimes, ...newTimes])];
          
          acc[existingDateIndex].times = combinedTimes;
          console.log(`Merged times for ${row.date}:`, combinedTimes);
        } else {
          // New date, add the row
          acc.push({
            id: row.id,
            date: row.date,
            times: Array.isArray(row.times) ? row.times : [],
            program: row.program,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          });
        }
        
        return acc;
      }, []);

      console.log('Aggregated availability data:', aggregatedData);

      return NextResponse.json({
        success: true,
        data: aggregatedData,
        totalRows: availabilityData.length,
        aggregatedDates: aggregatedData.length,
      });
    } catch (modelError) {
      // Model doesn't exist yet - return instructions
      return NextResponse.json({
        success: false,
        error: 'Database models not ready. Please run: npx prisma generate && npx prisma db push',
        data: [],
        instructions: [
          'Run: npx prisma generate',
          'Run: npx prisma db push',
          'Restart your development server'
        ]
      });
    }

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch availability data',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    );
  } finally {
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
  }
}

// Explicitly reject all other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch availability data.' },
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch availability data.' },
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch availability data.' },
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch availability data.' },
    { status: 405, headers: { 'Allow': 'GET' } }
  );
}
