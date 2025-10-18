#!/usr/bin/env node

/**
 * This script applies Prisma migrations to create missing tables
 * Run this script with: node scripts/apply-migrations.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigrations() {
  try {
    console.log('Checking database status...');
    
    // Create migrations directory if it doesn't exist
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Generate migration
    console.log('Generating migration to create missing tables...');
    await execAsync('npx prisma migrate dev --name create_missing_tables --create-only');
    
    // Apply migration
    console.log('Applying migration...');
    await execAsync('npx prisma migrate deploy');
    
    // Generate Prisma client
    console.log('Regenerating Prisma client...');
    await execAsync('npx prisma generate');
    
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Error applying migrations:', error.message);
    
    // Show more detailed error output
    if (error.stdout) console.log('Output:', error.stdout);
    if (error.stderr) console.log('Error output:', error.stderr);
    
    throw error;
  }
}

// Run if executed directly
applyMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));