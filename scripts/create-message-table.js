#!/usr/bin/env node

/**
 * This script ensures the Message table exists in the database
 */

import { PrismaClient } from '../generated/prisma/index.js';

export async function createMessageTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating Message table if it does not exist...');
    
    // Execute raw SQL to create the Message table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT NOT NULL,
        "senderId" INTEGER NOT NULL,
        "senderRole" TEXT NOT NULL,
        "recipientId" INTEGER NOT NULL,
        "recipientRole" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
        CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Check if the table was created by trying to query it
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Message'
        );
      `;
      console.log('Message table exists:', tableExists[0].exists);
    } catch (error) {
      console.error('Error checking if table exists:', error);
      throw error;
    }
    
    console.log('Message table creation completed.');
  } catch (error) {
    console.error('Error creating Message table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createMessageTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}