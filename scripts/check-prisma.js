#!/usr/bin/env node

/**
 * This script checks if the Prisma client is properly initialized.
 * Run this script with: node scripts/check-prisma.js
 */

import { prisma } from '../lib/prisma.js';

async function checkPrisma() {
  try {
    console.log('Testing Prisma connection...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('Prisma test query result:', result);
    
    console.log('✅ Prisma is properly initialized and connected!');
    
    // Close the Prisma connection
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Prisma error:', error);
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Run "npx prisma generate" to generate the Prisma client');
    console.log('2. Check your database connection in .env');
    console.log('3. Make sure your database schema matches schema.prisma');
    
    process.exit(1);
  }
}

checkPrisma();