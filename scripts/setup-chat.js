#!/usr/bin/env node

/**
 * Thi    console.log('3. Testing Message table access...');
    // Count existing messages
    const messageCount = await prisma.message.count();
    console.log(`Found ${messageCount} existing messages`);
    
    console.log('4. Testing Message creation...');pt sets up everything needed for the chat functionality
 * Run this script with: node scripts/setup-chat.js
 */

import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createUsersView } from './create-users-view.js';
import { createMessageTable } from './create-message-table.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupChat() {
  const prisma = new PrismaClient();

  try {
    console.log('Setting up chat functionality...');
    
    console.log('1. Creating users_view...');
    await createUsersView();
    
    console.log('2. Creating Message table if it does not exist...');
    await createMessageTable();
    
    console.log('3. Testing Message table access...');
    // Count existing messages
    const messageCount = await prisma.message.count();
    console.log(`Found ${messageCount} existing messages`);
    
    console.log('3. Testing Message creation...');
    // Try to create a test message
    try {
      // First find a student and teacher
      const firstTeacher = await prisma.teacher.findFirst();
      const firstStudent = await prisma.student.findFirst();
      
      if (firstTeacher && firstStudent) {
        console.log(`Using teacher ID ${firstTeacher.id} and student ID ${firstStudent.id} for test`);
        
        // Create a test message
        const testMessage = await prisma.message.create({
          data: {
            senderId: firstTeacher.id,
            senderRole: 'teacher',
            recipientId: firstStudent.id,
            recipientRole: 'student',
            content: 'Test message - please ignore',
          }
        });
        
        console.log('Test message created successfully:', testMessage.id);
        
        // Delete the test message
        await prisma.message.delete({
          where: { id: testMessage.id }
        });
        
        console.log('Test message deleted successfully');
      } else {
        console.log('No teachers or students found to create test message');
      }
    } catch (error) {
      console.error('Error creating test message:', error);
    }
    
    console.log('✅ Chat setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up chat:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
setupChat()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));