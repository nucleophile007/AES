#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 AES Message System Diagnostic Tool 🔍\n');

  try {
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // 2. Count entities
    console.log('2️⃣ Checking entity counts...');
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const messageCount = await prisma.message.count();

    console.log(`✓ Students: ${studentCount}`);
    console.log(`✓ Teachers: ${teacherCount}`);
    console.log(`✓ Messages: ${messageCount}\n`);

    // 3. Check users_view (if exists)
    console.log('3️⃣ Checking users_view...');
    try {
      // This will fail if the view doesn't exist
      const viewResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users_view`;
      console.log(`✅ users_view exists with ${viewResult[0].count} rows\n`);
    } catch (viewError) {
      console.log('❌ users_view does not exist or has issues. Create it with:\n');
      console.log('   npm run db:view\n');
      console.log('Error details:', viewError.message, '\n');
    }

    // 4. Show recent messages
    if (messageCount > 0) {
      console.log('4️⃣ Showing most recent messages:');
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      messages.forEach((msg, i) => {
        console.log(`\nMessage ${i + 1}/${messages.length}:`);
        console.log(`ID: ${msg.id}`);
        console.log(`From: ${msg.senderRole} #${msg.senderId} → To: ${msg.recipientRole} #${msg.recipientId}`);
        console.log(`Time: ${new Date(msg.createdAt).toLocaleString()}`);
        console.log(`Content: "${msg.content}"`);
      });
      console.log('\n');
    }

    // 5. Specific student-teacher relationships
    console.log('5️⃣ Looking for student-teacher relationships with messages...');
    const messageConnections = await prisma.$queryRaw`
      SELECT DISTINCT 
        m.senderId, m.senderRole, m.recipientId, m.recipientRole, 
        COUNT(*) as messageCount
      FROM "Message" m
      GROUP BY m.senderId, m.senderRole, m.recipientId, m.recipientRole
      ORDER BY messageCount DESC
    `;

    if (messageConnections.length > 0) {
      console.log(`\nFound ${messageConnections.length} unique conversation(s):`);
      for (const conn of messageConnections) {
        console.log(`- ${conn.senderrole} #${conn.senderid} ↔ ${conn.recipientrole} #${conn.recipientid} (${conn.messagecount} messages)`);
      }
    } else {
      console.log('No message relationships found');
    }
    console.log('\n');

    // 6. Offer to check specific student-teacher connection
    promptForConnection();

  } catch (error) {
    console.error('\n❌ Error during diagnostics:', error);
    await prisma.$disconnect();
    rl.close();
  }
}

async function promptForConnection() {
  rl.question('Would you like to check messages between specific student and teacher? (y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await checkSpecificConnection();
    } else {
      showHelp();
    }
  });
}

async function checkSpecificConnection() {
  rl.question('Enter student ID: ', async (studentId) => {
    rl.question('Enter teacher ID: ', async (teacherId) => {
      try {
        // Convert to numbers
        const sid = parseInt(studentId);
        const tid = parseInt(teacherId);

        console.log(`\n🔍 Checking messages between student #${sid} and teacher #${tid}...\n`);

        // Get student and teacher info
        const student = await prisma.student.findUnique({ where: { id: sid } });
        const teacher = await prisma.teacher.findUnique({ where: { id: tid } });

        if (!student) {
          console.log(`❌ Student #${sid} not found in database.`);
        } else {
          console.log(`Student #${sid}: ${student.name} (${student.email})`);
        }

        if (!teacher) {
          console.log(`❌ Teacher #${tid} not found in database.`);
        } else {
          console.log(`Teacher #${tid}: ${teacher.name} (${teacher.email})`);
        }

        // Check messages in both directions
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              {
                senderId: sid,
                senderRole: 'student',
                recipientId: tid,
                recipientRole: 'teacher'
              },
              {
                senderId: tid,
                senderRole: 'teacher',
                recipientId: sid,
                recipientRole: 'student'
              }
            ]
          },
          orderBy: { createdAt: 'asc' }
        });

        console.log(`\nFound ${messages.length} messages between them:`);
        if (messages.length > 0) {
          messages.forEach((msg, i) => {
            console.log(`\n${i + 1}) ${msg.senderRole === 'student' ? 'Student → Teacher' : 'Teacher → Student'}`);
            console.log(`   "${msg.content}"`);
            console.log(`   (${new Date(msg.createdAt).toLocaleString()})`);
          });
        }

        console.log('\n');
        showHelp();

      } catch (error) {
        console.error('\n❌ Error checking messages:', error);
        showHelp();
      }
    });
  });
}

function showHelp() {
  console.log('\n📋 Diagnostic Summary:');
  console.log('1. To fix missing users_view: run `npm run db:view`');
  console.log('2. To create test messages: visit /api/debug/create-message');
  console.log('3. To browse all messages: visit /api/debug/view-messages');
  console.log('4. To access debug dashboard: visit /api/debug/dashboard');

  rl.question('\nRun again? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      main();
    } else {
      console.log('\n👋 Goodbye!');
      rl.close();
      prisma.$disconnect();
      process.exit(0);
    }
  });
}

// Run the main function
main().catch(async (e) => {
  console.error('Fatal error:', e);
  await prisma.$disconnect();
  rl.close();
  process.exit(1);
});