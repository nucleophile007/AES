import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running migration for ClassSchedule table...');
    
    // Check if the table exists by trying to select from it
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM "ClassSchedule"`;
      console.log('ClassSchedule table already exists');
    } catch (error) {
      console.log('Creating ClassSchedule table...');
      
      // Create the table using raw SQL
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ClassSchedule" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "studentId" INTEGER NOT NULL,
          "teacherId" INTEGER NOT NULL,
          "subject" TEXT NOT NULL,
          "program" TEXT NOT NULL,
          "startTime" TEXT NOT NULL,
          "endTime" TEXT NOT NULL,
          "location" TEXT,
          "isRecurring" BOOLEAN NOT NULL DEFAULT false,
          "recurrence" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ClassSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "ClassSchedule_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS "ClassSchedule_teacherId_idx" ON "ClassSchedule"("teacherId");
        CREATE INDEX IF NOT EXISTS "ClassSchedule_studentId_idx" ON "ClassSchedule"("studentId");
      `;
      
      console.log('ClassSchedule table created successfully');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
