import { PrismaClient } from '../generated/prisma/index.js';

// Print the ClassSchedule model definition to debug type issues
async function checkTypes() {
  const prisma = new PrismaClient();
  try {
    console.log("Checking ClassSchedule model types...");
    
    // Check the existing DB schema
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ClassSchedule'
    `;
    
    console.log("Database schema for ClassSchedule:");
    console.log(result);
    
    console.log("\nChecking Prisma client...");
    // Try to log the Prisma client model
    console.dir(prisma.classSchedule, { depth: 3 });
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkTypes();