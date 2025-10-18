#!/usr/bin/env node

/**
 * This script creates the users_view in the database
 * The view is needed for the Message model to work correctly
 * Run it with: node scripts/create-users-view.js
 */

import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createUsersView() {
  const prisma = new PrismaClient();

  try {
    console.log('Creating users_view...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '../prisma/migrations/users_view.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    const result = await prisma.$executeRawUnsafe(sql);
    console.log('✅ users_view created successfully');

    // Test the view
    const users = await prisma.$queryRaw`SELECT * FROM users_view LIMIT 5`;
    console.log('Sample users from the view:', users);

    return result;
  } catch (error) {
    console.error('❌ Error creating users_view:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createUsersView()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createUsersView };