/**
 * Migration Script: Convert ClassSchedule startTime/endTime strings to startDateTime/endDateTime
 * 
 * IMPORTANT: Run this script AFTER running `npx prisma db push`
 * 
 * This script:
 * 1. Reads all existing ClassSchedule records
 * 2. Assumes existing times are in America/Los_Angeles timezone
 * 3. Converts them to UTC DateTime values
 * 4. Updates the new startDateTime/endDateTime fields
 * 
 * Usage: npx tsx scripts/migrate-schedule-times.ts
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// California timezone - this is what your existing data is in
const SOURCE_TIMEZONE = 'America/Los_Angeles';

/**
 * Convert a date and time string from a specific timezone to UTC
 */
function convertToUTC(date: Date, timeStr: string, timezone: string): Date {
  // Parse the date to get year, month, day
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Parse the time string (HH:MM or HH:MM:SS)
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
  
  // Create a date in the local timezone
  // Format: YYYY-MM-DDTHH:MM:SS
  const localDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Create date object (this interprets as local system time)
  const localDate = new Date(localDateStr);
  
  // Get the offset for the specified timezone at this date/time
  const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
  const offset = tzDate.getTime() - utcDate.getTime();
  
  // Convert to UTC by subtracting the offset
  return new Date(localDate.getTime() - offset);
}

async function migrateScheduleTimes() {
  console.log('Starting migration of ClassSchedule times...');
  console.log(`Assuming existing times are in: ${SOURCE_TIMEZONE}\n`);
  
  try {
    // Fetch all schedules that don't have the new DateTime fields populated
    const schedules = await prisma.classSchedule.findMany({
      where: {
        OR: [
          { startDateTime: null },
          { endDateTime: null },
        ],
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        startDateTime: true,
        endDateTime: true,
      },
    });
    
    console.log(`Found ${schedules.length} schedules to migrate\n`);
    
    if (schedules.length === 0) {
      console.log('No schedules need migration. All done!');
      return;
    }
    
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const schedule of schedules) {
      try {
        // Skip if missing required data
        if (!schedule.startTime || !schedule.endTime || !schedule.date) {
          console.log(`⏭️  Skipping schedule ${schedule.id}: missing time/date data`);
          skipped++;
          continue;
        }
        
        // Convert times to UTC DateTimes
        const startDateTime = convertToUTC(schedule.date, schedule.startTime, SOURCE_TIMEZONE);
        const endDateTime = convertToUTC(schedule.date, schedule.endTime, SOURCE_TIMEZONE);
        
        // Update the record with new DateTime values
        await prisma.classSchedule.update({
          where: { id: schedule.id },
          data: {
            startDateTime,
            endDateTime,
            timezone: SOURCE_TIMEZONE, // Record what timezone it was converted from
          },
        });
        
        console.log(`✅ Migrated schedule ${schedule.id}: ${schedule.startTime} ${SOURCE_TIMEZONE} -> ${startDateTime.toISOString()} UTC`);
        migrated++;
      } catch (err) {
        console.error(`❌ Failed to migrate schedule ${schedule.id}:`, err);
        failed++;
      }
    }
    
    console.log('\n========== Migration Complete ==========');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('=========================================\n');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  ClassSchedule Time Migration Script                         ║');
console.log('║  Converting startTime/endTime strings to UTC DateTimes       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

migrateScheduleTimes()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration script failed:', err);
    process.exit(1);
  });

